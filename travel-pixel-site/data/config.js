// ═══════════════════════════════════════════════════════════════
// TRAVEL JOURNAL CONFIG — Edit this file to customize everything!
// ═══════════════════════════════════════════════════════════════
//
// This is the only file you need to touch to personalize your
// travel journal. Change your name, add quests, update your
// inventory — it all lives here.
//
// ═══════════════════════════════════════════════════════════════

export default {

  // ─── SITE SETTINGS ───────────────────────────────────────
  site: {
    title: 'Travel「رحلات」Journal',
    welcomeMessage: 'Welcome back!',  // Toast shown on load
    currentDay: 10,                                 // Shown in bottom-bar clock
    defaultTheme: 'night',                          // 'night' or 'day'
  },

  // ─── YOUR CHARACTER ──────────────────────────────────────
  character: {
    name: 'YOUSSEF',
    nameArabic: 'يوسف',         // Arabic name (leave empty '' to hide)
    class: 'DIGITAL NOMAD',
    level: 14,
    emoji: '🧑‍💻',
    hp:      { current: 88,  max: 100 },
    xp:      { current: 720, max: 1000 },
    stamina: { current: 95,  max: 100 },
  },

  // ─── EQUIPMENT (5 slots: head, weapon, body, accessory, feet) ──
  equipment: [
    { slot: 'head',      emoji: '🧢', name: "Explorer's Cap", type: 'Headgear',  description: '+5 Sun Resist. Survived the Côte d\'Azur.' },
    { slot: 'weapon',    emoji: '📷', name: 'Sony A7III',     type: 'Main Hand', description: '+12 Photography. 3,412 memories captured.' },
    { slot: 'body',      emoji: '🦺', name: 'Travel Vest',    type: 'Armor',     description: '+8 Pocket Space. Road-trip tested.' },
    { slot: 'accessory', emoji: '🤿', name: 'Snorkel Mask',   type: 'Accessory', description: '+6 Underwater Vision. Paloma Beach veteran.' },
    { slot: 'feet',      emoji: '🥾', name: 'Trail Runners',  type: 'Footwear',  description: '+6 Terrain. Caminito del Rey survivor.' },
  ],

  // ─── INVENTORY ───────────────────────────────────────────
  // Add items below. Empty slots are auto-filled up to inventoryMax.
  // Each item: { emoji, name, type, description, count? }
  // count is optional — only add it for stackable items.
  inventoryMax: 20,
  inventory: [
    { emoji: '🛂', name: 'Passport',       type: 'Key Item',    description: 'Your most valuable possession' },
    { emoji: '🎫', name: 'Boarding Pass',   type: 'Quest Item',  description: 'AMS → NCE, Window Seat' },
    { emoji: '🗺️', name: 'World Map',       type: 'Key Item',    description: 'Reveals all discovered locations' },
    { emoji: '🫖', name: 'Mint Tea',        type: 'Consumable',  description: 'Restores 20 HP. Larache blend.', count: 5 },
    { emoji: '🥐', name: 'Croissant',       type: 'Consumable',  description: 'Restores 15 HP. Nice boulangerie.', count: 3 },
    { emoji: '🥘', name: 'Paella',          type: 'Consumable',  description: 'Restores 30 HP. Barcelona special.', count: 1 },
    { emoji: '📓', name: 'Travel Journal',  type: 'Key Item',    description: 'Auto-records adventures' },
    { emoji: '📖', name: 'Phrasebook',      type: 'Tool',        description: '+5 Communication in any language' },
    { emoji: '🔋', name: 'Power Bank',      type: 'Tool',        description: 'Restores device charge. 20000mAh.' },
    { emoji: '💌', name: 'Postcard Stack',  type: 'Collectible', description: 'From every visited city', count: 10 },
    { emoji: '🧇', name: 'Stroopwafel',     type: 'Consumable',  description: 'Restores 10 HP. Amsterdam souvenir.', count: 4 },
    { emoji: '🐟', name: 'Sardine Espeto',  type: 'Consumable',  description: 'Restores 25 HP. Grilled Málaga-style.', count: 3 },
    { emoji: '📡', name: 'Travel Router',   type: 'Tool',        description: 'Beryl AX. +10 Connectivity anywhere.' },
    { emoji: '🏄', name: 'Surfboard Wax',   type: 'Consumable',  description: 'Grip boost. Halifax beach find.', count: 2 },
  ],

  // ─── TRAVEL STATS ───────────────────────────────────────
  travelStats: [
    { label: 'Cities Visited', value: '11' },
    { label: 'Countries',      value: '5' },
    { label: 'Continents',     value: '3' },
    { label: 'Days Traveled',  value: '18' },
    { label: 'Photos Taken',   value: '3,412' },
    { label: 'Flights Taken',  value: '5' },
    { label: 'KM Walked',      value: '512' },
    { label: 'Meals Eaten',    value: '204' },
    { label: 'Friends Made',   value: '41' },
  ],

  // ─── QUEST LOG ──────────────────────────────────────────
  // status: 'active' | 'completed' | 'upcoming-main' | 'upcoming-side'
  // Each quest can have: name, nameArabic?, location, date, xp,
  //   narrative, objectives[]?, rewards[]?
  quests: [
    {
      status: 'completed',
      name: 'The Mediterranean Arc',
      location: 'Amsterdam → Nice → Barcelona → Málaga',
      date: 'SUMMER 2025',
      xp: 400,
      narrative: 'Nine days carving a sun-soaked arc from the Dutch canals to the Andalusian coast. Snorkeling secret Riviera coves, sunset-chasing from Castle Hill and the Bunkers del Carmel, hiking cliff trails on the Costa Brava, kayaking to waterfalls in Nerja, wandering Frigiliana\'s white lanes, and walking the vertigo-inducing Caminito del Rey gorge. An unreasonable amount of seafood and sardine espetos along the way.',
      objectives: [
        { text: 'Walk the Jordaan canals in Amsterdam',     done: true },
        { text: 'Hike Sentier Littoral to Paloma Beach',    done: true },
        { text: 'Coastal trail from Monaco to Plage de la Mala', done: true },
        { text: 'Sunset picnic at Bunkers del Carmel',      done: true },
        { text: 'Hike Camí de Ronda on the Costa Brava',    done: true },
        { text: 'Kayak to the Maro waterfall in Nerja',     done: true },
        { text: 'Wander Frigiliana\'s white-village lanes',  done: true },
        { text: 'Walk the Caminito del Rey gorge',          done: true },
      ],
      rewards: ['400 XP', '🎉 Title: Coastal Wanderer'],
    },
    {
      status: 'completed',
      name: 'The Atlantic Road',
      questTypeOverride: 'side',
      location: 'Ottawa → Quebec City → Moncton → Halifax',
      date: 'SUMMER 2024',
      xp: 280,
      narrative: 'Seven-day road trip with the crew — five friends, one car, and the open Trans-Canada. From Quebec City\'s old-world charm through New Brunswick\'s record-breaking tides at Hopewell Rocks, to finally catching waves on Nova Scotia\'s coast. Discovered a new obsession: surfing.',
      objectives: [
        { text: 'Road trip Ottawa → Quebec City',          done: true },
        { text: 'Drive to Moncton, catch up with Aya',    done: true },
        { text: 'See Hopewell Rocks\' highest tides',      done: true },
        { text: 'Surf for the first time in Halifax',      done: true },
        { text: 'Catch a second surf session',             done: true },
        { text: 'Survive the 8h+ drive home',              done: true },
      ],
      rewards: ['280 XP', '🏄 Title: Wave Rider'],
    },
    {
      status: 'completed',
      name: 'Atlantic Coast Memories',
      nameArabic: 'ذكريات',
      location: 'Larache → Tangier, Morocco',
      date: 'WINTER 2024',
      xp: 180,
      narrative: 'The quiet Atlantic-side town where time moves differently. Fresh fish by the port, old medina walls, and sunsets that paint the whole sky. A day trip north to Tangier for the Kasbah and the Caves of Hercules.',
      objectives: [
        { text: 'Fresh fish at Larache port',            done: true },
        { text: 'Walk the old medina walls',             done: true },
        { text: 'Day trip to Tangier',                   done: true },
        { text: 'See the Caves of Hercules',             done: true },
        { text: 'Watch the Atlantic sunset',             done: true },
      ],
      rewards: ['180 XP', '🌅 Title: Atlantic Dreamer'],
    },
    {
      status: 'upcoming-main',
      name: 'The Grand Continental',
      location: 'Paris → Italy → Switzerland → Nice → Rabat',
      date: 'JUN 2026',
      xp: 500,
      narrative: 'The big one. Sixteen days across four countries — Parisian sunsets, Italian coastal trails, Swiss alpine peaks at Jungfraujoch, the Riviera one more time, then onward to Morocco.',
      objectives: [
        { text: 'Sunset at Sacré-Cœur, Paris',            done: false },
        { text: 'Climb Milan\'s Duomo rooftop',            done: false },
        { text: 'Ferry across Lake Como',                  done: false },
        { text: 'Hike the Cinque Terre coastal trail',     done: false },
        { text: 'Reach Jungfraujoch — Top of Europe',      done: false },
        { text: 'Swim at Plage de la Gravette, Antibes',   done: false },
      ],
    },
  ],

  // ─── MAP: CITIES ────────────────────────────────────────
  // status: 'home' | 'visited' | 'current' | 'planned'
  cities: [
    // Home
    { name: 'Ottawa',       lon: -75.7, lat: 45.4, status: 'home',    label: 'OTTAWA (HOME)' },
    // Maritimes road trip
    { name: 'Quebec City',  lon: -71.2, lat: 46.8, status: 'visited', label: 'QUEBEC CITY' },
    { name: 'Moncton',      lon: -64.8, lat: 46.1, status: 'visited', label: 'MONCTON' },
    { name: 'Fredericton',  lon: -66.6, lat: 45.9, status: 'visited', label: 'FREDERICTON' },
    { name: 'Halifax',      lon: -63.6, lat: 44.6, status: 'visited', label: 'HALIFAX' },
    // Mediterranean Arc
    { name: 'Amsterdam',    lon:   4.9, lat: 52.4, status: 'visited', label: 'AMSTERDAM' },
    { name: 'Nice',         lon:   7.3, lat: 43.7, status: 'visited', label: 'NICE / COTE D\'AZUR' },
    { name: 'Barcelona',    lon:   2.2, lat: 41.4, status: 'visited', label: 'BARCELONA' },
    { name: 'Málaga',       lon:  -4.4, lat: 36.7, status: 'visited', label: 'MÁLAGA' },
    { name: 'Nerja',        lon:  -3.9, lat: 36.7, status: 'visited', label: 'NERJA' },
    // Atlantic Coast
    { name: 'Larache',      lon:  -6.2, lat: 35.2, status: 'visited', label: 'LARACHE' },
    { name: 'Tangier',      lon:  -5.8, lat: 35.8, status: 'visited', label: 'TANGIER' },
    // Planned — Europe 2026
    { name: 'Paris',        lon:   2.4, lat: 48.9, status: 'planned', label: 'PARIS (PLANNED)' },
    { name: 'Milan',        lon:   9.2, lat: 45.5, status: 'planned', label: 'MILAN (PLANNED)' },
    { name: 'Lucerne',      lon:   8.3, lat: 47.0, status: 'planned', label: 'LUCERNE (PLANNED)' },
    { name: 'Geneva',       lon:   6.1, lat: 46.2, status: 'planned', label: 'GENEVA (PLANNED)' },
    { name: 'Rabat',        lon:  -6.8, lat: 34.0, status: 'planned', label: 'RABAT (PLANNED)' },
  ],

  // ─── MAP: FLIGHTS ───────────────────────────────────────
  // Each entry: [fromCityName, toCityName]
  // Flights to 'planned' cities are drawn as dashed cyan lines.
  flights: [
    // Mediterranean Arc (Summer 2025)
    ['Ottawa', 'Amsterdam'],
    ['Amsterdam', 'Nice'],
    ['Nice', 'Barcelona'],
    ['Barcelona', 'Málaga'],
    ['Málaga', 'Nerja'],
    ['Málaga', 'Larache'],
    ['Larache', 'Tangier'],
    // Maritimes road trip (Summer 2024)
    ['Ottawa', 'Quebec City'],
    ['Quebec City', 'Moncton'],
    ['Moncton', 'Halifax'],
    ['Halifax', 'Fredericton'],
    ['Fredericton', 'Ottawa'],
    // Planned — Europe 2026
    ['Ottawa', 'Paris'],
    ['Paris', 'Milan'],
    ['Milan', 'Lucerne'],
    ['Lucerne', 'Geneva'],
    ['Geneva', 'Nice'],
    ['Nice', 'Rabat'],
  ],

  // ─── MAP: CONTINENT POLYGONS ────────────────────────────
  // You probably don't need to edit these — they define the
  // landmass shapes on the world map. Each is an array of
  // [longitude, latitude] coordinate pairs.
  continents: [
    // North America
    [[-130,55],[-125,50],[-120,37],[-110,32],[-105,30],[-100,26],[-97,20],[-90,15],[-85,10],[-82,10],[-82,25],[-80,30],[-75,35],[-72,42],[-67,45],[-56,48],[-60,55],[-65,60],[-75,60],[-95,68],[-105,72],[-130,72],[-145,62],[-165,62],[-168,65],[-170,72],[-130,55]],
    // Greenland
    [[-55,60],[-42,60],[-22,70],[-20,80],[-35,84],[-52,80],[-55,72],[-55,60]],
    // South America
    [[-80,10],[-77,5],[-72,0],[-55,-2],[-42,-3],[-35,-8],[-38,-15],[-42,-22],[-50,-28],[-55,-35],[-68,-55],[-73,-48],[-75,-40],[-72,-20],[-77,-5],[-80,5],[-80,10]],
    // Europe
    [[-10,36],[-5,44],[0,44],[3,48],[8,46],[12,44],[15,38],[20,38],[28,42],[30,47],[28,55],[25,60],[30,62],[30,70],[20,72],[10,65],[5,62],[-5,58],[-10,52],[-10,36]],
    // UK
    [[-6,50],[0,51],[2,56],[-1,58],[-5,56],[-6,50]],
    // Africa
    [[-18,15],[-15,28],[-5,36],[10,37],[12,34],[32,32],[42,12],[52,0],[42,-5],[38,-15],[35,-25],[28,-34],[18,-35],[12,-5],[10,5],[0,5],[-10,5],[-18,15]],
    // Asia
    [[28,42],[35,35],[42,28],[50,25],[60,25],[68,30],[78,28],[82,22],[80,8],[88,22],[95,10],[100,2],[108,15],[118,25],[125,35],[130,42],[142,46],[155,60],[170,65],[180,68],[180,72],[140,58],[120,55],[80,55],[60,55],[50,42],[40,42],[28,42]],
    // Japan
    [[130,31],[135,35],[140,42],[143,46],[140,40],[130,31]],
    // SE Asia / Indonesia
    [[95,-5],[105,-5],[115,-8],[125,-5],[135,-3],[140,-8],[130,-8],[115,-10],[105,-8],[95,-5]],
    // Australia
    [[114,-12],[130,-12],[145,-16],[152,-26],[148,-34],[135,-36],[120,-34],[114,-25],[115,-18],[114,-12]],
    // New Zealand
    [[170,-35],[175,-42],[178,-46],[175,-46],[170,-38],[170,-35]],
  ],

  // ─── ACHIEVEMENTS ───────────────────────────────────────
  // locked: true  → grayed out with 🔒 icon
  // locked: false → unlocked, shows the icon and date
  achievements: [
    { icon: '🌍', name: 'Globe Trotter',     description: 'Visit 3+ continents',                locked: false, date: 'Unlocked Summer 2025' },
    { icon: '📸', name: 'Shutterbug',        description: 'Take 3000+ travel photos',           locked: false, date: 'Unlocked Summer 2025' },
    { icon: '✈️', name: 'Sky Rider',         description: 'Take 10+ flights',                   locked: false, date: 'Unlocked Summer 2025' },
    { icon: '🌊', name: 'Coastal Wanderer',  description: 'Visit 4+ coastal cities in one trip',locked: false, date: 'Unlocked Summer 2025' },
    { icon: '🏄', name: 'Wave Rider',        description: 'Catch your first wave',              locked: false, date: 'Unlocked Summer 2024' },
    { icon: '🔒', name: 'Summit Seeker',     description: 'Reach Jungfraujoch, Top of Europe',  locked: true },
    { icon: '🔒', name: 'Aurora Hunter',     description: 'Witness the Northern Lights',        locked: true },
    { icon: '🔒', name: 'Seven Seas',        description: 'Visit all 7 continents',             locked: true },
  ],

  // ─── SKILL TREE ──────────────────────────────────────
  // Each skill: { emoji, name, level (1-5), maxLevel, desc }
  skills: [
    { emoji: '🏄', name: 'Surfing',       level: 2, maxLevel: 5, desc: 'Halifax waves' },
    { emoji: '🥾', name: 'Hiking',        level: 4, maxLevel: 5, desc: 'Caminito del Rey' },
    { emoji: '🛶', name: 'Kayaking',      level: 1, maxLevel: 5, desc: 'Maro cliffs' },
    { emoji: '🏊', name: 'Swimming',      level: 3, maxLevel: 5, desc: 'Côte d\'Azur' },
    { emoji: '🍽️', name: 'Local Cuisine', level: 4, maxLevel: 5, desc: 'Espetos & socca' },
    { emoji: '🗣️', name: 'Languages',     level: 3, maxLevel: 5, desc: 'FR · ES · AR' },
    { emoji: '📷', name: 'Photography',   level: 3, maxLevel: 5, desc: '3,412 shots' },
    { emoji: '🚗', name: 'Road Trip',     level: 2, maxLevel: 5, desc: 'Trans-Canada' },
  ],

  // ─── LOOT LOG ──────────────────────────────────────────
  // Items collected from each trip
  lootLog: [
    { icon: '🐟', text: '<strong>Sardine Espeto</strong> — Pedregalejo, Málaga',   trip: 'MED ARC' },
    { icon: '🏄', text: '<strong>First Wave</strong> — Halifax, Nova Scotia',       trip: 'MARITIMES' },
    { icon: '🏖️', text: '<strong>Riviera Shell</strong> — Paloma Beach, Cap-Ferrat', trip: 'MED ARC' },
    { icon: '🧇', text: '<strong>Stroopwafel Box</strong> — Jordaan, Amsterdam',   trip: 'MED ARC' },
    { icon: '🌊', text: '<strong>Fundy Tide Stone</strong> — Hopewell Rocks, NB',  trip: 'MARITIMES' },
    { icon: '🐠', text: '<strong>Atlantic Catch</strong> — Port of Larache',       trip: 'LARACHE' },
    { icon: '🥘', text: '<strong>Paella Recipe</strong> — El Born, Barcelona',     trip: 'MED ARC' },
    { icon: '☕', text: '<strong>Tim Hortons Cup</strong> — Fredericton, NB',       trip: 'MARITIMES' },
  ],

  // ─── WEATHER (fallback — overridden by live fetch) ─────
  weather: {
    icon: '🌤️',
    temp: '--°C',
    description: 'Loading...',
    location: 'DETECTING...',
  },
};
