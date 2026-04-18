// ═══════════════════════════════════════════════
// MAP — Canvas world map, flights, city pins
// ═══════════════════════════════════════════════

const MAP_W = 960;
const MAP_H = 480;

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
  return {
    ocean:     s.getPropertyValue('--map-ocean').trim(),
    land:      s.getPropertyValue('--map-land').trim(),
    stroke:    s.getPropertyValue('--map-land-stroke').trim(),
    grid:      s.getPropertyValue('--map-grid').trim(),
    gold:      s.getPropertyValue('--gold').trim(),
    green:     s.getPropertyValue('--green').trim(),
    cyan:      s.getPropertyValue('--cyan').trim(),
    // Terrain biomes
    forest:       s.getPropertyValue('--terrain-forest').trim(),
    jungle:       s.getPropertyValue('--terrain-jungle').trim(),
    desert:       s.getPropertyValue('--terrain-desert').trim(),
    mountain:     s.getPropertyValue('--terrain-mountain').trim(),
    mountainPeak: s.getPropertyValue('--terrain-mountain-peak').trim(),
    tundra:       s.getPropertyValue('--terrain-tundra').trim(),
    savanna:      s.getPropertyValue('--terrain-savanna').trim(),
  };
}

// ── Seeded PRNG for deterministic pixel patterns ──
function mulberry32(seed) {
  return function() {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

// ── Check if a point is inside a polygon (ray casting) ──
function pointInPoly(px, py, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if ((yi > py) !== (yj > py) && px < (xj - xi) * (py - yi) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

// ── Draw pixel-art texture detail inside a terrain polygon ──
function drawTerrainTexture(ctx, type, polyCoords, colors) {
  // polyCoords are already in canvas space [x, y]
  // Find bounding box
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  polyCoords.forEach(([x, y]) => {
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  });

  const rng = mulberry32(Math.floor(minX * 7 + minY * 13 + 42));
  const step = type === 'mountain' ? 8 : 10;

  ctx.save();

  // Clip to the terrain polygon
  ctx.beginPath();
  ctx.moveTo(polyCoords[0][0], polyCoords[0][1]);
  for (let i = 1; i < polyCoords.length; i++) {
    ctx.lineTo(polyCoords[i][0], polyCoords[i][1]);
  }
  ctx.closePath();
  ctx.clip();

  if (type === 'forest') {
    // Small pixel trees: trunk + canopy
    for (let x = minX; x < maxX; x += step) {
      for (let y = minY; y < maxY; y += step) {
        if (rng() > 0.45) continue;
        const tx = Math.floor(x + rng() * step);
        const ty = Math.floor(y + rng() * step);
        // Canopy (3×2 dark block)
        ctx.fillStyle = colors.forest;
        ctx.fillRect(tx - 1, ty - 3, 3, 2);
        // Trunk (1×1)
        ctx.fillStyle = colors.land;
        ctx.fillRect(tx, ty - 1, 1, 1);
      }
    }
  } else if (type === 'jungle') {
    // Dense canopy blobs — thicker, more packed
    for (let x = minX; x < maxX; x += 7) {
      for (let y = minY; y < maxY; y += 7) {
        if (rng() > 0.55) continue;
        const tx = Math.floor(x + rng() * 7);
        const ty = Math.floor(y + rng() * 7);
        ctx.fillStyle = colors.jungle;
        // Thick canopy cluster
        ctx.fillRect(tx - 1, ty - 2, 4, 3);
        ctx.fillRect(tx, ty - 3, 2, 1);
      }
    }
  } else if (type === 'desert') {
    // Sandy dots + occasional dune ridges
    for (let x = minX; x < maxX; x += step) {
      for (let y = minY; y < maxY; y += step) {
        if (rng() > 0.3) continue;
        const tx = Math.floor(x + rng() * step);
        const ty = Math.floor(y + rng() * step);
        ctx.fillStyle = colors.desert;
        if (rng() > 0.7) {
          // Dune ridge (small horizontal line)
          ctx.fillRect(tx, ty, 4, 1);
        } else {
          // Sand speckle
          ctx.fillRect(tx, ty, 1, 1);
        }
      }
    }
  } else if (type === 'mountain') {
    // Pixel-art triangle peaks ▲
    for (let x = minX; x < maxX; x += step) {
      for (let y = minY; y < maxY; y += step) {
        if (rng() > 0.45) continue;
        const tx = Math.floor(x + rng() * step);
        const ty = Math.floor(y + rng() * step);
        // Mountain body
        ctx.fillStyle = colors.mountain;
        ctx.fillRect(tx - 2, ty,     5, 1);  // base
        ctx.fillRect(tx - 1, ty - 1, 3, 1);  // mid
        ctx.fillRect(tx,     ty - 2, 1, 1);  // peak
        // Snow cap
        ctx.fillStyle = colors.mountainPeak;
        ctx.fillRect(tx, ty - 2, 1, 1);
        ctx.fillRect(tx - 1, ty - 1, 3, 1);
      }
    }
  } else if (type === 'tundra') {
    // Sparse icy speckles
    for (let x = minX; x < maxX; x += 12) {
      for (let y = minY; y < maxY; y += 12) {
        if (rng() > 0.25) continue;
        const tx = Math.floor(x + rng() * 12);
        const ty = Math.floor(y + rng() * 12);
        ctx.fillStyle = colors.tundra;
        ctx.fillRect(tx, ty, 2, 1);
      }
    }
  } else if (type === 'savanna') {
    // Scattered short grass tufts + occasional lone tree
    for (let x = minX; x < maxX; x += step) {
      for (let y = minY; y < maxY; y += step) {
        if (rng() > 0.35) continue;
        const tx = Math.floor(x + rng() * step);
        const ty = Math.floor(y + rng() * step);
        ctx.fillStyle = colors.savanna;
        if (rng() > 0.85) {
          // Lone acacia-like tree
          ctx.fillRect(tx, ty - 2, 1, 2);      // trunk
          ctx.fillRect(tx - 2, ty - 3, 5, 1);  // flat canopy
        } else {
          // Grass tuft
          ctx.fillRect(tx, ty, 2, 1);
          ctx.fillRect(tx + 1, ty - 1, 1, 1);
        }
      }
    }
  }

  ctx.restore();
}

function drawMap() {
  const canvas = document.getElementById('map-canvas');
  if (!canvas) return;

  // Scale canvas resolution with zoom + devicePixelRatio so quality
  // stays constant at every zoom level instead of just enlarging pixels.
  const dpr = window.devicePixelRatio || 1;
  const renderScale = zoomLevel * dpr;

  canvas.width  = MAP_W * renderScale;
  canvas.height = MAP_H * renderScale;

  const ctx = canvas.getContext('2d');
  ctx.scale(renderScale, renderScale);

  const colors = getThemeColors();

  // Ocean
  ctx.fillStyle = colors.ocean;
  ctx.fillRect(0, 0, MAP_W, MAP_H);

  // Grid dots — subdivide as we zoom for better distance reading
  ctx.fillStyle = colors.grid;
  const gridStep = Math.max(12, Math.floor(48 / zoomLevel));
  for (let x = 0; x < MAP_W; x += gridStep) {
    for (let y = 0; y < MAP_H; y += gridStep) {
      ctx.fillRect(x, y, 2, 2);
    }
  }

  // Continents
  ctx.fillStyle = colors.land;
  ctx.strokeStyle = colors.stroke;
  ctx.lineWidth = 1.5;

  mapContinents.forEach(poly => {
    ctx.beginPath();
    const [sx, sy] = lonLatToXY(poly[0][0], poly[0][1]);
    ctx.moveTo(sx, sy);
    for (let i = 1; i < poly.length; i++) {
      const [px, py] = lonLatToXY(poly[i][0], poly[i][1]);
      ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  });

  // Terrain biomes — fill + pixel-art textures
  mapTerrain.forEach(({ type, poly }) => {
    // Convert lon/lat polygon to canvas coords
    const canvasCoords = poly.map(([lon, lat]) => lonLatToXY(lon, lat));

    // Subtle fill for the biome area
    const fillColors = {
      forest:  colors.forest,
      jungle:  colors.jungle,
      desert:  colors.desert,
      mountain: colors.mountain,
      tundra:  colors.tundra,
      savanna: colors.savanna,
    };

    ctx.fillStyle = fillColors[type] || colors.land;
    ctx.beginPath();
    ctx.moveTo(canvasCoords[0][0], canvasCoords[0][1]);
    for (let i = 1; i < canvasCoords.length; i++) {
      ctx.lineTo(canvasCoords[i][0], canvasCoords[i][1]);
    }
    ctx.closePath();
    ctx.fill();

    // Pixel-art texture detail on top
    drawTerrainTexture(ctx, type, canvasCoords, colors);
  });

  // City dots on base canvas
  const statusColors = {
    current: colors.gold,
    planned: colors.cyan,
    home:    '#ffffff',
    visited: colors.green,
  };

  mapCities.forEach(c => {
    const [cx, cy] = lonLatToXY(c.lon, c.lat);
    ctx.fillStyle = statusColors[c.status] || colors.green;
    ctx.fillRect(Math.round(cx) - 3, Math.round(cy) - 3, 6, 6);
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
        ? `rgba(106,172,184,0.25)`
        : `rgba(200,170,118,0.3)`;
      ctx.lineWidth = 1;
      ctx.setLineDash(isPlanned ? [4, 6] : [3, 4]);
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
