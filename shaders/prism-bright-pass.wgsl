@group(0) @binding(0) var src: texture_2d<f32>;
@group(0) @binding(1) var samp: sampler;

// Only energy above diffuse white blooms. The backdrop sits just under 1.0 in
// linear light, so the threshold has to clear it or the whole panel would glow.
const THRESHOLD: f32 = 1.04;
const KNEE: f32 = 0.32;

@fragment fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  let color = textureSampleLevel(src, samp, uv, 0.0).rgb;
  let luminance = dot(color, vec3f(0.2126, 0.7152, 0.0722));
  let soft = clamp((luminance - THRESHOLD + KNEE) / (2.0 * KNEE), 0.0, 1.0);
  let contribution = max(soft * soft * KNEE, luminance - THRESHOLD);
  return vec4f(color * max(contribution / max(luminance, 0.0001), 0.0), 0.0);
}
