import {
  CAMERA_Z,
  LENS,
  prism_center,
  Params,
  PathSample,
  SPECTRUM_SAMPLES,
  WALL_Z,
  beam_direction,
  beam_origin,
  to_local_dir,
  to_local_point,
  to_world_dir,
  to_world_point,
} from "./prism-params.wgsl";
import {
  APOTHEM,
  EDGE_ROUND,
  HALF_DEPTH,
  intersect_prism,
  sd_prism,
  sd_prism_section,
  prism_normal,
} from "./prism-geometry.wgsl";
import {
  fresnel,
  glass_extinction,
  glass_ior,
  spectral_rgb,
  transport_inside,
} from "./prism-optics.wgsl";

@group(0) @binding(0) var<uniform> params: Params;
@group(0) @binding(1) var<storage, read> paths: array<PathSample>;

// Spectral bands used for transmission through the body of the glass. The beam
// itself is resolved far more finely, in the compute pass.
const BANDS: i32 = 6;

fn local_point(p: vec3f) -> vec3f {
  return to_local_point(params, p);
}

fn local_dir(v: vec3f) -> vec3f {
  return to_local_dir(params, v);
}

fn world_dir(v: vec3f) -> vec3f {
  return to_world_dir(params, v);
}

fn world_point(p: vec3f) -> vec3f {
  return to_world_point(params, p);
}

fn hash21(p: vec2f) -> f32 {
  return fract(sin(dot(p, vec2f(127.1, 311.7))) * 43758.5453123);
}

