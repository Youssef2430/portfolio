// Dev-only harness: renders the prism shader chain headlessly (Dawn) and writes
// PNGs so the optics can be inspected without a browser.
import { writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { deflateSync } from "node:zlib";
import { resolveShader } from "@vgpu/wgsl/runtime";
import { compute, effect, frame, init, sampler, storage, target } from "vgpu/node";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function crc32(buf) {
  let c, crc = 0xffffffff;
  for (let n = 0; n < buf.length; n++) {
    c = (crc ^ buf[n]) & 0xff;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    crc = c ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

function writePng(path, width, height, rgb) {
  const raw = Buffer.alloc((width * 3 + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (width * 3 + 1)] = 0;
    rgb.copy(raw, y * (width * 3 + 1) + 1, y * width * 3, (y + 1) * width * 3);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; ihdr[9] = 2; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  writeFileSync(path, Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]));
}

async function load(relative) {
  const resolved = await resolveShader({ entry: resolve(root, relative), validate: "off" });
  return { version: 1, wgsl: resolved.wgsl };
}

const WIDTH = Number(process.env.PRISM_W ?? 900);
const HEIGHT = Number(process.env.PRISM_H ?? 470);
const HDR = "rgba16float";
const CLEAR = [0, 0, 0, 0];

const shots = JSON.parse(process.env.PRISM_SHOTS ?? "[]");
if (shots.length === 0) {
  shots.push({ name: "default", pointer: [0.5, 0.5], yaw: 0.08, pitch: 0.035, theme: 0 });
}

const gpu = await init();
const [prism, spectrum, bright, blur, composite] = await Promise.all([
  load("shaders/prism.wgsl"),
  load("shaders/prism-spectrum.wgsl"),
  load("shaders/prism-bright-pass.wgsl"),
  load("shaders/prism-blur.wgsl"),
  load("shaders/prism-composite.wgsl"),
]);

const samp = sampler(gpu, { minFilter: "linear", magFilter: "linear" });
const scene = target(gpu, { size: [WIDTH, HEIGHT], format: HDR });
const bloomH = Math.max(1, Math.min(300, HEIGHT));
const bloomSize = [Math.max(1, Math.round((bloomH * WIDTH) / HEIGHT)), bloomH];
const bloomA = target(gpu, { size: bloomSize, format: HDR });
const bloomB = target(gpu, { size: bloomSize, format: HDR });
const out = target(gpu, { size: [WIDTH, HEIGHT], format: "rgba8unorm" });

function srgbToLinear(c) {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

// The panel is transparent, so the shader has to paint the page's own colour
// behind the glass. These are the two --background values from globals.css.
const PAGE = {
  light: [246 / 255, 247 / 255, 250 / 255],
  dark: [0, 0, 0],
};

function paramsFor(shot) {
  const theme = shot.theme ?? 0;
  const page = theme > 0.5 ? PAGE.dark : PAGE.light;
  return {
    resolution: scene.size,
    pointer: shot.pointer ?? [0.5, 0.5],
    focus: shot.focus ?? [0, 0],
    background: [...page.map(srgbToLinear), 1],
    time: shot.time ?? 2.5,
    theme,
    yaw: shot.yaw ?? 0,
    pitch: shot.pitch ?? 0,
    energy: shot.energy ?? 1,
    reveal: 1,
    beam_aim: shot.beamAim ?? 0,
    beam_height: shot.beamHeight ?? 0,
  };
}

// 32 wavelengths x one PathSample (6 * vec4f).
const paths = storage(gpu, 32 * 96, "read-write");
const spectrumPass = compute(gpu, spectrum, { set: { params: paramsFor({}), paths } });
const sceneEffect = effect(gpu, prism, { set: { params: paramsFor({}), paths } });
const brightEffect = effect(gpu, bright, { set: { samp, src: scene } });
const blurHEffect = effect(gpu, blur, { set: { samp, src: bloomA, blur: { texelSize: bloomA.texelSize, direction: [1, 0] } } });
const blurVEffect = effect(gpu, blur, { set: { samp, src: bloomB, blur: { texelSize: bloomB.texelSize, direction: [0, 1] } } });
const compositeEffect = effect(gpu, composite, {
  set: {
    samp,
    scene,
    bloom: bloomA,
    composite: { bloom_strength: 0.9, theme: 0, background: paramsFor({}).background },
  },
});

for (const shot of shots) {
  const theme = shot.theme ?? 0;
  const params = paramsFor(shot);
  sceneEffect.set({ params });
  spectrumPass.set({ params });
  spectrumPass.dispatch(1);
  compositeEffect.set({
    composite: { bloom_strength: 0.9, theme, background: params.background },
  });

  frame(gpu, (f) => {
    f.pass({ target: scene, clear: CLEAR }, (p) => p.draw(sceneEffect));
    f.pass({ target: bloomA, clear: CLEAR }, (p) => p.draw(brightEffect));
    f.pass({ target: bloomB, clear: CLEAR }, (p) => p.draw(blurHEffect));
    f.pass({ target: bloomA, clear: CLEAR }, (p) => p.draw(blurVEffect));
    f.pass({ target: out, clear: CLEAR }, (p) => p.draw(compositeEffect));
  });

  if (process.env.PRISM_DUMP) {
    const raw = new Float32Array(await paths.read());
    for (let i = 0; i < 32; i += 4) {
      const o = i * 24;
      const f = (n) => raw[o + n].toFixed(2);
      console.log(
        `nm=${raw[o + 19].toFixed(0)} valid=${f(3)} bounces=${f(7)} thr=${f(11)}` +
        ` entry=(${f(0)},${f(1)},${f(2)}) exit=(${f(8)},${f(9)},${f(10)})` +
        ` land=(${f(12)},${f(13)},${f(14)}) reach=${f(15)}` +
        ` refl=${f(23)} refldir=(${f(20)},${f(21)},${f(22)})`,
      );
    }
  }
  const pixels = await out.read();
  // The canvas is premultiplied, so flatten it over the page background.
  const page = (theme > 0.5 ? PAGE.dark : PAGE.light).map((c) => c * 255);
  const rgb = Buffer.alloc(WIDTH * HEIGHT * 3);
  for (let i = 0; i < WIDTH * HEIGHT; i++) {
    const a = pixels[i * 4 + 3] / 255;
    for (let c = 0; c < 3; c++) {
      rgb[i * 3 + c] = Math.round(Math.min(255, pixels[i * 4 + c] + page[c] * (1 - a)));
    }
  }
  const file = resolve(root, `.prism-preview/${shot.name}.png`);
  writePng(file, WIDTH, HEIGHT, rgb);
  console.log(file);
}

gpu.dispose();
