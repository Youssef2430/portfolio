// ═══════════════════════════════════════════════
// QUESTS — Quest log rendering
// ═══════════════════════════════════════════════

function questMeta(status, questTypeOverride) {
  // Returns [cssClass, typeClass, typeLabel]
  switch (status) {
    case 'active':
      return ['active-quest', 'active', '&#9733; ACTIVE QUEST'];
    case 'completed':
      if (questTypeOverride === 'side') {
        return ['completed', 'done', '&#10003; SIDE QUEST'];
      }
      return ['completed', 'done', '&#10003; COMPLETED'];
    case 'upcoming-main':
      return ['main-quest', 'main', '&#9734; UPCOMING'];
    case 'upcoming-side':
      return ['side-quest', 'side', '&#9734; SIDE QUEST'];
    default:
      return ['', 'main', status];
  }
}

// ── Pixel art souvenir magnet system ─────────────
const PX = 2;
function magnetSVG(rows, palette) {
  const h = rows.length, w = rows[0].length;
  let r = '';
  for (let y = 0; y < h; y++)
    for (let x = 0; x < rows[y].length; x++) {
      const c = rows[y][x];
      if (c !== '.' && palette[c])
        r += `<rect x="${x*PX}" y="${y*PX}" width="${PX}" height="${PX}" fill="${palette[c]}"/>`;
    }
  return `<svg width="${w*PX}" height="${h*PX}" viewBox="0 0 ${w*PX} ${h*PX}" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">${r}</svg>`;
}

const W = '#fff';
const S = 'rgba(255,255,255,0.45)';
const P = { W, S };

