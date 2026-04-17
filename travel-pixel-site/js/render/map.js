// ═══════════════════════════════════════════════
// MAP — Canvas world map, flights, city pins
// ═══════════════════════════════════════════════

const MAP_W = 240;
const MAP_H = 120;

let mapCities = [];
let mapFlights = [];
let mapContinents = [];
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
  };
}

function drawMap() {
  const canvas = document.getElementById('map-canvas');
  if (!canvas) return;
  canvas.width = MAP_W;
  canvas.height = MAP_H;
  const ctx = canvas.getContext('2d');
  const colors = getThemeColors();

  // Ocean
  ctx.fillStyle = colors.ocean;
  ctx.fillRect(0, 0, MAP_W, MAP_H);

  // Grid dots
  ctx.fillStyle = colors.grid;
  for (let x = 0; x < MAP_W; x += 12) {
    for (let y = 0; y < MAP_H; y += 12) {
      ctx.fillRect(x, y, 1, 1);
    }
  }

  // Continents
  ctx.fillStyle = colors.land;
  ctx.strokeStyle = colors.stroke;
  ctx.lineWidth = 0.5;

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
    ctx.fillRect(Math.round(cx) - 1, Math.round(cy) - 1, 2, 2);
  });
}

function drawFlights() {
  const container = document.querySelector('.map-container');
  const canvas = document.getElementById('flight-canvas');
  if (!container || !canvas) return;

  const rect = container.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;
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
    ctx.clearRect(0, 0, canvas.width, canvas.height);
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

export function initMap(cities, flights, continents) {
  mapCities = cities;
  mapFlights = flights;
  mapContinents = continents;
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
    applyZoom();
    container.style.cursor = 'grab';
  });

  document.getElementById('map-zoom-out')?.addEventListener('click', () => {
    zoomLevel = Math.max(ZOOM_MIN, zoomLevel - ZOOM_STEP);
    if (zoomLevel <= 1) { panX = 0; panY = 0; zoomLevel = 1; container.style.cursor = ''; }
    clampPan();
    applyZoom();
  });

  document.getElementById('map-zoom-reset')?.addEventListener('click', () => {
    zoomLevel = 1; panX = 0; panY = 0;
    applyZoom();
    container.style.cursor = '';
  });

  // ── Double-click to reset ──
  container.addEventListener('dblclick', (e) => {
    if (e.target.closest('.map-zoom-btn')) return;
    zoomLevel = 1; panX = 0; panY = 0;
    applyZoom();
    container.style.cursor = '';
  });
}
