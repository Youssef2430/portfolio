// ═══════════════════════════════════════════════
// RIGHT PANEL — Weather, skill tree, loot log
// ═══════════════════════════════════════════════

// ── Weather code → emoji mapping ──
function weatherEmoji(code) {
  const c = parseInt(code);
  if (c === 113) return '☀️';
  if (c === 116) return '⛅';
  if (c <= 122) return '☁️';
  if (c <= 162 || c === 248 || c === 260) return '🌫️';
  if ([176,263,266,293,296,299,302,305,308,353,356,359].includes(c)) return '🌧️';
  if ([179,227,230,323,326,329,332,335,338,368,371,374,377].includes(c)) return '🌨️';
  if (c === 200 || c === 386 || c === 389 || c === 392 || c === 395) return '⛈️';
  return '🌤️';
}

// ── Weather widget (static fallback, updated by initLiveWeather) ──
function renderWeather(weather) {
  return `
    <div class="panel-section">
      <div class="panel-header">CURRENT WEATHER</div>
      <div class="weather-widget" id="weather-widget">
        <div class="weather-icon">${weather.icon}</div>
        <div class="weather-temp">${weather.temp}</div>
        <div class="weather-desc">${weather.description}</div>
        <div class="weather-location">${weather.location}</div>
      </div>
    </div>
  `;
}

// ── Skill tree ──
function renderSkillTree(skills) {
  const rows = skills.map(s => {
    const filled = '▰'.repeat(s.level);
    const empty  = '▱'.repeat(s.maxLevel - s.level);
    return `
      <div class="skill-item">
        <div class="skill-icon">${s.emoji}</div>
        <div class="skill-info">
          <div class="skill-name">${s.name} <span class="skill-level">Lv.${s.level}</span></div>
          <div class="skill-bar">${filled}${empty}</div>
          <div class="skill-desc">${s.desc}</div>
        </div>
      </div>
    `;
  }).join('');

  return `
    <div class="panel-section">
      <div class="panel-header">SKILL TREE</div>
      ${rows}
    </div>
  `;
}

// ── Loot log ──
function renderLootLog(lootLog) {
  const items = lootLog.map(l => `
    <div class="loot-item">
      <span class="loot-icon">${l.icon}</span>
      <span class="loot-text">${l.text}</span>
      <span class="loot-trip">${l.trip}</span>
    </div>
  `).join('');

  return `
    <div class="panel-section">
      <div class="panel-header">LOOT LOG</div>
      <div class="loot-feed">${items}</div>
    </div>
  `;
}

// ── Main render ──
export function renderRightPanel(config, containerId) {
  const el = document.getElementById(containerId);
  el.innerHTML =
    renderWeather(config.weather) +
    renderSkillTree(config.skills) +
    renderLootLog(config.lootLog);
}

// ── Live weather fetch (called after initial render) ──
export async function initLiveWeather() {
  try {
    const res = await fetch('https://wttr.in/?format=j1');
    if (!res.ok) return;
    const data = await res.json();
    const current = data.current_condition[0];
    const area = data.nearest_area[0];

    const icon     = weatherEmoji(current.weatherCode);
    const temp     = current.temp_C + '°C';
    const desc     = current.weatherDesc[0].value;
    const location = (area.areaName[0].value + ', ' + area.country[0].value).toUpperCase();

    const widget = document.getElementById('weather-widget');
    if (!widget) return;
    widget.innerHTML = `
      <div class="weather-icon">${icon}</div>
      <div class="weather-temp">${temp}</div>
      <div class="weather-desc">${desc}</div>
      <div class="weather-location">${location}</div>
    `;
  } catch {
    // Silently keep fallback weather
  }
}
