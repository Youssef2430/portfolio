// ═══════════════════════════════════════════════
// HERO SCENE — Pixel art landscape (day/night)
// Inspired by: cliff-top watchtower, lush forest,
// stars at night, glowing teal window
// ═══════════════════════════════════════════════

const W = 384;
const H = 96;

// Deterministic star positions (seeded, not random)
const STARS = [
  [12,6],[28,3],[45,8],[62,2],[78,11],[95,4],[112,7],[128,3],
  [145,9],[162,5],[178,2],[195,10],[212,4],[228,7],[245,3],
  [262,9],[278,5],[295,2],[312,8],[328,4],[345,6],[360,3],
  [18,14],[55,16],[92,13],[130,17],[168,12],[205,15],[242,18],
  [280,14],[318,16],[355,13],[38,20],[75,22],[148,19],[220,21],
  [290,23],[350,20],[15,25],[105,24],[185,26],[265,22],[340,25],
];

function getColors() {
  const s = getComputedStyle(document.documentElement);
  const get = v => s.getPropertyValue(v).trim();
  return {
    skyTop:      get('--sky-top'),
    skyBottom:   get('--sky-bottom'),
    forestFar:   get('--forest-far'),
    forestMid:   get('--forest-mid'),
    forestNear:  get('--forest-near'),
    cliffBase:   get('--cliff-base'),
    cliffLight:  get('--cliff-light'),
    towerWall:   get('--tower-wall'),
    towerTop:    get('--tower-top'),
    windowGlow:  get('--window-glow'),
    starOpacity: parseFloat(get('--star-opacity')) || 0,
    gold:        get('--gold'),
  };
}

