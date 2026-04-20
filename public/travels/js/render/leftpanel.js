// ═══════════════════════════════════════════════
// LEFT PANEL — Equipment, inventory, travel stats
// ═══════════════════════════════════════════════

function renderEquipment(equipment) {
  const slotLabels = { head: 'HEAD', weapon: 'MAIN', body: 'BODY', accessory: 'ACC', feet: 'FEET' };
  const slots = equipment.map(item => `
    <div class="equip-slot" data-slot="${item.slot}"
         data-tooltip="${item.name}|${item.type}|${item.description}">
      ${item.emoji}<span class="slot-label">${slotLabels[item.slot] || item.slot.toUpperCase()}</span>
    </div>
  `).join('');

  return `
    <div class="panel-section">
      <div class="panel-header" data-toggle>
        EQUIPMENT <span class="toggle">&#9660;</span>
      </div>
      <div class="equip-grid">${slots}</div>
    </div>
  `;
}

function renderInventory(inventory, max) {
  const items = [...inventory];
  // Pad with empty slots
  while (items.length < max) items.push(null);

  const slots = items.map(item => {
    if (!item) return '<div class="inv-slot empty"></div>';
    const tooltip = `${item.name}|${item.type}|${item.description}`;
    const count = item.count ? `<span class="inv-count">x${item.count}</span>` : '';
    return `<div class="inv-slot" data-tooltip="${tooltip}">${item.emoji}${count}</div>`;
  }).join('');

  return `
    <div class="panel-section">
      <div class="panel-header" data-toggle>
        INVENTORY (${inventory.length}/${max}) <span class="toggle">&#9660;</span>
      </div>
      <div class="inventory-grid">${slots}</div>
    </div>
  `;
}

function renderTravelStats(stats) {
  const rows = stats.map(s =>
    `<div class="tstat"><span class="tstat-label">${s.label}</span><span class="tstat-val">${s.value}</span></div>`
  ).join('');

  return `
    <div class="panel-section">
      <div class="panel-header" data-toggle>
        TRAVEL STATS <span class="toggle">&#9660;</span>
      </div>
      <div class="travel-stats">${rows}</div>
    </div>
  `;
}

export function renderLeftPanel(config, containerId) {
  const el = document.getElementById(containerId);
  el.innerHTML =
    renderEquipment(config.equipment) +
    renderInventory(config.inventory, config.inventoryMax) +
    renderTravelStats(config.travelStats);
}
