// Geometry of one solid glass triangular prism, defined twice on purpose:
//
//   sd_prism()        exact rounded signed distance, used to find the silhouette
//                     and the shading normal of the front surface.
//   intersect_prism() exact analytic ray/convex-polyhedron test, used for every
//                     ray that travels *inside* the glass.
//
// The solid is the equilateral cross-section swept along its axis and then
// filleted, so the two agree everywhere except within EDGE_ROUND of an edge.
// Marching is only needed for the first hit; the interior is closed-form, which
// is what makes many spectral bounces affordable.

// Distance from the axis to a side face, after filleting.
export const APOTHEM: f32 = 0.620;
// Half the extrusion along the prism axis, after filleting.
// A deeper body makes the rear triangular face visibly inset from the front
// when viewed nearly head-on, exposing the three inward-looking side planes.
export const HALF_DEPTH: f32 = 0.620;
// Fillet radius applied to every edge and corner.
export const EDGE_ROUND: f32 = 0.078;

const SQRT3: f32 = 1.7320508075688772;

// Half the side length of the sharp core triangle that the fillet is grown from.
const CORE_HALF_SIDE: f32 = (APOTHEM - EDGE_ROUND) * SQRT3;
const CORE_HALF_DEPTH: f32 = HALF_DEPTH - EDGE_ROUND;

// Exact Euclidean signed distance to an equilateral triangle whose sides are
// 2 * half_side long, centred on its own centroid, apex towards +y.
export fn sd_triangle(point: vec2f, half_side: f32) -> f32 {
  var p = point;
  p.x = abs(p.x) - half_side;
  p.y = p.y + half_side / SQRT3;
  if (p.x + SQRT3 * p.y > 0.0) {
    p = vec2f(p.x - SQRT3 * p.y, -SQRT3 * p.x - p.y) * 0.5;
  }
  p.x = p.x - clamp(p.x, -2.0 * half_side, 0.0);
  return -length(p) * sign(p.y);
}

// The cross-section at the height the glass actually occupies.
export fn sd_prism_section(xy: vec2f) -> f32 {
  return sd_triangle(xy, CORE_HALF_SIDE) - EDGE_ROUND;
}

// True distance field: exact, so the march below can take full sphere steps.
export fn sd_prism(p: vec3f) -> f32 {
  let section = sd_triangle(p.xy, CORE_HALF_SIDE);
  let w = vec2f(section, abs(p.z) - CORE_HALF_DEPTH);
  return min(max(w.x, w.y), 0.0) + length(max(w, vec2f(0.0))) - EDGE_ROUND;
}

export fn prism_normal(p: vec3f) -> vec3f {
  let e = 0.0009;
  let k0 = vec3f(1.0, -1.0, -1.0);
  let k1 = vec3f(-1.0, -1.0, 1.0);
  let k2 = vec3f(-1.0, 1.0, -1.0);
  let k3 = vec3f(1.0, 1.0, 1.0);
  return normalize(
    k0 * sd_prism(p + k0 * e) +
    k1 * sd_prism(p + k1 * e) +
    k2 * sd_prism(p + k2 * e) +
    k3 * sd_prism(p + k3 * e)
  );
}

// The five outward face normals of the core polyhedron: three side faces
// (opposite each vertex of the triangle) and the two end caps.
fn face_plane(index: i32) -> vec4f {
  switch (index) {
    // xyz = outward unit normal, w = signed distance from the axis to the face.
    case 0: { return vec4f(0.0, -1.0, 0.0, APOTHEM); }
    case 1: { return vec4f(SQRT3 * 0.5, 0.5, 0.0, APOTHEM); }
    case 2: { return vec4f(-SQRT3 * 0.5, 0.5, 0.0, APOTHEM); }
    case 3: { return vec4f(0.0, 0.0, 1.0, HALF_DEPTH); }
    default: { return vec4f(0.0, 0.0, -1.0, HALF_DEPTH); }
  }
}

export struct Slab {
  near: f32,
  far: f32,
  near_normal: vec3f,
  far_normal: vec3f,
  hit: f32,
}

// Slab clipping against the five half-spaces. Valid from outside *and* inside
// the solid (from inside, `near` comes back negative), which is exactly what
// the internal bounce loop needs.
export fn intersect_prism(ro: vec3f, rd: vec3f) -> Slab {
  var near = -1.0e9;
  var far = 1.0e9;
  var near_normal = vec3f(0.0, 0.0, 1.0);
  var far_normal = vec3f(0.0, 0.0, -1.0);

  for (var i = 0; i < 5; i++) {
    let plane = face_plane(i);
    let normal = plane.xyz;
    let denominator = dot(rd, normal);
    let signed_distance = dot(ro, normal) - plane.w;

    if (abs(denominator) < 1.0e-7) {
      // Parallel to this face: either wholly inside its half-space or missing.
      if (signed_distance > 0.0) {
        return Slab(0.0, 0.0, near_normal, far_normal, 0.0);
      }
      continue;
    }

    let t = -signed_distance / denominator;
    if (denominator < 0.0) {
      if (t > near) {
        near = t;
        near_normal = normal;
      }
    } else {
      if (t < far) {
        far = t;
        far_normal = normal;
      }
    }
    if (near > far) {
      return Slab(0.0, 0.0, near_normal, far_normal, 0.0);
    }
  }

  return Slab(near, far, near_normal, far_normal, 1.0);
}
