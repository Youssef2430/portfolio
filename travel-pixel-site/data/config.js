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
    welcomeMessage: 'Welcome back to Marrakech!',  // Toast shown on load
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
    { slot: 'head',      emoji: '🧢', name: "Explorer's Cap", type: 'Headgear',  description: '+5 Sun Resist, +2 Style' },
    { slot: 'weapon',    emoji: '📷', name: 'Sony A7III',     type: 'Main Hand', description: '+12 Photography, +5 Memory Capture' },
    { slot: 'body',      emoji: '🦺', name: 'Travel Vest',    type: 'Armor',     description: '+8 Pocket Space, +4 Comfort' },
    { slot: 'accessory', emoji: '🧭', name: 'Compass',        type: 'Accessory', description: '+7 Navigation, Cannot get lost' },
    { slot: 'feet',      emoji: '🥾', name: 'Trail Runners',  type: 'Footwear',  description: '+6 Terrain, +3 Stamina Regen' },
  ],

  // ─── INVENTORY ───────────────────────────────────────────
  // Add items below. Empty slots are auto-filled up to inventoryMax.
  // Each item: { emoji, name, type, description, count? }
  // count is optional — only add it for stackable items.
  inventoryMax: 20,
  inventory: [
    { emoji: '🛂', name: 'Passport',       type: 'Key Item',    description: 'Your most valuable possession' },
    { emoji: '🎫', name: 'Boarding Pass',   type: 'Quest Item',  description: 'YUL → RAK, Seat 14A' },
    { emoji: '🗺️', name: 'World Map',       type: 'Key Item',    description: 'Reveals all discovered locations' },
    { emoji: '🫖', name: 'Mint Tea',        type: 'Consumable',  description: 'Restores 20 HP. Moroccan blend.', count: 5 },
    { emoji: '🍜', name: 'Ramen Bowl',      type: 'Consumable',  description: 'Restores 35 HP. Tonkotsu.', count: 2 },
    { emoji: '🥐', name: 'Croissant',       type: 'Consumable',  description: 'Restores 15 HP. Flaky & buttery.', count: 3 },
    { emoji: '🥘', name: 'Paella',          type: 'Consumable',  description: 'Restores 30 HP. Barcelona special.', count: 1 },
    { emoji: '📓', name: 'Travel Journal',  type: 'Key Item',    description: 'Auto-records adventures' },
    { emoji: '📖', name: 'Phrasebook',      type: 'Tool',        description: '+5 Communication in any language' },
    { emoji: '🔋', name: 'Power Bank',      type: 'Tool',        description: 'Restores device charge. 20000mAh.' },
    { emoji: '🪙', name: 'Lucky Coin',      type: 'Trinket',     description: 'Found in a Parisian fountain. +1 Luck' },
    { emoji: '💌', name: 'Postcard Stack',  type: 'Collectible', description: 'From every visited city', count: 11 },
    { emoji: '🫙', name: 'Tagine Spice',    type: 'Material',    description: 'Can be traded with NPC chefs' },
    { emoji: '🧇', name: 'Stroopwafel',     type: 'Consumable',  description: 'Restores 10 HP. Amsterdam souvenir.', count: 4 },
  ],

  // ─── TRAVEL STATS ───────────────────────────────────────
  travelStats: [
    { label: 'Cities Visited', value: '11' },
    { label: 'Countries',      value: '7' },
    { label: 'Continents',     value: '3' },
    { label: 'Days Traveled',  value: '68' },
    { label: 'Photos Taken',   value: '3,412' },
    { label: 'Flights Taken',  value: '14' },
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
      status: 'active',
      name: 'The Moroccan Chronicles',
      nameArabic: 'الحكايات',
      location: 'Marrakech, Morocco',
      date: 'APR 2025',
      xp: 200,
      narrative: 'Lost in the medina in the best way possible. The souks are an overload of color, scent, and sound. Every wrong turn leads to something magical.',
      objectives: [
        { text: 'Arrive at Riad in Medina',        done: true },
        { text: 'Explore Jemaa el-Fnaa square',    done: true },
        { text: 'Drink mint tea with a local',      done: true },
        { text: 'Visit the Majorelle Garden',       done: false },
        { text: 'Haggle successfully in the souks', done: false },
        { text: 'Day trip to Atlas Mountains',      done: false },
      ],
      rewards: ['200 XP', '🍲 Tagine Recipe', '📷 +3 Photos'],
    },
    {
      status: 'completed',
      name: 'The Mediterranean Arc',
      location: 'Barcelona → Nerja → Nice → Cote d\'Azur',
      date: 'SUMMER 2024',
      xp: 400,
      narrative: 'The great southern European coastal run. From the Gaudi-laced streets of Barcelona, down to the whitewashed cliffs of Nerja, across to the azure coast of Nice and the French Riviera. Sun, sea, and an unreasonable amount of seafood.',
      objectives: [
        { text: 'Wander La Rambla at sunset',       done: true },
        { text: 'See the Balcon de Europa in Nerja', done: true },
        { text: 'Walk the Promenade des Anglais',    done: true },
        { text: 'Swim in the Riviera',               done: true },
      ],
      rewards: ['400 XP', '🎉 Title: Coastal Wanderer'],
    },
    {
      status: 'completed',
      name: 'City of Light & Croissants',
      location: 'Paris, France',
      date: 'JUN 2024',
      xp: 280,
      narrative: 'Explored the Louvre, wandered through Montmartre at sunset, ate croissants at every corner cafe.',
      objectives: [
        { text: 'Visit the Louvre Museum',            done: true },
        { text: 'Climb the Eiffel Tower',             done: true },
        { text: 'Sunset at Montmartre',               done: true },
        { text: 'Eat 10 croissants (daily quest)',    done: true },
      ],
    },
    {
      status: 'completed',
      name: 'Canals & Golden Light',
      location: 'Amsterdam, Netherlands',
      date: 'JUN 2024',
      xp: 220,
      narrative: 'Biking along the canals, Van Gogh Museum in the rain, and stroopwafels from every street vendor in sight.',
    },
    {
      status: 'completed',
      name: 'Land of the Rising Sun',
      location: 'Tokyo, Japan',
      date: 'MAR 2024',
      xp: 350,
      narrative: 'Two weeks during cherry blossom season. From the neon chaos of Shibuya to the serene temples of Asakusa. Ramen count: 23.',
      objectives: [
        { text: 'Visit Senso-ji Temple',                 done: true },
        { text: 'Cross Shibuya Crossing at peak hour',   done: true },
        { text: 'Eat ramen at a hidden Shinjuku shop',  done: true },
        { text: 'Ride the Shinkansen to Kyoto',          done: true },
      ],
      rewards: ['350 XP', '🎉 Title: Sakura Seeker', '🍜 Ramen Mastery'],
    },
    {
      status: 'completed',
      name: 'Big Apple After Dark',
      location: 'New York, USA',
      date: 'DEC 2023',
      xp: 300,
      narrative: 'NYC during the holidays. The Rockefeller tree, ice skating in Central Park, Broadway shows, and the best 2am pizza in Brooklyn.',
    },
    {
      status: 'completed',
      name: 'Atlantic Coast Memories',
      nameArabic: 'ذكريات',
      location: 'Larache, Morocco',
      date: '2024',
      xp: 180,
      narrative: 'The quiet Atlantic-side town where time moves differently. Fresh fish by the port, old medina walls, and sunsets that paint the whole sky.',
    },
    {
      status: 'completed',
      name: 'West Coast Detour',
      questTypeOverride: 'side',  // Shows as "SIDE QUEST" but completed
      location: 'Victoria, BC \u2022 Chelsea, QC \u2022 Ottawa',
      date: 'ONGOING',
      xp: 150,
      narrative: 'Home-base adventures across Canada. Victoria\'s island charm, Chelsea\'s Gatineau hills, and Ottawa\'s familiar streets.',
    },
    {
      status: 'upcoming-main',
      name: 'Island of the Gods',
      location: 'Bali, Indonesia',
      date: 'AUG 2025',
      xp: 250,
      narrative: 'Rice terraces, temple ceremonies, surf sessions, and digital nomad cafes. The ultimate island escape.',
      objectives: [
        { text: 'Tegallalang Rice Terraces',     done: false },
        { text: 'Sunrise hike on Mount Batur',   done: false },
        { text: 'Learn to surf in Canggu',       done: false },
        { text: 'Uluwatu Temple at sunset',      done: false },
      ],
    },
    {
      status: 'upcoming-side',
      name: 'Fire & Ice Expedition',
      location: 'Reykjavik, Iceland',
      date: 'DEC 2025',
      xp: 400,
      narrative: 'Northern lights, geothermal lagoons, volcanic landscapes. The ultimate winter adventure.',
    },
  ],

  // ─── MAP: CITIES ────────────────────────────────────────
  // status: 'home' | 'visited' | 'current' | 'planned'
  cities: [
    { name: 'Ottawa',     lon: -75.7, lat: 45.4, status: 'home',    label: 'OTTAWA (HOME)' },
    { name: 'Chelsea',    lon: -75.8, lat: 45.5, status: 'visited', label: 'CHELSEA, QC' },
    { name: 'Victoria',   lon:-123.4, lat: 48.4, status: 'visited', label: 'VICTORIA, BC' },
    { name: 'New York',   lon: -74.0, lat: 40.7, status: 'visited', label: 'NEW YORK' },
    { name: 'Paris',      lon:   2.4, lat: 48.9, status: 'visited', label: 'PARIS' },
    { name: 'Amsterdam',  lon:   4.9, lat: 52.4, status: 'visited', label: 'AMSTERDAM' },
    { name: 'Barcelona',  lon:   2.2, lat: 41.4, status: 'visited', label: 'BARCELONA' },
    { name: 'Nice',       lon:   7.3, lat: 43.7, status: 'visited', label: 'NICE / COTE D\'AZUR' },
    { name: 'Nerja',      lon:  -3.9, lat: 36.7, status: 'visited', label: 'NERJA' },
    { name: 'Larache',    lon:  -6.2, lat: 35.2, status: 'visited', label: 'LARACHE' },
    { name: 'Marrakech',  lon:  -8.0, lat: 31.6, status: 'current', label: 'MARRAKECH \u2605' },
    { name: 'Tokyo',      lon: 139.7, lat: 35.7, status: 'visited', label: 'TOKYO' },
    { name: 'Bali',       lon: 115.2, lat: -8.7, status: 'planned', label: 'BALI (PLANNED)' },
    { name: 'Reykjavik',  lon: -22.0, lat: 64.1, status: 'planned', label: 'REYKJAVIK (PLANNED)' },
  ],

  // ─── MAP: FLIGHTS ───────────────────────────────────────
  // Each entry: [fromCityName, toCityName]
  // Flights to 'planned' cities are drawn as dashed cyan lines.
  flights: [
    ['Ottawa', 'New York'],
    ['Ottawa', 'Tokyo'],
    ['Ottawa', 'Paris'],
    ['Paris', 'Amsterdam'],
    ['Amsterdam', 'Barcelona'],
    ['Barcelona', 'Nerja'],
    ['Nerja', 'Nice'],
    ['Nice', 'Larache'],
    ['Ottawa', 'Victoria'],
    ['Ottawa', 'Marrakech'],
    ['Marrakech', 'Bali'],
    ['Marrakech', 'Reykjavik'],
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
    { icon: '🌍', name: 'Globe Trotter',     description: 'Visit 3+ continents',                locked: false, date: 'Unlocked Mar 2024' },
    { icon: '🍜', name: 'Ramen Master',      description: 'Eat 20+ bowls of ramen',             locked: false, date: 'Unlocked Mar 2024' },
    { icon: '📸', name: 'Shutterbug',        description: 'Take 3000+ travel photos',           locked: false, date: 'Unlocked Jun 2024' },
    { icon: '✈️', name: 'Sky Rider',         description: 'Take 10+ flights',                   locked: false, date: 'Unlocked Apr 2025' },
    { icon: '🫖', name: 'Tea Ceremony',      description: 'Drink local tea in 3 countries',     locked: false, date: 'Unlocked Apr 2025' },
    { icon: '🌊', name: 'Coastal Wanderer',  description: 'Visit 4+ coastal cities in one trip',locked: false, date: 'Unlocked Summer 2024' },
    { icon: '🏠', name: 'Return Voyager',    description: 'Visit Morocco twice',                locked: false, date: 'Unlocked Apr 2025' },
    { icon: '🔒', name: 'Aurora Hunter',     description: 'Witness the Northern Lights',        locked: true },
    { icon: '🔒', name: 'Island Hopper',     description: 'Visit 3 island nations',             locked: true },
    { icon: '🔒', name: 'Seven Seas',        description: 'Visit all 7 continents',             locked: true },
  ],

  // ─── TRAVEL PARTY ──────────────────────────────────────
  // status: 'online' | 'away' | 'offline'
  party: [
    { emoji: '🧑‍💻', name: 'Youssef', role: 'PARTY LEADER',  status: 'online' },
    { emoji: '👩‍🎨', name: 'Sarah',   role: 'PHOTOGRAPHER',  status: 'online' },
    { emoji: '🧑‍🍳', name: 'Karim',   role: 'LOCAL GUIDE',   status: 'away' },
    { emoji: '👨‍💼', name: 'Mike',    role: 'TRAVEL BUDDY',  status: 'offline' },
  ],

  // ─── WEATHER ───────────────────────────────────────────
  weather: {
    icon: '☀️',
    temp: '34°C',
    description: 'Clear Skies',
    location: 'MARRAKECH, MA',
  },

  // ─── ACTIVITY FEED ─────────────────────────────────────
  // Each entry: { icon, html (raw HTML string), time }
  activity: [
    { icon: '📍', html: '<strong>You</strong> checked in at <strong>Jemaa el-Fnaa</strong>',        time: '2h ago' },
    { icon: '📸', html: '<strong>Sarah</strong> uploaded 12 photos from the <strong>Medina</strong>', time: '3h ago' },
    { icon: '🫖', html: '<strong>You</strong> completed: <strong>Drink mint tea</strong>',           time: '5h ago' },
    { icon: '⭐', html: '<strong>Achievement:</strong> Tea Ceremony',                                time: '5h ago' },
    { icon: '🎒', html: '<strong>Karim</strong> joined travel party',                                time: '1d ago' },
    { icon: '✈️', html: '<strong>You</strong> arrived in <strong>Marrakech</strong>',                 time: '5d ago' },
    { icon: '🏆', html: '<strong>Quest:</strong> Mediterranean Arc complete',                         time: '10d ago' },
  ],
};
