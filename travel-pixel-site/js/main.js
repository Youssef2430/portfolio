// ═══════════════════════════════════════════════
// MAIN — Entry point: imports config, renders
// everything, wires up interactions
// ═══════════════════════════════════════════════

import config from '../data/config.js';

// Render modules
import { renderTopBar }      from './render/topbar.js';
import { renderLeftPanel }   from './render/leftpanel.js';
import { renderQuestLog }    from './render/quests.js';
import { initMap, initMapZoom } from './render/map.js';
import { renderAchievements } from './render/achievements.js';
import { renderMagnets }     from './render/magnets.js';
import { renderRightPanel, initLiveWeather }  from './render/rightpanel.js';
import { renderBottomBar }   from './render/bottombar.js';

// UI modules
import { initTabs }          from './ui/tabs.js';
import { initTooltips }      from './ui/tooltip.js';
import { showToast }         from './ui/toast.js';
import { initPanelToggles }  from './ui/panels.js';
import { initClock }         from './ui/clock.js';
import { initTheme, initThemeToggle } from './ui/theme.js';

// Hero scene
import { renderHeroScene }   from './hero/scene.js';

// ═══════════════════════════════════════════════
// 1. Apply theme FIRST (prevents flash of wrong colors)
// ═══════════════════════════════════════════════
initTheme(config.site.defaultTheme);

// Set page title
document.title = config.site.title;

// ═══════════════════════════════════════════════
// 2. Render all sections from config data
// ═══════════════════════════════════════════════
renderTopBar(config.character, 'top-bar');
renderLeftPanel(config, 'left-panel');
renderRightPanel(config, 'right-panel');
renderBottomBar(config, 'bottom-bar');

// Main panel: create the tab structure, then render content into each tab
const mainPanel = document.getElementById('main-panel');
mainPanel.innerHTML = `
  <div class="tab-bar">
    <button class="tab-btn active" data-tab="quests">QUEST LOG</button>
    <button class="tab-btn" data-tab="map">WORLD MAP</button>
    <button class="tab-btn" data-tab="achievements">ACHIEVEMENTS</button>
    <button class="tab-btn" data-tab="magnets">MAGNETS</button>
  </div>
  <div id="tab-quests" class="tab-content active"></div>
  <div id="tab-map" class="tab-content">
    <div class="map-container">
      <div class="map-zoom-layer">
        <canvas id="map-canvas"></canvas>
        <canvas id="flight-canvas"></canvas>
        <div class="map-overlay-pins" id="map-pins"></div>
      </div>
      <div class="map-controls">
        <button class="map-zoom-btn" id="map-zoom-in" title="Zoom in">+</button>
        <button class="map-zoom-btn" id="map-zoom-out" title="Zoom out">−</button>
        <button class="map-zoom-btn" id="map-zoom-reset" title="Reset">⟲</button>
      </div>
      <div class="map-legend">
        <div class="legend-item"><div class="legend-dot" style="background:var(--green);"></div> Visited</div>
        <div class="legend-item"><div class="legend-dot" style="background:var(--gold);"></div> Current</div>
        <div class="legend-item"><div class="legend-dot" style="background:var(--cyan);"></div> Planned</div>
        <div class="legend-item"><div class="legend-dot" style="background:#fff;"></div> Home</div>
        <div class="legend-item"><div style="width:12px;border-top:1px dashed var(--gold);"></div> Flight</div>
      </div>
      <div class="map-stats">
        <span>${config.travelStats.find(s => s.label === 'Flights Taken')?.value || config.flights.length}</span> flights &middot;
        <span>${config.travelStats.find(s => s.label === 'Countries')?.value || '?'}</span> countries &middot;
        <span>${config.travelStats.find(s => s.label === 'Continents')?.value || '?'}</span> continents
      </div>
    </div>
  </div>
  <div id="tab-achievements" class="tab-content"></div>
  <div id="tab-magnets" class="tab-content"></div>
`;

// Render tab contents
renderQuestLog(config.quests, 'tab-quests');
initMap(config.cities, config.flights, config.continents, config.terrain);
renderAchievements(config.achievements, 'tab-achievements');
renderMagnets(config.magnets, 'tab-magnets');

// ═══════════════════════════════════════════════
// 3. Wire up interactions (DOM exists now)
// ═══════════════════════════════════════════════
initTabs();
initMapZoom();
initTooltips();
initPanelToggles();
initClock(config.cities.filter(c => c.status === 'visited').length);
initThemeToggle();

// ═══════════════════════════════════════════════
// 4. Render hero scene
// ═══════════════════════════════════════════════
renderHeroScene();

// ═══════════════════════════════════════════════
// 5. Welcome toast
// ═══════════════════════════════════════════════
setTimeout(() => showToast('📍', config.site.welcomeMessage), 1200);

// ═══════════════════════════════════════════════
// 6. Live weather (non-blocking async)
// ═══════════════════════════════════════════════
initLiveWeather();