fn value_noise(p: vec2f) -> f32 {
  let cell = floor(p);
  let f = fract(p);
  let u = f * f * (3.0 - 2.0 * f);
  let a = hash21(cell);
  let b = hash21(cell + vec2f(1.0, 0.0));
  let c = hash21(cell + vec2f(0.0, 1.0));
  let d = hash21(cell + vec2f(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

// Few octaves and a steep rolloff: this is defocused shadow, not grain.
fn fbm(p: vec2f) -> f32 {
  var value = 0.0;
  var amplitude = 0.56;
  var q = p;
  for (var octave = 0; octave < 3; octave++) {
    value += amplitude * value_noise(q);
    q = q * 2.11 + vec2f(1.7, 9.2);
    amplitude *= 0.38;
  }
  return value / 0.856;
}

// Key softbox, high and to the camera's left, plus a cooler kicker on the right.
fn key_direction() -> vec3f {
  return normalize(vec3f(-0.30, 0.44, 0.85));
}

// A big soft source with a hot core, the way a studio softbox behaves: the wide
// lobe fills the faces, the core is what draws the glossy line down each fillet.
fn softbox(rd: vec3f) -> vec3f {
  let key = dot(rd, key_direction());
  let spread = smoothstep(0.34, 0.94, key);
  let core = smoothstep(0.972, 0.9997, key);
  let kicker = smoothstep(0.912, 0.9992, dot(rd, normalize(vec3f(0.80, -0.26, 0.54))));
  let fill = smoothstep(0.930, 0.9994, dot(rd, normalize(vec3f(-0.16, -0.62, 0.77))));
  // Long studio flags are what create recognisable bands across clear glass.
  // They are only visible through reflection/refraction, never on the page.
  let strip_a = exp(-pow((rd.y - rd.x * 0.17 - 0.10) * 31.0, 2.0)) *
    smoothstep(-0.96, -0.18, rd.x) * smoothstep(0.94, 0.16, rd.x);
  let strip_b = exp(-pow((rd.x + rd.y * 0.14 + 0.34) * 24.0, 2.0)) *
    smoothstep(-0.65, 0.38, rd.y) * smoothstep(0.92, 0.18, rd.y);
  let warm = vec3f(1.0);
  let cool = mix(vec3f(0.88, 0.93, 1.00), vec3f(0.62, 0.78, 1.0), params.theme);
  // The wide lobe fills the faces; the three cores are what draw the bright
  // lines down the fillets that make a glass edge look like a glass edge.
  let sources = warm * (spread * 0.26 + core * 15.0 + strip_a * 3.8) +
    cool * (kicker * 5.0 + fill * 3.2 + strip_b * 2.6);
  // On white, the full dark-scene source intensity turns broad face
  // reflections into an opaque patch. Edge Fresnel remains independently hot.
  return sources * mix(0.10, 1.0, params.theme);
}

// Motes of dust hanging in front of the backdrop, picked out by the beam. They
// fade off well inside the panel so the canvas never reads as a lit rectangle
// sitting on the page.
fn dust(wall_point: vec3f) -> f32 {
  let scaled = wall_point.xy * 24.0;
  let cell = floor(scaled);
  let seed = hash21(cell);
  if (seed < 0.982) {
    return 0.0;
  }
  let jitter = vec2f(hash21(cell + vec2f(11.3, 4.7)), hash21(cell + vec2f(27.7, 19.1)));
  let offset = fract(scaled) - jitter;
  let mote = exp(-dot(offset, offset) * 240.0);
  let toward_prism = wall_point.xy - prism_center(params).xy;
  let reach = exp(-dot(toward_prism, toward_prism) * 0.20);
  return mote * reach * (0.35 + hash21(cell + vec2f(5.1, 2.3)) * 0.9);
}

// What the panel shows where nothing is in the way: the page, and nothing else.
// Anything painted here would have to fade out before the canvas border or the
// panel would announce itself as a rectangle on the page.
fn backdrop(wall_point: vec3f) -> vec3f {
  return params.background.rgb + vec3f(dust(wall_point) * params.theme * 0.85);
}

// What the glass sees of that same backdrop. Looking through a slab of glass at
// a flat fill gives back a flat fill, so the solid would have nothing to bend
// and would read as a ceramic tile. The room's shading lives here, where only
// refraction and reflection can reach it, and never on the visible page.
fn wall_texture(wall_point: vec3f) -> vec3f {
  let p = wall_point.xy;
  let to_pool = p - vec2f(1.45, 1.05);
  let pool = exp(-dot(to_pool, to_pool) * 0.115);
  var level = mix(0.600, 1.010, pool);
  let clouds = fbm(p * 0.72 + vec2f(3.10, 1.70));
  level *= mix(0.930, 1.038, smoothstep(0.18, 0.84, clouds));
  let fibres = value_noise(p * 96.0 + vec2f(7.2, 18.4));
  let paper_strength = mix(0.030, 0.016, params.theme);
  let paper = 1.0 + (fibres - 0.5) * paper_strength +
    (hash21(floor(p * 380.0)) - 0.5) * 0.010;
  return params.background.rgb * level * paper;
}

fn environment(origin: vec3f, direction: vec3f) -> vec3f {
  var color: vec3f;
  let toward_wall = direction.z < -0.0001;
  let travel = select(-1.0, (WALL_Z - origin.z) / direction.z, toward_wall);
  if (toward_wall && travel > 0.0) {
    color = wall_texture(origin + direction * travel);
  } else {
    // The half of the room on the camera's side. Glass only looks like glass if
    // what it reflects and refracts has range, so this side of the studio runs
    // from a dark table below to the bright ceiling scrim above.
    let vertical = clamp(direction.y, -1.0, 1.0);
    let table = smoothstep(-0.10, -0.78, vertical);
    let ceiling = smoothstep(0.10, 0.88, vertical);
    let room = mix(1.0, 1.70, ceiling) * mix(1.0, 0.47, table);
    color = params.background.rgb * room;
    // Negative fill cards give polished transparent surfaces dark shapes to
    // reflect. Without them every direction in a light theme is near-white and
    // even physically correct Fresnel looks like featureless acrylic.
    let card_a = (1.0 - smoothstep(0.035, 0.26, abs(direction.x + direction.y * 0.22 + 0.08))) *
      smoothstep(-0.72, 0.24, direction.y);
    let card_b = (1.0 - smoothstep(0.025, 0.19, abs(direction.y - direction.x * 0.12 + 0.29))) *
      smoothstep(-0.82, 0.55, direction.x);
    let card = clamp(card_a * 0.72 + card_b * 0.46, 0.0, 1.0);
    color *= 1.0 - card * mix(0.66, 0.34, params.theme);
  }
  return color + softbox(direction);
}

struct March {
  distance: f32,
  hit: f32,
  coverage: f32,
}

// The rounded solid is inscribed in the same convex polyhedron the interior
// tracer uses, so that hull brackets the march exactly: no steps are spent
// crossing empty space, and near-tangent rays still converge.
//
// Sphere tracing on an exact distance field means steps are full length, and
// the running cone ratio yields a sub-pixel coverage estimate for free, which
// is what antialiases the silhouette.
fn march(ro: vec3f, rd: vec3f) -> March {
  let local_ro = local_point(ro);
  let local_rd = local_dir(rd);
  let hull = intersect_prism(local_ro, local_rd);
  if (hull.hit < 0.5 || hull.far < 0.0) {
    return March(0.0, 0.0, 0.0);
  }

  var t = max(hull.near, 0.0);
  let limit = hull.far + EDGE_ROUND * 2.0;
  var closest = 1.0e9;
  let pixel_cone = LENS * 2.0 / max(params.resolution.y, 1.0);

  for (var step = 0; step < 96; step++) {
    let d = sd_prism(local_ro + local_rd * t);
    if (d < 0.00035) {
      return March(t, 1.0, 1.0);
    }
    closest = min(closest, d / max(t * pixel_cone, 1.0e-6));
    t += max(d, 0.00035);
    if (t > limit) {
      break;
    }
  }
  return March(t, 0.0, clamp(1.0 - closest, 0.0, 1.0));
}

// Reflection plus spectrally resolved transmission. Each band is refracted at
// the entry face with its own index, carried through the solid by
// transport_inside (which handles total internal reflection), attenuated by
// Beer-Lambert, and finally resolved against the room.
fn shade_glass(world_p: vec3f, rd: vec3f, normal: vec3f) -> vec3f {
  let cos_i = clamp(dot(-rd, normal), 0.0, 1.0);
  let reference_ior = glass_ior(550.0);
  let reflectance = fresnel(cos_i, reference_ior);
  let material_reflectance = mix(min(0.34, reflectance * 2.35 + 0.012), reflectance, params.theme);

  // The body stays optically smooth; a very low-amplitude micro-normal only
  // breaks up the reflected studio strips. This is closer to polished cast
  // glass than applying visible grain or noise to the transmitted image.
  let frame_axis = select(vec3f(0.0, 1.0, 0.0), vec3f(1.0, 0.0, 0.0), abs(normal.y) > 0.82);
  let tangent = normalize(cross(frame_axis, normal));
  let bitangent = normalize(cross(normal, tangent));
  let detail_uv = world_p.xy * 47.0 + vec2f(world_p.z * 31.0, -world_p.z * 23.0);
  let micro_x = (value_noise(detail_uv) - 0.5) * 2.0;
  let micro_y = (value_noise(detail_uv * 1.73 + vec2f(17.4, 3.1)) - 0.5) * 2.0;
  let micro_normal = normalize(normal + tangent * micro_x * 0.014 + bitangent * micro_y * 0.010);
  let reflected_direction = normalize(reflect(rd, micro_normal));
  let sharp_reflection = environment(world_p, reflected_direction);
  let soft_reflection = (
    sharp_reflection +
    environment(world_p, normalize(reflected_direction + tangent * 0.038)) +
    environment(world_p, normalize(reflected_direction - bitangent * 0.038))
  ) / 3.0;
  let reflection = mix(sharp_reflection, soft_reflection, 0.20) * material_reflectance;

  let local_p = local_point(world_p);
  let local_d = local_dir(rd);
  let local_n = local_dir(normal);

  var transmitted = vec3f(0.0);
  var band_total = vec3f(0.0);
  for (var i = 0; i < BANDS; i++) {
    let wavelength = mix(408.0, 678.0, (f32(i) + 0.5) / f32(BANDS));
    let band = spectral_rgb(wavelength);
    band_total += band;

    let ior = glass_ior(wavelength);
    let inside = refract(local_d, local_n, 1.0 / ior);
    if (dot(inside, inside) < 1.0e-7) {
      continue;
    }
    let entry_transmittance = 1.0 - fresnel(cos_i, ior);
    let path = transport_inside(local_p + normalize(inside) * 0.0012, inside, ior, 4);
    let absorption = exp(-path.path_length * glass_extinction());
    let radiance = environment(world_point(path.position), world_dir(path.direction));
    transmitted += band * radiance * absorption * entry_transmittance * path.throughput;
  }
  transmitted /= max(band_total, vec3f(1.0e-4));
  transmitted *= (1.0 - material_reflectance) / max(1.0 - reflectance, 0.001);

  // Polished edges collect a broad Fresnel glint even when the main softbox is
  // not at the exact mirror angle. It is neutral in light mode and cool in
  // dark mode, which prevents the former mint-plastic appearance.
  let rim = pow(1.0 - cos_i, 3.4) * mix(
    vec3f(0.69, 0.73, 0.80),
    vec3f(0.42, 0.58, 0.88),
    params.theme,
  ) * 0.64;
  let glass_color = reflection + transmitted + rim;
  let glass_luminance = dot(glass_color, vec3f(0.2126, 0.7152, 0.0722));
  let neutral_glass = vec3f(glass_luminance) * vec3f(0.985, 1.000, 1.022);
  // The light-theme studio is white-balanced independently from the spectral
  // caustic. Only a trace of environmental chroma remains in the material;
  // wavelength color belongs to the beam, not to the glass body.
  let light_glass = mix(neutral_glass, glass_color, 0.10);
  return mix(light_glass, glass_color, params.theme);
}

// Closest approach between the camera ray and a finite segment of beam.
fn ray_segment_distance(ro: vec3f, rd: vec3f, a: vec3f, b: vec3f) -> f32 {
  let ba = b - a;
  let oa = ro - a;
  let baba = dot(ba, ba);
  let bard = dot(ba, rd);
  let baoa = dot(ba, oa);
  let rdoa = dot(rd, oa);
  let denominator = max(baba - bard * bard, 1.0e-5);
  let along = clamp((baoa - bard * rdoa) / denominator, 0.0, 1.0);
  let ray_t = max(0.0, bard * along - rdoa);
  return length((a + ba * along) - (ro + rd * ray_t));
}

struct StructureLines {
  rear: f32,
  rails: f32,
}

fn segment_line(ro: vec3f, rd: vec3f, a: vec3f, b: vec3f, width: f32) -> f32 {
  let d = ray_segment_distance(ro, rd, a, b);
  return exp(-(d * d) / (width * width));
}

// The rear face and the three depth rails are visible through the front pane.
// Perspective makes the rear triangle project smaller, producing the
// inward-looking side planes in the reference sketch without faking a hole.
fn prism_structure(ro: vec3f, rd: vec3f) -> StructureLines {
  let half_side = APOTHEM * 1.7320508075688772 * 0.94;
  let floor_y = -APOTHEM * 0.94;
  let apex_y = APOTHEM * 1.88;
  let front_z = HALF_DEPTH - 0.018;
  let rear_z = -HALF_DEPTH + 0.028;

  let f0 = world_point(vec3f(-half_side, floor_y, front_z));
  let f1 = world_point(vec3f(half_side, floor_y, front_z));
  let f2 = world_point(vec3f(0.0, apex_y, front_z));
  let r0 = world_point(vec3f(-half_side, floor_y, rear_z));
  let r1 = world_point(vec3f(half_side, floor_y, rear_z));
  let r2 = world_point(vec3f(0.0, apex_y, rear_z));

  let rear =
    segment_line(ro, rd, r0, r1, 0.0085) +
    segment_line(ro, rd, r1, r2, 0.0085) +
    segment_line(ro, rd, r2, r0, 0.0085);
  let rails =
    segment_line(ro, rd, f0, r0, 0.0065) +
    segment_line(ro, rd, f1, r1, 0.0065) +
    segment_line(ro, rd, f2, r2, 0.0065);
  return StructureLines(clamp(rear, 0.0, 1.0), clamp(rails, 0.0, 1.0));
}

// A pencil of light crossing a room with a little haze in it: the bright core
// is the beam itself, the wide skirt is what the air scatters sideways.
fn beam_glow(ro: vec3f, rd: vec3f, a: vec3f, b: vec3f, radius: f32) -> f32 {
  let d = ray_segment_distance(ro, rd, a, b);
  let core = exp(-(d * d) / (radius * radius));
  let scatter = exp(-d / (radius * 4.0));
  return core + scatter * 0.017;
}

// Every wavelength the compute pass resolved, drawn as the polyline it actually
// travelled: white into the glass, split inside it, fanned out on the way to
// the backdrop, and pooling where it lands.
fn spectral_light(ro: vec3f, rd: vec3f, wall_point: vec3f) -> vec3f {
  var light = vec3f(0.0);
  let source = beam_origin(params);
  let centre = paths[SPECTRUM_SAMPLES / 2u];
  let white = vec3f(1.0);
  let incoming_strength = mix(0.70, 0.92, params.theme);
  let internal_strength = mix(0.82, 0.62, params.theme);
  let fan_radius = mix(0.030, 0.024, params.theme);
  let fan_strength = mix(1.38, 1.55, params.theme);
  let landing_strength = mix(0.88, 1.05, params.theme);

  if (centre.entry.w > 0.5) {
    light += white * beam_glow(ro, rd, source, centre.entry.xyz, 0.0125) * incoming_strength;
  } else {
    // Nothing to disperse: the beam simply crosses the frame.
    light += white * beam_glow(ro, rd, source, source + beam_direction(params) * 12.0, 0.0125) * incoming_strength;
    return light;
  }

  for (var i = 0u; i < SPECTRUM_SAMPLES; i++) {
    let sample = paths[i];
    if (sample.entry.w < 0.5) {
      continue;
    }
    let tint = sample.tint.rgb * sample.exit.w;

    // Inside the glass the wavelengths have already separated, but only by a
    // fraction of a degree, so this reads as one slightly iridescent cord.
    light += tint * beam_glow(ro, rd, sample.entry.xyz, sample.waypoint.xyz, 0.0125) * internal_strength;
    if (sample.waypoint.w > 0.5) {
      let bounce_visibility = 1.0 + min(sample.waypoint.w, 2.0) * 0.34;
      light += tint * beam_glow(ro, rd, sample.waypoint.xyz, sample.exit.xyz, 0.0125) *
        internal_strength * bounce_visibility;
    }

    // Out into the room. This is the leg that fans.
    light += tint * beam_glow(ro, rd, sample.exit.xyz, sample.landing.xyz, fan_radius) * fan_strength;

    // ...and the light it actually deposits on the backdrop.
    let offset = wall_point - sample.landing.xyz;
    light += tint * exp(-dot(offset, offset) * 14.0) * landing_strength;
  }
  return light;
}

// The beam runs off the side of the panel. The backdrop already fades to the
// page colour before the border; the light has to do the same, or the canvas
// announces itself as a rectangle.
fn edge_fade(uv: vec2f) -> f32 {
  let q = min(uv, vec2f(1.0) - uv);
  return smoothstep(0.0, 0.085, min(q.x, q.y));
}

@fragment
fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  var screen = uv * 2.0 - 1.0;
  screen.y = -screen.y;
  screen.x *= params.resolution.x / max(params.resolution.y, 1.0);

  let ro = vec3f(0.0, 0.0, CAMERA_Z);
  let rd = normalize(vec3f(screen * LENS, -1.0));

  // The backdrop is the base layer: the prism's shadow and the light pool are
  // part of the room, not decoration painted around the object.
  let wall_travel = (WALL_Z - ro.z) / rd.z;
  var color = backdrop(ro + rd * wall_travel);

  let wall_point = ro + rd * wall_travel;
  let hit = march(ro, rd);
  let coverage = select(hit.coverage, 1.0, hit.hit > 0.5);
  if (coverage > 0.001) {
    let p = ro + rd * hit.distance;
    let normal = world_dir(prism_normal(local_point(p)));
    color = mix(color, shade_glass(p, rd, normal), coverage);
  }

  let structure = prism_structure(ro, rd);
  let light_structure = structure.rear * 0.42 + structure.rails * 0.24;
  let dark_structure = structure.rear * 0.18 + structure.rails * 0.11;
  let structure_coverage = clamp(
    mix(light_structure, dark_structure, params.theme),
    0.0,
    0.52,
  );
  let structure_color = mix(
    params.background.rgb * 0.48,
    vec3f(0.52, 0.62, 0.82),
    params.theme,
  );
  color = mix(color, structure_color, structure_coverage * coverage);

  // On a nearly-white surface, a purely additive spectrum converges back to
  // white. The spectrum is intentionally left additive now: retaining the CIE
  // weighting and using a broader fan creates realistic pastel separation.
  let spectral = spectral_light(ro, rd, wall_point) * params.energy * edge_fade(uv);
  color += spectral * mix(1.10, 1.0, params.theme);

  // reveal fades the whole panel back to the flat page colour, so the canvas is
  // invisible until the scene has faded in.
  color = mix(params.background.rgb, color, params.reveal);

  // The presentation pass reconstructs this scene as a transparent overlay
  // over the real DOM background. Keeping the base perfectly flat here is
  // important: synthetic dither on otherwise empty pixels would turn the
  // entire canvas into a faint rectangle.
  return vec4f(max(color, vec3f(0.0)), 0.0);
}
