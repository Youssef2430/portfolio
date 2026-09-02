// One compute thread per wavelength. The beam is traced through the prism here,
// once per frame, instead of being re-derived for every pixel: the fragment
// shader only has to draw the polyline each thread leaves behind.
//
// Everything below calls the same optics module the surface shading uses, so
// the rainbow and the glass cannot disagree about what the glass is.

import {
  Params,
  PathSample,
  SPECTRUM_MAX_NM,
  SPECTRUM_MIN_NM,
  SPECTRUM_SAMPLES,
  WALL_Z,
  beam_direction,
  beam_origin,
  to_local_dir,
  to_local_point,
  to_world_dir,
  to_world_point,
} from "./prism-params.wgsl";
import { intersect_prism } from "./prism-geometry.wgsl";
import {
  fresnel,
  glass_extinction,
  glass_ior,
  spectral_rgb,
  transport_inside,
} from "./prism-optics.wgsl";

@group(0) @binding(0) var<uniform> params: Params;
@group(0) @binding(1) var<storage, read_write> paths: array<PathSample>;

const MISS = PathSample(
  vec4f(0.0), vec4f(0.0), vec4f(0.0), vec4f(0.0), vec4f(0.0), vec4f(0.0),
);

@compute @workgroup_size(32)
fn cs_main(@builtin(global_invocation_id) id: vec3u) {
  let index = id.x;
  if (index >= SPECTRUM_SAMPLES) {
    return;
  }

  let position = (f32(index) + 0.5) / f32(SPECTRUM_SAMPLES);
  let wavelength = mix(SPECTRUM_MIN_NM, SPECTRUM_MAX_NM, position);
  let ior = glass_ior(wavelength);
  // Keep the CIE response intact. Equalising every wavelength to the same peak
  // makes red and violet unnaturally loud; the eye is genuinely less sensitive
  // at those endpoints, and retaining that falloff produces a photographic fan.
  let raw_tint = spectral_rgb(wavelength);
  let spectral_gain = mix(3.00, 3.35, params.theme);
  let tint = raw_tint * (spectral_gain / f32(SPECTRUM_SAMPLES));

  let origin = to_local_point(params, beam_origin(params));
  let direction = to_local_dir(params, beam_direction(params));

  let hull = intersect_prism(origin, direction);
  if (hull.hit < 0.5 || hull.near <= 0.0) {
    paths[index] = MISS;
    return;
  }

  // Air -> glass at the entry face.
  let entry = origin + direction * hull.near;
  let entry_normal = hull.near_normal;
  let cos_i = clamp(dot(-direction, entry_normal), 0.0, 1.0);
  let entry_reflectance = fresnel(cos_i, ior);
  let refracted = refract(direction, entry_normal, 1.0 / ior);
  if (dot(refracted, refracted) < 1.0e-7) {
    paths[index] = MISS;
    return;
  }

  // Through the solid, reflecting internally for as long as the exit angle
  // stays past the critical angle.
  let inside = normalize(refracted);
  // Six legs: at the shallow end of the sweep the exit face is past its
  // critical angle and the ray needs several before it finds a way out.
  let path = transport_inside(entry + inside * 0.0015, inside, ior, 6);

  let absorption = exp(-path.path_length * dot(glass_extinction(), vec3f(0.3333)));
  let throughput = (1.0 - entry_reflectance) * path.throughput * absorption * path.escaped;

  let world_entry = to_world_point(params, entry);
  let world_waypoint = to_world_point(params, path.waypoint);
  let world_exit = to_world_point(params, path.position);
  let outgoing = normalize(to_world_dir(params, path.direction));

  // Where the deviated ray finally meets the backdrop. The slight backwards
  // tilt of the source is what makes this finite.
  var reach = 14.0;
  if (outgoing.z < -0.0001) {
    reach = clamp((WALL_Z - world_exit.z) / outgoing.z, 0.0, 14.0);
  }
  // A ray still trapped after six legs keeps its path drawn but throws nothing:
  // dropping the whole sample would make the incoming beam blink out instead.
  if (path.escaped < 0.5) {
    reach = 0.0;
  }

  // The other side of the same Fresnel split: whatever did not refract in
  // bounced off the entry face, and near grazing that is the larger share.
  let turned_away = normalize(to_world_dir(params, reflect(direction, entry_normal)));

  paths[index] = PathSample(
    vec4f(world_entry, 1.0),
    vec4f(world_waypoint, path.bounces),
    vec4f(world_exit, throughput),
    vec4f(world_exit + outgoing * reach, reach),
    vec4f(tint, wavelength),
    vec4f(turned_away, entry_reflectance),
  );
}
