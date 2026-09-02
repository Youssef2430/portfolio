import { compute, effect, frame, init, storage, target } from "vgpu/node";

const gpu = await init();
const buf = storage(gpu, 64, "read-write");

const cs = compute(gpu, `
struct Rec { a: vec4f, b: vec4f }
@group(0) @binding(0) var<storage, read_write> recs: array<Rec>;
@compute @workgroup_size(4)
fn cs_main(@builtin(local_invocation_index) i: u32) {
  recs[i].a = vec4f(f32(i), 1.0, 2.0, 3.0);
  recs[i].b = vec4f(0.25 * f32(i));
}`, { set: { recs: buf } });

const fx = effect(gpu, `
struct Rec { a: vec4f, b: vec4f }
@group(0) @binding(0) var<storage, read_write> recs: array<Rec>;
@fragment fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  return vec4f(recs[2].b.x, recs[1].a.x, recs[3].a.x * 0.25, 1.0);
}`, { set: { recs: buf } });

const out = target(gpu, { size: [4, 4], format: "rgba8unorm" });
cs.dispatch(1);
frame(gpu, (f) => f.pass({ target: out, clear: [0,0,0,1] }, (p) => p.draw(fx)));
console.log("pixel:", Array.from((await out.read()).slice(0, 4)));
gpu.dispose();
