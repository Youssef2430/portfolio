// Dev-only: crops and magnifies a preview render so surface detail can be
// inspected. Usage: node scripts/prism-crop.mjs <in.png> <x> <y> <w> <h> [scale]
import { readFileSync, writeFileSync } from "node:fs";
import { deflateSync, inflateSync } from "node:zlib";

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

function readPng(path) {
  const buf = readFileSync(path);
  let o = 8, w = 0, h = 0;
  const idat = [];
  while (o < buf.length) {
    const len = buf.readUInt32BE(o);
    const type = buf.toString("ascii", o + 4, o + 8);
    if (type === "IHDR") { w = buf.readUInt32BE(o + 8); h = buf.readUInt32BE(o + 12); }
    if (type === "IDAT") idat.push(buf.subarray(o + 8, o + 8 + len));
    o += 12 + len;
  }
  return { w, h, raw: inflateSync(Buffer.concat(idat)) };
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
  ihdr[8] = 8; ihdr[9] = 2;
  writeFileSync(path, Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]));
}

const [file, sx, sy, sw, sh, scaleArg] = process.argv.slice(2);
const x = Number(sx), y = Number(sy), w = Number(sw), h = Number(sh);
const scale = Number(scaleArg ?? 2);
const src = readPng(file);
const stride = src.w * 3 + 1;
const out = Buffer.alloc(w * scale * h * scale * 3);
for (let oy = 0; oy < h * scale; oy++) {
  for (let ox = 0; ox < w * scale; ox++) {
    const i = (Math.min(src.h - 1, y + Math.floor(oy / scale))) * stride + 1 +
      (Math.min(src.w - 1, x + Math.floor(ox / scale))) * 3;
    const o = (oy * w * scale + ox) * 3;
    out[o] = src.raw[i]; out[o + 1] = src.raw[i + 1]; out[o + 2] = src.raw[i + 2];
  }
}
const dest = file.replace(/\.png$/, ".crop.png");
writePng(dest, w * scale, h * scale, out);
console.log(dest);
