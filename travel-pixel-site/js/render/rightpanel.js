// ═══════════════════════════════════════════════
// RIGHT PANEL — Weather, party, activity feed
// ═══════════════════════════════════════════════

function renderWeather(weather) {
  return `
    <div class="panel-section">
      <div class="panel-header">CURRENT WEATHER</div>
      <div class="weather-widget">
        <div class="weather-icon">${weather.icon}</div>
        <div class="weather-temp">${weather.temp}</div>
        <div class="weather-desc">${weather.description}</div>
        <div class="weather-location">${weather.location}</div>
      </div>
    </div>
  `;
}

function renderParty(party) {
  const members = party.map(m => `
    <div class="party-member">
      <div class="pm-avatar">${m.emoji}</div>
      <div class="pm-info">
        <div class="pm-name">${m.name}</div>
        <div class="pm-role">${m.role}</div>
      </div>
      <div class="pm-status ${m.status}"></div>
    </div>
  `).join('');

  return `
    <div class="panel-section">
      <div class="panel-header">TRAVEL PARTY</div>
      ${members}
    </div>
  `;
}

function renderActivityFeed(activity) {
  const items = activity.map(a => `
    <div class="activity-item">
      <span class="activity-icon">${a.icon}</span>
      <span class="activity-text">${a.html}</span>
      <span class="activity-time">${a.time}</span>
    </div>
  `).join('');

  return `
    <div class="panel-section">
      <div class="panel-header">ACTIVITY LOG</div>
      <div class="activity-feed">${items}</div>
    </div>
  `;
}

export function renderRightPanel(config, containerId) {
  const el = document.getElementById(containerId);
  el.innerHTML =
    renderWeather(config.weather) +
    renderParty(config.party) +
    renderActivityFeed(config.activity);
}
