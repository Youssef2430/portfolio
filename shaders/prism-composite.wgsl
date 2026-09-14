struct Composite {
  bloom_strength: f32,
  theme: f32,
  background: vec4f,
}

@group(0) @binding(0) var scene: texture_2d<f32>;
@group(0) @binding(1) var bloom: texture_2d<f32>;
@group(0) @binding(2) var samp: sampler;
@group(0) @binding(3) var<uniform> composite: Composite;

// Highlight rolloff that is the identity below the knee.
const KNEE: f32 = 0.86;

fn rolloff(x: vec3f) -> vec3f {
  let over = max(x - vec3f(KNEE), vec3f(0.0));
  let compressed = vec3f(1.0) - exp(-over / (1.0 - KNEE));
  return min(x, vec3f(KNEE)) + compressed * (1.0 - KNEE);
}

fn encode_srgb(linear: vec3f) -> vec3f {
  let low = linear * 12.92;
  let high = 1.055 * pow(max(linear, vec3f(0.0031308)), vec3f(1.0 / 2.4)) - 0.055;
  return select(high, low, linear <= vec3f(0.0031308));
}

fn max_channel(value: vec3f) -> f32 {
  return max(value.r, max(value.g, value.b));
}

fn canvas_edge_fade(uv: vec2f) -> f32 {
  let edge = min(min(uv.x, 1.0 - uv.x), min(uv.y, 1.0 - uv.y));
  return smoothstep(0.0, 0.045, edge);
}

@fragment fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  let scene_sample = textureSampleLevel(scene, samp, uv, 0.0);
  let glow = textureSampleLevel(bloom, samp, uv, 0.0).rgb * composite.bloom_strength;
  let background_linear = max(composite.background.rgb, vec3f(0.0));
  // Tone-map only the scene's departure from the page. An untouched pixel is
  // therefore exactly the DOM background even when that background sits above
  // the highlight knee (as the light theme does).
  let rolled = background_linear
    + rolloff(scene_sample.rgb + glow)
    - rolloff(background_linear);
  // `rolled` is already relative to the exact DOM background, so leaving it
  // ungraded preserves both natural spectral weighting and a seamless canvas.
  let mapped = rolled;
  let color = encode_srgb(max(mapped, vec3f(0.0)));
  let background = encode_srgb(background_linear);

  // Find the smallest alpha that can reproduce `color` over `background`
  // while keeping every premultiplied source channel in [0, alpha]. This is
  // exact over the flat theme colour, and it preserves the DOM's real grain
  // and gradients everywhere the glass/light/shadow does not cover them.
  let darkening = max((background - color) / max(background, vec3f(1.0e-4)), vec3f(0.0));
  let brightening = max((color - background) / max(vec3f(1.0) - background, vec3f(1.0e-4)), vec3f(0.0));
  let alpha = clamp(max(max_channel(darkening), max_channel(brightening)), 0.0, 1.0);
  let premultiplied = clamp(
    color - background * (1.0 - alpha),
    vec3f(0.0),
    vec3f(alpha),
  );

  // Bloom is generated after the scene's own edge fade and can otherwise
  // leave a one-pixel canvas boundary. Force the final premultiplied overlay
  // to become exactly transparent before it reaches every canvas edge.
  let edge = canvas_edge_fade(uv);
  return vec4f(premultiplied * edge, alpha * edge);
}
