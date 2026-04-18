// ═══════════════════════════════════════════════
// MAP — Canvas world map, flights, city pins
// ═══════════════════════════════════════════════

const MAP_W = 640;
const MAP_H = 320;

let mapCities = [];
let mapFlights = [];
let mapContinents = [];
let mapTerrain = [];
let animFrameId = null;

function lonLatToXY(lon, lat) {
  const x = (lon + 180) / 360 * MAP_W;
  const y = (90 - lat) / 180 * MAP_H;
  return [x, y];
}

function getThemeColors() {
  const s = getComputedStyle(document.documentElement);
  const g = v => s.getPropertyValue(v).trim();
  return {
    ocean:        g('--map-ocean'),
    oceanLight:   g('--map-ocean-light'),
    oceanWave:    g('--map-ocean-wave'),
    land:         g('--map-land'),
    landLight:    g('--map-land-light'),
    landShadow:   g('--map-land-shadow'),
    stroke:       g('--map-land-stroke'),
    grid:         g('--map-grid'),
    gold:         g('--gold'),
    green:        g('--green'),
    cyan:         g('--cyan'),
    // Terrain
    forest:       g('--terrain-forest'),
    forestLight:  g('--terrain-forest-light'),
    trunk:        g('--terrain-trunk'),
    jungle:       g('--terrain-jungle'),
    jungleLight:  g('--terrain-jungle-light'),
    desert:       g('--terrain-desert'),
    desertLight:  g('--terrain-desert-light'),
    cactus:       g('--terrain-cactus'),
    mountain:     g('--terrain-mountain'),
    mountainLight:g('--terrain-mountain-light'),
    mountainPeak: g('--terrain-mountain-peak'),
    tundra:       g('--terrain-tundra'),
    tundraLight:  g('--terrain-tundra-light'),
    snow:         g('--terrain-snow'),
    savanna:      g('--terrain-savanna'),
    savannaLight: g('--terrain-savanna-light'),
  };
}

