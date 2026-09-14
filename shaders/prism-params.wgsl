// The interface every stage agrees on: the uniform block, the studio's fixed
// geometry, the prism's orientation, and the layout of one traced spectral path.
// Both the render shader and the compute kernel import this, so the scene they
// describe cannot drift apart.

export struct Params {
  resolution: vec2f,
  pointer: vec2f,
  // Where the prism should sit, as an offset across the panel in [-1, 1]. The
  // host measures this from the DOM so the solid can be aligned with an element
  // below it at any panel size.
  focus: vec2f,
  background: vec4f,
  time: f32,
  theme: f32,
  yaw: f32,
  pitch: f32,
  energy: f32,
  reveal: f32,
  beam_aim: f32,
  beam_height: f32,
}

// The backdrop the prism stands against, and the camera looking at it.
export const WALL_Z: f32 = -1.18;
export const CAMERA_Z: f32 = 5.20;
export const LENS: f32 = 0.295;

// Lifts the solid clear of the copy that tucks under the bottom of the panel.
const PRISM_LIFT: f32 = 0.15;

// params.focus is normalised across the panel, so it has to be scaled by the
// world extent the camera sees at the prism's own depth.
export fn prism_center(params: Params) -> vec3f {
  let half_height = CAMERA_Z * LENS;
  let half_width = half_height * params.resolution.x / max(params.resolution.y, 1.0);
  return vec3f(
    params.focus.x * half_width,
    PRISM_LIFT + params.focus.y * half_height,
    0.0,
  );
}

// How many wavelengths the beam is decomposed into. One compute thread each.
export const SPECTRUM_SAMPLES: u32 = 32u;
export const SPECTRUM_MIN_NM: f32 = 402.0;
export const SPECTRUM_MAX_NM: f32 = 688.0;

// One wavelength's journey, in world space, as written by the compute kernel.
export struct PathSample {
  // xyz: where the beam enters the glass. w: 1 when this wavelength made it
  // through, 0 when it missed the prism entirely.
  entry: vec4f,
  // xyz: the first internal reflection, or the exit face when there is none.
  // w: how many times it was totally internally reflected.
  waypoint: vec4f,
  // xyz: where it leaves the glass. w: fraction of the incident energy left.
  exit: vec4f,
  // xyz: where the outgoing ray meets the backdrop. w: the distance to it.
  landing: vec4f,
  // rgb: this wavelength's colour. a: the wavelength in nanometres.
  tint: vec4f,
  // xyz: the direction the entry face turns away, w: the fraction it turns
  // away. Near grazing incidence that fraction is most of the beam.
  entry_reflection: vec4f,
}

fn rotate_x(p: vec3f, angle: f32) -> vec3f {
  let c = cos(angle);
  let s = sin(angle);
  return vec3f(p.x, c * p.y - s * p.z, s * p.y + c * p.z);
}

fn rotate_y(p: vec3f, angle: f32) -> vec3f {
  let c = cos(angle);
  let s = sin(angle);
  return vec3f(c * p.x + s * p.z, p.y, -s * p.x + c * p.z);
}

export fn prism_yaw(params: Params) -> f32 {
  return 0.055 + params.yaw;
}

export fn prism_pitch(params: Params) -> f32 {
  return 0.030 + params.pitch;
}

// World <-> prism-local. Points carry the translation, directions do not.
export fn to_local_dir(params: Params, v: vec3f) -> vec3f {
  return rotate_x(rotate_y(v, -prism_yaw(params)), -prism_pitch(params));
}

export fn to_world_dir(params: Params, v: vec3f) -> vec3f {
  return rotate_y(rotate_x(v, prism_pitch(params)), prism_yaw(params));
}

export fn to_local_point(params: Params, p: vec3f) -> vec3f {
  return to_local_dir(params, p - prism_center(params));
}

export fn to_world_point(params: Params, p: vec3f) -> vec3f {
  return to_world_dir(params, p) + prism_center(params);
}

// The source is a collimated fibre off to the lower right. It is aimed at the
// middle of the right-hand face, in prism-local coordinates, so the aim point
// follows the solid as it is dragged around; the pointer then walks it up and
// down that face, which is what changes the angle of incidence.
//
// The direction is tilted slightly back towards the backdrop, so the light it
// throws grazes the wall and lands on it instead of escaping parallel to it.
export fn beam_target(params: Params) -> vec3f {
  // Walk along the sloping entry face instead of vertically through space.
  // Keeping the aim point just inside that face means even extreme pointer
  // positions still strike glass while visibly moving the point of incidence.
  let y = clamp(0.20 + params.beam_aim * 0.34, -0.25, 0.58);
  let face_x = (0.620 - y * 0.5) / 0.8660254 - 0.055;
  return to_world_point(params, vec3f(face_x, y, -0.04));
}

// The right-hand entry face, in the prism's own frame: outward normal, and the
// in-plane tangent running up it towards the apex.
const ENTRY_NORMAL: vec3f = vec3f(0.8660254, 0.5, 0.0);
const ENTRY_TANGENT: vec3f = vec3f(-0.5, 0.8660254, 0.0);

// The sweep `beam_height` drives, as a real angle of incidence measured from
// the entry face normal. The ends are chosen for what the optics do there, not
// for how they look:
//
//   14 deg  the refracted ray meets the exit face well past its critical
//           angle, so the exit face reflects instead of transmitting and the
//           beam takes an extra leg inside the solid;
//   ~30 deg the critical angle itself, where that second leg appears;
//   ~49 deg minimum deviation, the widest and cleanest spectrum a prism throws;
//   76 deg  grazing, where Fresnel turns most of the beam away at the surface
//           and only a dim, heavily deviated remainder gets through.
const INCIDENCE_MIN: f32 = 0.244;
const INCIDENCE_MAX: f32 = 1.326;

export fn beam_incidence(params: Params) -> f32 {
  let sweep = clamp(params.beam_height, -1.0, 1.0) * 0.5 + 0.5;
  return mix(INCIDENCE_MIN, INCIDENCE_MAX, sweep);
}

// Built in the prism's own frame so the pointer maps to the angle of incidence
// exactly, whatever the solid's orientation, then handed back in world space.
export fn beam_direction(params: Params) -> vec3f {
  let theta = beam_incidence(params);
  let in_plane = ENTRY_TANGENT * sin(theta) - ENTRY_NORMAL * cos(theta);
  // A slight tilt out of the cross-section so the fan drifts back onto the
  // backdrop rather than running parallel to it forever.
  return to_world_dir(params, normalize(in_plane + vec3f(0.0, 0.0, -0.175)));
}

export fn beam_origin(params: Params) -> vec3f {
  return beam_target(params) - beam_direction(params) * 3.9;
}
