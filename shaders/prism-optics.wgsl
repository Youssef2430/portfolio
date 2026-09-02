// Physical optics for the prism. No bindings live here: this module is imported
// by both the render shader and the spectral compute kernel, so every law is
// written once and both agree by construction.

import { intersect_prism } from "./prism-geometry.wgsl";

// Cauchy dispersion, n(lambda) = A + B / lambda^2, fitted so the glass spans
// n(400nm) = 1.644 down to n(700nm) = 1.476. This remains an optically dense
// flint with boosted dispersion for the short throw available in the panel,
// but avoids the exaggerated separation of the previous visual fit.
// backdrop is only a couple of prism-widths, and a real Abbe number would put
// the whole spectrum inside one pixel at that distance.
export fn glass_ior(wavelength_nm: f32) -> f32 {
  let um = wavelength_nm * 0.001;
  return 1.3940 + 0.04000 / (um * um);
}

// Full unpolarised Fresnel reflectance. `cos_i` is measured against the normal
// on the incident side, `eta` is n_transmitted / n_incident. Returns 1 exactly
// when the angle is past the critical angle, so callers can test for total
// internal reflection with the same number.
export fn fresnel(cos_i: f32, eta: f32) -> f32 {
  let ci = clamp(cos_i, 0.0, 1.0);
  let sin_t2 = (1.0 - ci * ci) / (eta * eta);
  if (sin_t2 >= 1.0) {
    return 1.0;
  }
  let ct = sqrt(1.0 - sin_t2);
  let rs = (ci - eta * ct) / (ci + eta * ct);
  let rp = (eta * ci - ct) / (eta * ci + ct);
  return clamp(0.5 * (rs * rs + rp * rp), 0.0, 1.0);
}

// Multi-lobe Gaussian fit to the CIE 1931 colour matching functions
// (Wyman, Sloan & Shirley), then XYZ -> linear sRGB. This is what makes the fan
// read as a real spectrum instead of a hue ramp.
fn skewed_gaussian(x: f32, mu: f32, sigma_low: f32, sigma_high: f32) -> f32 {
  let sigma = select(sigma_high, sigma_low, x < mu);
  let t = (x - mu) / sigma;
  return exp(-0.5 * t * t);
}

export fn spectral_rgb(wavelength_nm: f32) -> vec3f {
  let l = wavelength_nm;
  let x =
    1.056 * skewed_gaussian(l, 599.8, 37.9, 31.0) +
    0.362 * skewed_gaussian(l, 442.0, 16.0, 26.7) -
    0.065 * skewed_gaussian(l, 501.1, 20.4, 26.2);
  let y =
    0.821 * skewed_gaussian(l, 568.8, 46.9, 40.5) +
    0.286 * skewed_gaussian(l, 530.9, 16.3, 31.1);
  let z =
    1.217 * skewed_gaussian(l, 437.0, 11.8, 36.0) +
    0.681 * skewed_gaussian(l, 459.0, 26.0, 13.8);

  let rgb = vec3f(
    3.2406 * x - 1.5372 * y - 0.4986 * z,
    -0.9689 * x + 1.8758 * y + 0.0415 * z,
    0.0557 * x - 0.2040 * y + 1.0570 * z,
  );
  return max(rgb, vec3f(0.0));
}

// Beer-Lambert extinction of the bulk glass, per unit path length. The old
// green-heavy absorption made the light-mode solid read as acrylic. Equal
// channels keep the body genuinely neutral: hue now comes only from dispersion.
export fn glass_extinction() -> vec3f {
  return vec3f(0.052);
}

export struct Transport {
  direction: vec3f,
  position: vec3f,
  // First internal reflection, or the exit face when the ray leaves on its
  // first try. Only used to draw the path; the physics does not need it.
  waypoint: vec3f,
  normal: vec3f,
  throughput: f32,
  path_length: f32,
  bounces: f32,
  escaped: f32,
}

// Marches a ray that is already inside the glass out to air. At every face it
// evaluates Fresnel: past the critical angle the ray is reflected back in and
// the loop runs again, which is where the second and third legs of the internal
// path come from. Returns the direction the light finally leaves with.
export fn transport_inside(
  origin: vec3f,
  direction: vec3f,
  ior: f32,
  max_bounces: i32,
) -> Transport {
  var p = origin;
  var d = normalize(direction);
  var throughput = 1.0;
  var travelled = 0.0;
  var bounces = 0.0;
  var waypoint = origin;

  for (var i = 0; i < max_bounces; i++) {
    let slab = intersect_prism(p, d);
    if (slab.hit < 0.5) {
      return Transport(d, p, waypoint, vec3f(0.0, 0.0, 1.0), throughput, travelled, bounces, 0.0);
    }
    let t = max(slab.far, 0.0);
    p = p + d * t;
    travelled += t;
    if (i == 0) {
      waypoint = p;
    }
    let n = slab.far_normal;

    let cos_i = clamp(dot(d, n), 0.0, 1.0);
    let reflectance = fresnel(cos_i, 1.0 / ior);
    let refracted = refract(d, -n, ior);

    if (reflectance >= 0.9999 || dot(refracted, refracted) < 1.0e-7) {
      // Total internal reflection: all of the energy stays in the glass.
      d = normalize(reflect(d, n));
      p = p + d * 0.0004;
      bounces += 1.0;
      continue;
    }

    throughput *= 1.0 - reflectance;
    return Transport(normalize(refracted), p, waypoint, n, throughput, travelled, bounces, 1.0);
  }

  return Transport(d, p, waypoint, vec3f(0.0, 0.0, 1.0), throughput, travelled, bounces, 0.0);
}