// ── Seeded PRNG for deterministic sprite placement ──
function mulberry32(seed) {
  return function() {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

// Pixel unit — keeps everything chunky (≈3 at 640, was 4 at 960)
const P = Math.max(2, Math.round(MAP_W / 240));

// ═══ PIXEL-ART SPRITE DRAWERS ═══
// Each draws a recognizable RPG overworld sprite at (x, y)

function drawTree(ctx, x, y, colors, rng) {
  const big = rng() > 0.4;
  // Trunk
  ctx.fillStyle = colors.trunk;
  ctx.fillRect(x, y, P, P * 2);
  // Round ball canopy (like the reference — a circle-ish shape)
  ctx.fillStyle = colors.forest;
  if (big) {
    //     ██
    //   ██████
    //   ██████
    //     ██
    ctx.fillRect(x - P,   y - P*5, P*3, P);     // top
    ctx.fillRect(x - P*2, y - P*4, P*5, P*2);   // middle (widest)
    ctx.fillRect(x - P,   y - P*2, P*3, P);     // bottom
    // Highlight on upper-left
    ctx.fillStyle = colors.forestLight;
    ctx.fillRect(x - P, y - P*4, P*2, P);
  } else {
    //   ██
    //  ████
    //   ██
    ctx.fillRect(x,      y - P*4, P, P);
    ctx.fillRect(x - P,  y - P*3, P*3, P);
    ctx.fillRect(x,      y - P*2, P, P);
    ctx.fillStyle = colors.forestLight;
    ctx.fillRect(x - P, y - P*3, P, P);
  }
}

function drawJungleTree(ctx, x, y, colors, rng) {
  // Thick trunk
  ctx.fillStyle = colors.trunk;
  ctx.fillRect(x, y, P, P * 3);
  // Wider, lush canopy
  ctx.fillStyle = colors.jungle;
  ctx.fillRect(x - P,   y - P*5, P*3, P);
  ctx.fillRect(x - P*2, y - P*4, P*6, P*2);
  ctx.fillRect(x - P*3, y - P*2, P*7, P);
  ctx.fillStyle = colors.jungleLight;
  ctx.fillRect(x - P, y - P*4, P*3, P);
}

function drawCactus(ctx, x, y, colors) {
  ctx.fillStyle = colors.cactus;
  // Main stem
  ctx.fillRect(x, y - P*4, P, P*5);
  // Left arm
  ctx.fillRect(x - P*2, y - P*3, P*2, P);
  ctx.fillRect(x - P*2, y - P*4, P, P);
  // Right arm
  ctx.fillRect(x + P, y - P, P*2, P);
  ctx.fillRect(x + P*2, y - P*2, P, P);
}

function drawMountain(ctx, x, y, colors, rng) {
  const tall = rng() > 0.3;
  // Dark side (left)
  ctx.fillStyle = colors.mountain;
  if (tall) {
    ctx.fillRect(x - P*4, y,       P*9, P);
    ctx.fillRect(x - P*3, y - P,   P*7, P);
    ctx.fillRect(x - P*2, y - P*2, P*5, P);
    ctx.fillRect(x - P,   y - P*3, P*3, P);
    ctx.fillRect(x,        y - P*4, P,   P);
    ctx.fillRect(x,        y - P*5, P,   P);
    // Lit side (right) — lighter brown
    ctx.fillStyle = colors.mountainLight;
    ctx.fillRect(x + P,    y - P*2, P*3, P);
    ctx.fillRect(x + P*2,  y - P,   P*3, P);
    ctx.fillRect(x + P*3,  y,       P*2, P);
    // Snow peak
    ctx.fillStyle = colors.mountainPeak;
    ctx.fillRect(x,  y - P*5, P,   P);
    ctx.fillRect(x - P, y - P*4, P*3, P);
  } else {
    ctx.fillRect(x - P*3, y,       P*7, P);
    ctx.fillRect(x - P*2, y - P,   P*5, P);
    ctx.fillRect(x - P,   y - P*2, P*3, P);
    ctx.fillRect(x,        y - P*3, P,   P);
    ctx.fillStyle = colors.mountainLight;
    ctx.fillRect(x + P,   y - P,   P*2, P);
    ctx.fillRect(x + P*2, y,       P*2, P);
    ctx.fillStyle = colors.mountainPeak;
    ctx.fillRect(x,  y - P*3, P,   P);
    ctx.fillRect(x - P, y - P*2, P*2, P);
  }
}

function drawSnowPatch(ctx, x, y, colors, rng) {
  ctx.fillStyle = colors.snow;
  if (rng() > 0.5) {
    ctx.fillRect(x - P, y, P*4, P*2);
    ctx.fillRect(x, y - P, P*2, P);
  } else {
    ctx.fillRect(x, y, P*3, P);
    ctx.fillRect(x - P, y + P, P*4, P);
  }
}

function drawGrassTuft(ctx, x, y, colors, rng) {
  ctx.fillStyle = colors.savannaLight;
  ctx.fillRect(x, y, P*2, P);
  ctx.fillRect(x - P, y - P, P, P);
  ctx.fillRect(x + P*2, y - P, P, P);
  if (rng() > 0.7) {
    // Occasional lone acacia
    ctx.fillStyle = colors.trunk;
    ctx.fillRect(x + P*4, y - P, P, P*2);
    ctx.fillStyle = colors.savanna;
    ctx.fillRect(x + P*2, y - P*2, P*5, P);
  }
}

// ═══ TERRAIN FILL + SPRITES ═══
function drawTerrainZone(ctx, type, polyCoords, colors) {
  // Bounding box
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  polyCoords.forEach(([x, y]) => {
    if (x < minX) minX = x; if (x > maxX) maxX = x;
    if (y < minY) minY = y; if (y > maxY) maxY = y;
  });

  const rng = mulberry32(Math.floor(minX * 7 + minY * 13 + type.length * 3));

  ctx.save();
  // Clip to polygon
  ctx.beginPath();
  ctx.moveTo(polyCoords[0][0], polyCoords[0][1]);
  for (let i = 1; i < polyCoords.length; i++) ctx.lineTo(polyCoords[i][0], polyCoords[i][1]);
  ctx.closePath();
  ctx.clip();

  // 1) Biome base fill
  const fills = {
    desert:  colors.desert,
    forest:  colors.land,      // forests sit on green land
    jungle:  colors.land,
    mountain: colors.land,
    tundra:  colors.tundra,
    savanna: colors.savanna,
  };
  ctx.fillStyle = fills[type] || colors.land;
  ctx.fillRect(minX, minY, maxX - minX, maxY - minY);

  // 2) Scatter pixel-art sprites
  const spacing = {
    desert: P * 10, forest: P * 7, jungle: P * 6,
    mountain: P * 9, tundra: P * 7, savanna: P * 9,
  };
  const sp = spacing[type] || P * 8;

  for (let gx = minX; gx < maxX; gx += sp) {
    for (let gy = minY; gy < maxY; gy += sp) {
      // Jitter position
      const sx = Math.floor(gx + rng() * sp * 0.7);
      const sy = Math.floor(gy + rng() * sp * 0.7);
      const r = rng();

      if (type === 'forest') {
        if (r < 0.65) drawTree(ctx, sx, sy, colors, rng);
      } else if (type === 'jungle') {
        if (r < 0.7) drawJungleTree(ctx, sx, sy, colors, rng);
      } else if (type === 'desert') {
        if (r < 0.3) drawCactus(ctx, sx, sy, colors);
        // Sand ripples
        else if (r < 0.5) {
          ctx.fillStyle = colors.desertLight;
          ctx.fillRect(sx - P*2, sy, P*6, P);
        }
      } else if (type === 'mountain') {
        if (r < 0.55) drawMountain(ctx, sx, sy, colors, rng);
      } else if (type === 'tundra') {
        if (r < 0.45) drawSnowPatch(ctx, sx, sy, colors, rng);
      } else if (type === 'savanna') {
        if (r < 0.45) drawGrassTuft(ctx, sx, sy, colors, rng);
      }
    }
  }

  ctx.restore();
}

// ═══ CONTINENT HELPERS ═══
function drawContinentPoly(ctx, poly) {
  ctx.beginPath();
  const [sx, sy] = lonLatToXY(poly[0][0], poly[0][1]);
  ctx.moveTo(sx, sy);
  for (let i = 1; i < poly.length; i++) {
    const [px, py] = lonLatToXY(poly[i][0], poly[i][1]);
    ctx.lineTo(px, py);
  }
  ctx.closePath();
}

function drawMap() {
  const canvas = document.getElementById('map-canvas');
  if (!canvas) return;

  const dpr = window.devicePixelRatio || 1;
  const renderScale = zoomLevel * dpr;

  canvas.width  = MAP_W * renderScale;
  canvas.height = MAP_H * renderScale;

  const ctx = canvas.getContext('2d');
  ctx.scale(renderScale, renderScale);

  const colors = getThemeColors();

  // ── 1) Ocean fill with wave stripes ──
  ctx.fillStyle = colors.ocean;
  ctx.fillRect(0, 0, MAP_W, MAP_H);
  // Alternating darker/lighter wave bands
  for (let y = 0; y < MAP_H; y += P * 3) {
    ctx.fillStyle = colors.oceanWave;
    ctx.fillRect(0, y, MAP_W, P);
    ctx.fillStyle = colors.oceanLight;
    ctx.fillRect(0, y + P, MAP_W, P);
  }

  // ── 2) Continent depth shadow — thick, offset down+right ──
  const SH = P * 3;
  ctx.fillStyle = colors.landShadow;
  mapContinents.forEach(poly => {
    ctx.save();
    ctx.translate(SH, SH);
    drawContinentPoly(ctx, poly);
    ctx.fill();
    ctx.restore();
  });

  // ── 3) Continent main fill ──
  mapContinents.forEach(poly => {
    ctx.fillStyle = colors.land;
    drawContinentPoly(ctx, poly);
    ctx.fill();
  });

  // ── 4) Land top-edge highlight for 3D depth ──
  mapContinents.forEach(poly => {
    drawContinentPoly(ctx, poly);
    ctx.save();
    ctx.clip();
    ctx.fillStyle = colors.landLight;
    ctx.translate(0, -P * 1.5);
    drawContinentPoly(ctx, poly);
    ctx.fill();
    ctx.restore();
  });

  // ── 5) Dark continent outline ──
  ctx.strokeStyle = colors.stroke;
  ctx.lineWidth = P;
  ctx.lineJoin = 'round';
  mapContinents.forEach(poly => {
    drawContinentPoly(ctx, poly);
    ctx.stroke();
  });

  // ── 6) Terrain biome zones with pixel-art sprites ──
  mapTerrain.forEach(({ type, poly }) => {
    const canvasCoords = poly.map(([lon, lat]) => lonLatToXY(lon, lat));
    drawTerrainZone(ctx, type, canvasCoords, colors);
  });

  // ── 7) Pixel-art clouds scattered over the ocean ──
  drawClouds(ctx, colors);
}

// ═══ PIXEL-ART CLOUDS ═══
function drawClouds(ctx, colors) {
  const rng = mulberry32(777);
  const cloudColor = colors.snow || '#e8f0f8';
  const shadowColor = colors.tundra || '#b0c0d0';

  // Predefined cloud positions (lon, lat) — scattered over oceans
  const cloudSpots = [
    [-150, 30], [-140, 45], [-155, 15], [-45, 20], [-35, -15],
    [-25, 35], [55, -20], [65, -35], [160, 10], [155, -25],
    [-120, -20], [-100, -35], [80, -40], [170, 35], [-170, 45],
    [-50, 50], [40, -30], [145, 25], [-90, 5], [-30, 5],
    [90, -15], [120, -30], [-160, -10], [-10, 15], [50, 10],
  ];

  cloudSpots.forEach(([lon, lat]) => {
    const [cx, cy] = lonLatToXY(lon, lat);
    const size = 0.7 + rng() * 0.6; // slight size variation

    // Cloud shadow
    ctx.fillStyle = shadowColor;
    ctx.fillRect(cx - P*3*size + P, cy + P, P*7*size, P*2*size);

    // Main cloud body — blobby shape
    ctx.fillStyle = cloudColor;
    // Bottom row (widest)
    ctx.fillRect(cx - P*3*size, cy, P*7*size, P*2*size);
    // Middle bumps
    ctx.fillRect(cx - P*2*size, cy - P*size, P*3*size, P*size);
    ctx.fillRect(cx + P*size,   cy - P*size, P*2*size, P*size);
    // Top bump
    ctx.fillRect(cx - P*size, cy - P*2*size, P*2*size, P*size);
  });
}

function drawFlights() {
  const container = document.querySelector('.map-container');
  const canvas = document.getElementById('flight-canvas');
  if (!container || !canvas) return;

  const rect = container.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  const renderScale = zoomLevel * dpr;

  canvas.width  = rect.width  * renderScale;
  canvas.height = rect.height * renderScale;

  const ctx = canvas.getContext('2d');
  const scaleX = rect.width / MAP_W;
  const scaleY = rect.height / MAP_H;
  const colors = getThemeColors();

  function toScreen(lon, lat) {
    const [mx, my] = lonLatToXY(lon, lat);
    return [mx * scaleX, my * scaleY];
  }

  let dashOffset = 0;

  // Cancel previous animation
  if (animFrameId) cancelAnimationFrame(animFrameId);

  function animate() {
    // Reset transform so clearRect covers the full bitmap, then re-apply scale
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.scale(renderScale, renderScale);

    dashOffset -= 0.3;

    mapFlights.forEach(([fromName, toName]) => {
      const from = mapCities.find(c => c.name === fromName);
      const to   = mapCities.find(c => c.name === toName);
      if (!from || !to) return;

      const [x1, y1] = toScreen(from.lon, from.lat);
      const [x2, y2] = toScreen(to.lon, to.lat);

      const midX = (x1 + x2) / 2;
      const midY = (y1 + y2) / 2;
      const dist = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
      const arcHeight = Math.min(dist * 0.3, 60);
      const cpY = midY - arcHeight;

      const isPlanned = to.status === 'planned';

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.quadraticCurveTo(midX, cpY, x2, y2);

      ctx.strokeStyle = isPlanned
        ? `rgba(106,200,220,0.5)`
        : `rgba(255,220,140,0.6)`;
      ctx.lineWidth = 1.5;
      ctx.setLineDash(isPlanned ? [6, 8] : [5, 6]);
      ctx.lineDashOffset = dashOffset;
      ctx.stroke();
      ctx.setLineDash([]);
    });

    animFrameId = requestAnimationFrame(animate);
  }
  animate();
}

function placeCityPins() {
  const container = document.getElementById('map-pins');
  if (!container) return;

  // Always use .map-container for sizing (not parentElement, which may be the zoom layer)
  const mapContainer = document.querySelector('.map-container');
  if (!mapContainer) return;
  const parentRect = mapContainer.getBoundingClientRect();
  const scaleX = parentRect.width / MAP_W;
  const scaleY = parentRect.height / MAP_H;
  container.innerHTML = '';

  mapCities.forEach(c => {
    // Skip Chelsea (too close to Ottawa)
    if (c.name === 'Chelsea') return;

    const [mx, my] = lonLatToXY(c.lon, c.lat);
    const sx = mx * scaleX;
    const sy = my * scaleY;

    const pin = document.createElement('div');
    pin.className = 'map-city';
    pin.style.left = sx + 'px';
    pin.style.top = sy + 'px';
    pin.innerHTML = `<div class="city-dot ${c.status}"></div><div class="city-label">${c.label}</div>`;
    container.appendChild(pin);
  });
}

export function initMap(cities, flights, continents, terrain) {
  mapCities = cities;
  mapFlights = flights;
  mapContinents = continents;
  mapTerrain = terrain || [];
}

export function renderMap() {
  setTimeout(() => {
    drawMap();
    drawFlights();
    placeCityPins();
  }, 50);
}

export function refreshMap() {
  drawMap();
  drawFlights();
  placeCityPins();
}

// Re-render on resize
window.addEventListener('resize', () => {
  const mapTab = document.getElementById('tab-map');
  if (mapTab && mapTab.classList.contains('active')) {
    drawFlights();
    placeCityPins();
  }
});

// Re-render both canvases at the current zoom resolution
function redrawForZoom() {
  drawMap();
  drawFlights();
}

// ═══════════════════════════════════════════════
// ZOOM & PAN
// ═══════════════════════════════════════════════

let zoomLevel = 1;
let panX = 0, panY = 0;
const ZOOM_MIN = 1, ZOOM_MAX = 4, ZOOM_STEP = 0.25;

function applyZoom() {
  const layer = document.querySelector('.map-zoom-layer');
  if (!layer) return;
  layer.style.transform = `translate(${panX}px, ${panY}px) scale(${zoomLevel})`;
}

function clampPan() {
  const container = document.querySelector('.map-container');
  if (!container) return;
  const rect = container.getBoundingClientRect();
  const maxPanX = (rect.width * (zoomLevel - 1)) / 2;
  const maxPanY = (rect.height * (zoomLevel - 1)) / 2;
  panX = Math.max(-maxPanX, Math.min(maxPanX, panX));
  panY = Math.max(-maxPanY, Math.min(maxPanY, panY));
}

export function initMapZoom() {
  const container = document.querySelector('.map-container');
  if (!container) return;

  // ── Wheel zoom ──
  container.addEventListener('wheel', (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
    zoomLevel = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, zoomLevel + delta));
    if (zoomLevel <= 1) { panX = 0; panY = 0; zoomLevel = 1; }
    clampPan();
    redrawForZoom();
    applyZoom();
  }, { passive: false });

  // ── Drag to pan ──
  let isDragging = false, startX = 0, startY = 0;

  container.addEventListener('mousedown', (e) => {
    if (zoomLevel <= 1) return;
    // Don't hijack clicks on city pins
    if (e.target.closest('.city-dot, .city-label')) return;
    isDragging = true;
    startX = e.clientX - panX;
    startY = e.clientY - panY;
    container.style.cursor = 'grabbing';
    e.preventDefault();
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    panX = e.clientX - startX;
    panY = e.clientY - startY;
    clampPan();
    applyZoom();
  });

  window.addEventListener('mouseup', () => {
    if (!isDragging) return;
    isDragging = false;
    container.style.cursor = zoomLevel > 1 ? 'grab' : '';
  });

  // ── Zoom buttons ──
  document.getElementById('map-zoom-in')?.addEventListener('click', () => {
    zoomLevel = Math.min(ZOOM_MAX, zoomLevel + ZOOM_STEP);
    clampPan();
    redrawForZoom();
    applyZoom();
    container.style.cursor = 'grab';
  });

  document.getElementById('map-zoom-out')?.addEventListener('click', () => {
    zoomLevel = Math.max(ZOOM_MIN, zoomLevel - ZOOM_STEP);
    if (zoomLevel <= 1) { panX = 0; panY = 0; zoomLevel = 1; container.style.cursor = ''; }
    clampPan();
    redrawForZoom();
    applyZoom();
  });

  document.getElementById('map-zoom-reset')?.addEventListener('click', () => {
    zoomLevel = 1; panX = 0; panY = 0;
    redrawForZoom();
    applyZoom();
    container.style.cursor = '';
  });

  // ── Double-click to reset ──
  container.addEventListener('dblclick', (e) => {
    if (e.target.closest('.map-zoom-btn')) return;
    zoomLevel = 1; panX = 0; panY = 0;
    redrawForZoom();
    applyZoom();
    container.style.cursor = '';
  });
}