function drawPixelRect(ctx, x, y, w, h) {
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

// Simple seeded random for tree variations (deterministic per x)
function seededRand(seed) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function drawTreeRow(ctx, y, baseH, color, darkerColor, count, seed) {
  const rand = seededRand(seed);
  const spacing = W / count;

  for (let i = 0; i < count; i++) {
    const x = i * spacing + rand() * spacing * 0.6;
    const h = baseH + rand() * 8;
    const w = 6 + rand() * 8;

    // Tree canopy (rounded-ish pixel clusters)
    ctx.fillStyle = color;
    // Main body
    drawPixelRect(ctx, x, y - h, w, h);
    // Top crown (wider)
    drawPixelRect(ctx, x - 2, y - h - 3, w + 4, 4);
    // Peak
    drawPixelRect(ctx, x + 1, y - h - 5, w - 2, 3);

    // Darker side shadow
    ctx.fillStyle = darkerColor;
    drawPixelRect(ctx, x + w - 2, y - h, 2, h);
    drawPixelRect(ctx, x + w, y - h - 1, 2, 3);

    // Occasional conifer (every ~4th tree)
    if (rand() > 0.7) {
      ctx.fillStyle = darkerColor;
      const coniferX = x + spacing * 0.3;
      const coniferH = h * 1.3;
      // Triangle-ish shape via stacked rects
      for (let j = 0; j < coniferH; j += 2) {
        const rowW = Math.max(2, (coniferH - j) * 0.35);
        drawPixelRect(ctx, coniferX - rowW / 2 + 3, y - j - 2, rowW, 2);
      }
    }
  }
}

function drawCliffAndTower(ctx, colors) {
  const cliffX = W * 0.55;
  const cliffW = 60;
  const cliffTop = H * 0.3;
  const cliffH = H - cliffTop;

  // Cliff face — layered for depth
  ctx.fillStyle = colors.cliffBase;
  drawPixelRect(ctx, cliffX, cliffTop, cliffW, cliffH);

  // Cliff lighter face (left side highlight)
  ctx.fillStyle = colors.cliffLight;
  drawPixelRect(ctx, cliffX, cliffTop, 8, cliffH);

  // Cliff cracks/texture
  ctx.fillStyle = colors.cliffBase;
  for (let i = 0; i < 6; i++) {
    const cy = cliffTop + 8 + i * 10;
    drawPixelRect(ctx, cliffX + 10, cy, 12, 1);
    drawPixelRect(ctx, cliffX + 25, cy + 4, 8, 1);
  }

  // Rocky edges
  ctx.fillStyle = colors.cliffLight;
  drawPixelRect(ctx, cliffX - 4, cliffTop + 6, 6, cliffH - 6);
  drawPixelRect(ctx, cliffX + cliffW, cliffTop + 10, 4, cliffH - 10);
  ctx.fillStyle = colors.cliffBase;
  drawPixelRect(ctx, cliffX + cliffW + 2, cliffTop + 15, 3, cliffH - 15);

  // Cliff top surface
  ctx.fillStyle = colors.cliffLight;
  drawPixelRect(ctx, cliffX - 4, cliffTop, cliffW + 8, 4);

  // Small vegetation on cliff top
  ctx.fillStyle = colors.forestMid;
  drawPixelRect(ctx, cliffX + 2, cliffTop - 3, 8, 4);
  drawPixelRect(ctx, cliffX + cliffW - 12, cliffTop - 2, 6, 3);

  // ── TOWER ──
  const towerW = 22;
  const towerH = 26;
  const towerX = cliffX + (cliffW - towerW) / 2;
  const towerY = cliffTop - towerH;

  // Tower body
  ctx.fillStyle = colors.towerWall;
  drawPixelRect(ctx, towerX, towerY, towerW, towerH);

  // Tower lighter face
  ctx.fillStyle = colors.towerTop;
  drawPixelRect(ctx, towerX, towerY, 4, towerH);

  // Battlements (crenellations)
  ctx.fillStyle = colors.towerTop;
  for (let i = 0; i < 5; i++) {
    drawPixelRect(ctx, towerX + i * 5, towerY - 4, 3, 4);
  }

  // Tower roof accent
  ctx.fillStyle = colors.towerWall;
  drawPixelRect(ctx, towerX - 2, towerY, towerW + 4, 2);

  // Window
  const winX = towerX + (towerW - 4) / 2;
  const winY = towerY + 10;
  ctx.fillStyle = colors.windowGlow;
  drawPixelRect(ctx, winX, winY, 4, 5);

  // Window glow effect (night only)
  if (colors.starOpacity > 0 && colors.windowGlow !== 'transparent') {
    ctx.globalAlpha = 0.15;
    ctx.fillStyle = colors.windowGlow;
    drawPixelRect(ctx, winX - 6, winY - 4, 16, 13);
    ctx.globalAlpha = 0.06;
    drawPixelRect(ctx, winX - 12, winY - 8, 28, 21);
    ctx.globalAlpha = 1;

    // Light beam downward
    ctx.globalAlpha = 0.04;
    ctx.fillStyle = colors.windowGlow;
    drawPixelRect(ctx, winX - 2, winY + 5, 8, 20);
    ctx.globalAlpha = 1;
  }

  // Figure on top (tiny person silhouette)
  const figX = towerX + towerW / 2 - 1;
  const figY = towerY - 8;
  ctx.fillStyle = colors.starOpacity > 0 ? '#1a1a2a' : '#2a2a1a';
  // Head
  drawPixelRect(ctx, figX, figY, 2, 2);
  // Body
  drawPixelRect(ctx, figX, figY + 2, 2, 3);
  // Legs
  drawPixelRect(ctx, figX - 1, figY + 5, 1, 2);
  drawPixelRect(ctx, figX + 2, figY + 5, 1, 2);
}

export function renderHeroScene() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  const colors = getColors();

  // ── SKY GRADIENT ──
  const skyGrad = ctx.createLinearGradient(0, 0, 0, H * 0.65);
  skyGrad.addColorStop(0, colors.skyTop);
  skyGrad.addColorStop(1, colors.skyBottom);
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, W, H);

  // Horizon glow
  const horizonGrad = ctx.createLinearGradient(0, H * 0.5, 0, H * 0.7);
  horizonGrad.addColorStop(0, 'transparent');
  horizonGrad.addColorStop(1, colors.skyBottom);
  ctx.fillStyle = horizonGrad;
  ctx.fillRect(0, H * 0.5, W, H * 0.2);

  // ── STARS (night only) ──
  if (colors.starOpacity > 0) {
    STARS.forEach(([x, y]) => {
      // Vary brightness slightly per star
      const brightness = 0.4 + (x * y % 7) / 10;
      ctx.fillStyle = `rgba(255,255,255,${brightness * colors.starOpacity})`;
      drawPixelRect(ctx, x, y, 1, 1);
    });

    // A few brighter stars
    ctx.fillStyle = `rgba(255,255,255,${0.9 * colors.starOpacity})`;
    drawPixelRect(ctx, 85, 5, 1, 1);
    drawPixelRect(ctx, 200, 8, 1, 1);
    drawPixelRect(ctx, 310, 3, 1, 1);
  }

  // ── DISTANT MOUNTAINS ──
  ctx.fillStyle = colors.forestFar;
  // Layer 1 — far mountains
  const mtY = H * 0.45;
  ctx.beginPath();
  ctx.moveTo(0, mtY + 8);
  for (let x = 0; x <= W; x += 16) {
    const peak = mtY + Math.sin(x * 0.04) * 6 - Math.cos(x * 0.02) * 4;
    ctx.lineTo(x, peak);
  }
  ctx.lineTo(W, H);
  ctx.lineTo(0, H);
  ctx.fill();

  // ── FOREST LAYERS ──
  // Far forest (small, packed)
  const farDarker = colors.starOpacity > 0 ? '#060e06' : '#3a6a28';
  drawTreeRow(ctx, H * 0.72, 8, colors.forestFar, farDarker, 35, 42);

  // Mid forest
  const midDarker = colors.starOpacity > 0 ? '#081208' : '#2a5a18';
  drawTreeRow(ctx, H * 0.82, 10, colors.forestMid, midDarker, 28, 73);

  // ── CLIFF AND TOWER ──
  drawCliffAndTower(ctx, colors);

  // ── NEAR FOREST (foreground, overlaps cliff base) ──
  const nearDarker = colors.starOpacity > 0 ? '#0a160a' : '#1a4a10';
  drawTreeRow(ctx, H * 0.92, 12, colors.forestNear, nearDarker, 22, 127);

  // ── GROUND ──
  ctx.fillStyle = colors.forestNear;
  drawPixelRect(ctx, 0, H - 6, W, 6);
  // Ground texture
  const groundDark = colors.starOpacity > 0 ? '#081008' : '#2a5818';
  ctx.fillStyle = groundDark;
  for (let x = 0; x < W; x += 8) {
    drawPixelRect(ctx, x, H - 4, 4, 2);
  }
  // Grass tufts
  ctx.fillStyle = colors.forestMid;
  for (let x = 0; x < W; x += 12) {
    drawPixelRect(ctx, x + 2, H - 7, 2, 2);
  }
}
