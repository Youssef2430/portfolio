/** Seeded, local demonstrations. No network or market forecasts. */
export function randomSource(seed: number) {
  let state = seed >>> 0;
  const uniform = () => {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    return (state + 1) / 4294967297;
  };
  const normal = () =>
    Math.sqrt(-2 * Math.log(uniform())) * Math.cos(2 * Math.PI * uniform());
  const poisson = (lambda: number) => {
    let n = 0,
      p = 1;
    do {
      n++;
      p *= uniform();
    } while (p > Math.exp(-lambda));
    return n - 1;
  };
  return { uniform, normal, poisson };
}
export const mean = (xs: number[]) =>
  xs.reduce((a, b) => a + b, 0) / Math.max(1, xs.length);
export const variance = (xs: number[]) => {
  const m = mean(xs);
  return xs.reduce((a, x) => a + (x - m) ** 2, 0) / Math.max(1, xs.length - 1);
};
export function covariance(a: number[], b: number[]) {
  const ma = mean(a),
    mb = mean(b);
  return (
    a.reduce((s, x, i) => s + (x - ma) * (b[i] - mb), 0) /
    Math.max(1, a.length - 1)
  );
}
export function correlation(a: number[], b: number[]) {
  return covariance(a, b) / (Math.sqrt(variance(a) * variance(b)) || 1);
}
export function quantile(sorted: number[], q: number) {
  const i = (sorted.length - 1) * q,
    lo = Math.floor(i);
  return (
    sorted[lo] +
    (sorted[Math.min(lo + 1, sorted.length - 1)] - sorted[lo]) * (i - lo)
  );
}
export function histogram(xs: number[], count = 32) {
  const min = Math.min(...xs),
    max = Math.max(...xs),
    width = (max - min || 1) / count;
  const bins = Array.from({ length: count }, (_, i) => ({
    x: min + (i + 0.5) * width,
    y: 0,
  }));
  for (const x of xs)
    bins[Math.min(count - 1, Math.floor((x - min) / width))].y++;
  return bins;
}
export function rollingVolatility(
  prices: number[],
  window = 20,
  periods = 252,
) {
  const returns = prices.slice(1).map((p, i) => Math.log(p / prices[i]));
  return returns
    .slice(window - 1)
    .map((_, i) => ({
      x: i + window,
      y: Math.sqrt(variance(returns.slice(i, i + window)) * periods) * 100,
    }));
}
export function simulateMarket(
  seed = 42,
  count = 6000,
  beta = 15,
  lambda = 0.05,
) {
  const rng = randomSource(seed);
  return Array.from({ length: count }, () => {
    const r = 0.000474 + 0.013504 * rng.normal();
    const logV = -3.5 + beta * Math.abs(r) + 0.3 * rng.normal();
    let z = 0;
    for (let j = rng.poisson(lambda); j > 0; j--) z += 0.02 * rng.normal();
    return {
      r,
      v: Math.exp(logV),
      logV,
      z,
      loss: -r - 0.5 * logV + 0.3 * Math.abs(z),
    };
  });
}
export function tailRisk(losses: number[], confidence: number) {
  const sorted = [...losses].sort((a, b) => a - b);
  const valueAtRisk = quantile(sorted, confidence);
  return {
    valueAtRisk,
    expectedShortfall: mean(sorted.filter((x) => x >= valueAtRisk)),
  };
}
export function knightMoves(square: number, visited: number[] = [], size = 6) {
  return Array.from({ length: size * size }, (_, i) => i).filter((i) => {
    const dx = Math.abs((i % size) - (square % size)),
      dy = Math.abs(Math.floor(i / size) - Math.floor(square / size));
    return dx * dy === 2 && !visited.includes(i);
  });
}

/** Normal inverse CDF via bisection; sufficient precision for diagnostic plots. */
export function normalQuantile(p: number) {
  let low = -9,
    high = 9;
  for (let i = 0; i < 60; i++) {
    const mid = (low + high) / 2,
      x = Math.abs(mid) / Math.SQRT2;
    const t = 1 / (1 + 0.3275911 * x);
    const erf =
      1 -
      ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) *
        t +
        0.254829592) *
        t *
        Math.exp(-x * x);
    const cdf = 0.5 * (1 + (mid < 0 ? -erf : erf));
    if (cdf < p) low = mid;
    else high = mid;
  }
  return (low + high) / 2;
}