const MAGNET_ICONS = {
  // Eiffel Tower — Paris
  eiffel: magnetSVG([
    '....W....',
    '....W....',
    '...W.W...',
    '...WWW...',
    '..W.W.W..',
    '..WWWWW..',
    '.WW.W.WW.',
    '.WWWWWWW.',
    '...WWW...',
    '..WWWWW..',
    '.WWWWWWW.',
    'WWWWWWWWW',
  ], P),

  // Canal houses — Amsterdam
  houses: magnetSVG([
    '.W..WW.W.',
    'WWW.WW.WW',
    'WWW.WW.WW',
    'WSW.SW.SW',
    'WWW.WW.WW',
    'WSW.SW.SW',
    'WWWWWWWWW',
    'WWSWWSWWW',
    'SSSSSSSSS',
  ], P),

  // Palm tree — Nice / Côte d'Azur
  palm: magnetSVG([
    '.WW...WW.',
    '..WW.WW..',
    '...WWW...',
    '..WWWWW..',
    '....W....',
    '....W....',
    '....W....',
    '....W....',
    '...WWW...',
    '..WWWWW..',
  ], P),

  // Sagrada Familia spires — Barcelona
  sagrada: magnetSVG([
    '.W.....W.',
    '.W..W..W.',
    '.W..W..W.',
    '.WW.W.WW.',
    '.WWWWWWW.',
    '.W.W.W.W.',
    '.WWWWWWW.',
    '.W.W.W.W.',
    '.WWWWWWW.',
    '.WW.W.WW.',
    '.WWWWWWW.',
  ], P),

  // Sun with rays — Málaga
  sun: magnetSVG([
    '....W....',
    '.W.WWW.W.',
    '..WWWWW..',
    'WWWWWWWWW',
    '..WWWWW..',
    '.W.WWW.W.',
    '....W....',
  ], P),

  // Palm + cliff over sea — Nerja
  beach: magnetSVG([
    '..WW.....',
    '...WW....',
    '..WWWW...',
    '....W....',
    '....W....',
    'WWWWWWWWW',
    'SSSSSSSSS',
    'WWWWWWWWW',
    'SSSSSSSSS',
  ], P),

  // Peace Tower — Ottawa
  tower: magnetSVG([
    '...W...',
    '..WWW..',
    '...W...',
    '..WWW..',
    '..WWW..',
    '..WWW..',
    '..W.W..',
    '..WWW..',
    '..W.W..',
    '.WWWWW.',
    '.WWWWW.',
    'WWWWWWW',
  ], P),

  // Château Frontenac — Quebec City
  chateau: magnetSVG([
    '....W....',
    '...WWW...',
    '..WWWWW..',
    '..WWWWW..',
    '.WWWWWWW.',
    '.W.W.W.W.',
    '.WWWWWWW.',
    '.W.W.W.W.',
    '.WWWWWWW.',
    '.W.W.W.W.',
    '.WWWWWWW.',
  ], P),

  // Tidal bore wave — Moncton
  wave: magnetSVG([
    '..WW.......',
    '.WWWW......',
    'WWWWWWW....',
    '.WWWWWWWW..',
    '..WWWWWWWWW',
    '...WWWWWWWW',
    'WWWWWWWWWWW',
  ], P),

  // Lighthouse — Halifax
  lighthouse: magnetSVG([
    '..WWW..',
    '...W...',
    '..WWW..',
    '..S.S..',
    '..WWW..',
    '..S.S..',
    '..WWW..',
    '.WWWWW.',
    '.WWWWW.',
    'WWWWWWW',
    'SSSSSSS',
  ], P),

  // Sailboat — Larache
  boat: magnetSVG([
    '....W....',
    '...WW....',
    '..WWW....',
    '.WWWW....',
    '....WWW..',
    '...WWWWW.',
    '..WWWWWWW',
    'SSSSSSSSS',
  ], P),

  // Moorish horseshoe arch — Tangier
  arch: magnetSVG([
    '.WWWWWWW.',
    'WW.....WW',
    'W.......W',
    'W.......W',
    'W.......W',
    'WW.....WW',
    'WWWWWWWWW',
    'WW.WWW.WW',
    'WW.....WW',
    'WW.....WW',
  ], P),

  // Matterhorn peak — Switzerland
  mountain: magnetSVG([
    '....W....',
    '...WWW...',
    '..WW.WW..',
    '.WWWWWWW.',
    'WWWWWWWWW',
    'WWWWWWWWW',
    'SSSSSSSSS',
    'SSSSSSSSS',
  ], P),

  // Colosseum arches — Italy
  colosseum: magnetSVG([
    '.WWWWWWW.',
    'WW.W.W.WW',
    'W..W.W..W',
    'WWWWWWWWW',
    'W..W.W..W',
    'WW.W.W.WW',
    '.WWWWWWW.',
    '..WWWWW..',
  ], P),

  // Gothic Duomo spire — Milan
  spire: magnetSVG([
    '...W...',
    '...W...',
    '..WWW..',
    '..W.W..',
    '..WWW..',
    '.WWWWW.',
    '.W.W.W.',
    '.WWWWW.',
    'WWWWWWW',
    'W.W.W.W',
    'WWWWWWW',
  ], P),

  // Chapel Bridge tower — Lucerne
  bridge: magnetSVG([
    '...WW....',
    '..WWWW...',
    '..W..W...',
    '..WWWW...',
    'WWWWWWWWW',
    'WWWWWWWWW',
    'W.W.W.W.W',
    'WWWWWWWWW',
    'SSSSSSSSS',
  ], P),

  // Jet d'Eau fountain — Geneva
  fountain: magnetSVG([
    '...W...',
    '...W...',
    '...W...',
    '..WWW..',
    '...W...',
    '...W...',
    '..WWW..',
    '.WWWWW.',
    'WWWWWWW',
    'SSSSSSS',
  ], P),

  // Hassan Tower — Rabat
  hassan: magnetSVG([
    '..WWW..',
    '..W.W..',
    '..WWW..',
    '..W.W..',
    '..WWW..',
    '..W.W..',
    '..WWW..',
    '..W.W..',
    '..WWW..',
    '.WWWWW.',
    'WWWWWWW',
  ], P),

  // Maple leaf (fallback for Canadian cities)
  maple: magnetSVG([
    '...W...',
    '.W.W.W.',
    '..WWW..',
    'WWWWWWW',
    '..WWW..',
    '...W...',
    '...W...',
  ], P),
};

const CITY_MAGNETS = {
  'Paris':            { icon: 'eiffel',     grad: 'linear-gradient(135deg, #667eea, #764ba2)' },
  'Amsterdam':        { icon: 'houses',     grad: 'linear-gradient(135deg, #f5af19, #f12711)' },
  'Nice':             { icon: 'palm',       grad: 'linear-gradient(135deg, #4facfe, #00f2fe)' },
  'Barcelona':        { icon: 'sagrada',    grad: 'linear-gradient(135deg, #f093fb, #f5576c)' },
  'Málaga':           { icon: 'sun',        grad: 'linear-gradient(135deg, #f6d365, #fda085)' },
  'Nerja':            { icon: 'beach',      grad: 'linear-gradient(135deg, #43e97b, #38f9d7)' },
  'Ottawa':           { icon: 'tower',      grad: 'linear-gradient(135deg, #eb3349, #f45c43)' },
  'Quebec City':      { icon: 'chateau',    grad: 'linear-gradient(135deg, #4e54c8, #8f94fb)' },
  'Moncton':          { icon: 'wave',       grad: 'linear-gradient(135deg, #11998e, #38ef7d)' },
  'Halifax':          { icon: 'lighthouse', grad: 'linear-gradient(135deg, #0c3547, #3a7bd5)' },
  'Fredericton':      { icon: 'maple',      grad: 'linear-gradient(135deg, #c0392b, #e74c3c)' },
  'Larache':          { icon: 'boat',       grad: 'linear-gradient(135deg, #0fb8ad, #1fc8db)' },
  'Tangier, Morocco': { icon: 'arch',       grad: 'linear-gradient(135deg, #134e5e, #71b280)' },
  'Tangier':          { icon: 'arch',       grad: 'linear-gradient(135deg, #134e5e, #71b280)' },
  'Italy':            { icon: 'colosseum',  grad: 'linear-gradient(135deg, #f2994a, #f2c94c)' },
  'Switzerland':      { icon: 'mountain',   grad: 'linear-gradient(135deg, #cb2d3e, #ef473a)' },
  'Rabat':            { icon: 'hassan',     grad: 'linear-gradient(135deg, #136a8a, #267871)' },
  'Milan':            { icon: 'spire',      grad: 'linear-gradient(135deg, #f2994a, #f2c94c)' },
  'Lucerne':          { icon: 'bridge',     grad: 'linear-gradient(135deg, #4e54c8, #8f94fb)' },
  'Geneva':           { icon: 'fountain',   grad: 'linear-gradient(135deg, #cb2d3e, #ef473a)' },
};

function formatLocation(location) {
  const cities = location.split(' → ');
  const badges = cities.map(city => {
    const data = CITY_MAGNETS[city] || { icon: 'sun', grad: 'linear-gradient(135deg, #2c3e50, #3498db)' };
    const svg = MAGNET_ICONS[data.icon] || '';
    return `<span class="city-magnet" style="background:${data.grad}">
      <span class="magnet-pixel">${svg}</span>
      <span class="magnet-label">${city}</span>
    </span>`;
  }).join('<span class="location-arrow">→</span>');
  return badges;
}

function renderObjectives(objectives, isCompleted) {
  if (!objectives || !objectives.length) return '';
  const header = isCompleted ? 'OBJECTIVES: (ALL COMPLETE)' : 'OBJECTIVES:';
  const items = objectives.map(obj => `
    <div class="objective">
      <div class="obj-check ${obj.done ? 'done' : ''}">${obj.done ? '&#10003;' : '&#9675;'}</div>
      <span class="obj-text ${obj.done ? 'done' : ''}">${obj.text}</span>
    </div>
  `).join('');

  return `
    <div class="quest-objectives">
      <h4>${header}</h4>
      ${items}
    </div>
  `;
}

function renderRewards(rewards) {
  if (!rewards || !rewards.length) return '';
  return `
    <div class="quest-rewards">
      ${rewards.map(r => `<div class="reward">&#9733; ${r}</div>`).join('')}
    </div>
  `;
}

function renderQuest(quest) {
  const [entryClass, typeClass, typeLabel] = questMeta(quest.status, quest.questTypeOverride);
  const isCompleted = quest.status === 'completed';
  const xpStyle = isCompleted ? 'style="color:var(--green);"' : '';
  const xpSuffix = isCompleted ? ' &#10003;' : '';
  const arabicName = quest.nameArabic
    ? ` <span class="arabic-bracket" style="font-size:14px;">${quest.nameArabic}</span>`
    : '';

  return `
    <div class="quest-entry ${entryClass}" data-quest>
      <div class="quest-header">
        <div class="quest-title-area">
          <span class="quest-type ${typeClass}">${typeLabel}</span>
          <div class="quest-name">${quest.name}${arabicName}</div>
          <div class="quest-location">${formatLocation(quest.location)}</div>
        </div>
        <div class="quest-status">
          <div class="quest-date">${quest.date}</div>
          <div class="quest-xp" ${xpStyle}>+${quest.xp} XP${xpSuffix}</div>
        </div>
      </div>
      <div class="quest-body">
        <p>${quest.narrative}</p>
        ${renderObjectives(quest.objectives, isCompleted)}
        ${renderRewards(quest.rewards)}
      </div>
    </div>
  `;
}

export function renderQuestLog(quests, containerId) {
  const el = document.getElementById(containerId);
  el.innerHTML = quests.map(renderQuest).join('');

  // Event delegation for expand/collapse
  el.addEventListener('click', e => {
    const entry = e.target.closest('[data-quest]');
    if (entry) entry.classList.toggle('expanded');
  });

  // Auto-expand active quest
  setTimeout(() => {
    const active = el.querySelector('.active-quest');
    if (active) active.classList.add('expanded');
  }, 500);
}
