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
      status: 'upcoming-main',
      name: 'The Grand Continental',
      location: 'Paris → Italy → Switzerland → Nice → Rabat',
      date: 'SUMMER 2026',
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
      name: 'The Pacific Crossing',
      questTypeOverride: 'side',
      location: 'Ottawa → Toronto → Vancouver → Nanaimo → Tofino → Victoria',
      date: 'SUMMER 2024',
      xp: 350,
      narrative: 'Coast-to-coast across Canada with the crew — from Ottawa through Toronto\'s skyline to the wild Pacific coast. Island-hopping Vancouver Island by ferry, chasing surf in Tofino, braving ice-cold Pacific swims with zero wetsuits, and ending with Victoria\'s harbour sunsets. The definitive Canadian west-coast road trip.',
      objectives: [
        { text: 'CN Tower EdgeWalk with the squad in Toronto',          done: true },
        { text: 'Explore Kensington Market & grab street food together', done: true },
        { text: 'Bike the Stanley Park seawall in Vancouver',           done: true },
        { text: 'Crawl through Granville Island market as a group',     done: true },
        { text: 'Cross the Capilano Suspension Bridge',                 done: true },
        { text: 'Nanaimo bar tasting trail — rate every bakery',        done: true },
        { text: 'Group surf session at Cox Bay, Tofino',                done: true },
        { text: 'Beach bonfire under the stars in Tofino',              done: true },
        { text: 'Swim in the freezing Pacific — no wetsuits allowed',   done: true },
        { text: 'Hot Springs Cove boat trip & forest hike',             done: true },
        { text: 'Whale watching from Victoria\'s Inner Harbour',         done: true },
        { text: 'Sunset fish & chips at Fisherman\'s Wharf, Victoria',   done: true },
      ],
      rewards: ['350 XP', '🥶 Title: Polar Plunger'],
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
    // Pacific Crossing
    { name: 'Toronto',      lon: -79.4, lat: 43.7, status: 'visited', label: 'TORONTO' },
    { name: 'Vancouver',    lon: -123.1, lat: 49.3, status: 'visited', label: 'VANCOUVER' },
    { name: 'Nanaimo',      lon: -123.9, lat: 49.2, status: 'visited', label: 'NANAIMO' },
    { name: 'Tofino',       lon: -125.9, lat: 49.2, status: 'visited', label: 'TOFINO' },
    { name: 'Victoria',     lon: -123.4, lat: 48.4, status: 'visited', label: 'VICTORIA' },
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
    // Pacific Crossing (Summer 2024)
    ['Ottawa', 'Toronto'],
    ['Toronto', 'Vancouver'],
    ['Vancouver', 'Nanaimo'],
    ['Nanaimo', 'Tofino'],
    ['Tofino', 'Victoria'],
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
    // ── North America (mainland) ──
    [
      [-168,72],[-162,70],[-155,71],[-148,70],[-142,64],[-138,60],[-136,58],[-133,56],
      [-131,55],[-130,54],[-128,52],[-126,50],[-124,48],[-123,46],[-122,43],[-121,40],
      [-120,37],[-118,34],[-117,33],[-116,32],[-114,31],[-112,31],[-110,32],[-108,31],
      [-106,30],[-104,29],[-102,28],[-100,26],[-98,26],[-97,26],[-97,24],[-96,22],
      [-94,19],[-92,17],[-90,16],[-88,15],[-86,14],[-84,11],[-83,10],[-82,9],
      [-80,8],[-79,9],[-78,9],[-76,8],[-75,9],[-77,10],[-80,10],[-82,10],
      [-84,12],[-84,16],[-87,18],[-88,19],[-89,21],[-90,22],[-90,25],[-89,28],
      [-88,29],[-86,30],[-84,30],[-83,29],[-82,28],[-81,26],[-80,25],
      [-81,28],[-80,30],[-80,32],[-78,34],[-76,35],[-75,37],[-74,39],[-73,41],
      [-72,42],[-71,42],[-70,43],[-68,44],[-67,45],[-66,44],[-65,44],[-64,44],
      [-63,46],[-61,46],[-60,47],[-59,47],[-57,47],[-55,48],[-53,47],[-52,47],
      [-56,50],[-58,51],[-60,53],[-62,54],[-64,56],[-65,58],[-62,58],[-60,56],
      [-58,55],[-56,52],[-55,52],[-57,55],[-60,58],[-63,60],[-65,61],[-68,62],
      [-72,62],[-75,63],[-78,64],[-82,64],[-85,66],[-88,67],[-92,68],[-95,68],
      [-100,69],[-105,70],[-110,71],[-115,72],[-120,72],[-125,72],[-130,72],
      [-135,72],[-140,70],[-145,68],[-150,68],[-155,68],[-160,68],[-165,68],
      [-168,72],
    ],
    // ── Alaska ──
    [
      [-168,65],[-165,62],[-162,60],[-160,59],[-156,58],[-153,58],[-150,59],
      [-148,60],[-146,61],[-143,62],[-141,60],[-138,59],[-135,57],[-131,55],
      [-133,56],[-136,58],[-140,60],[-142,62],[-145,64],[-148,65],[-152,66],
      [-155,67],[-158,68],[-162,68],[-165,67],[-168,68],[-170,70],[-168,72],
      [-165,72],[-160,70],[-165,68],[-168,65],
    ],
    // ── Greenland ──
    [
      [-55,60],[-52,62],[-48,61],[-44,60],[-42,60],[-38,62],[-32,64],[-28,66],
      [-22,68],[-20,70],[-18,72],[-18,76],[-20,78],[-22,80],[-28,82],[-35,83],
      [-40,84],[-46,83],[-50,82],[-52,80],[-54,78],[-55,76],[-56,74],[-56,72],
      [-58,70],[-60,68],[-58,66],[-56,64],[-55,62],[-55,60],
    ],
    // ── Central America ──
    [
      [-88,18],[-86,16],[-84,14],[-84,12],[-83,10],[-82,9],[-80,8],[-79,9],
      [-78,9],[-77,8],[-76,8],[-75,9],[-77,10],[-80,10],[-82,10],[-84,12],
      [-84,14],[-86,14],[-87,16],[-88,18],
    ],
    // ── Cuba ──
    [
      [-85,22],[-83,23],[-81,23],[-79,22],[-77,20],[-75,20],[-74,20],
      [-76,20],[-78,21],[-80,22],[-82,23],[-84,23],[-85,22],
    ],
    // ── South America ──
    [
      [-80,10],[-78,8],[-76,7],[-75,5],[-74,4],[-72,2],[-70,2],[-68,1],
      [-65,1],[-62,2],[-60,3],[-56,2],[-52,2],[-50,1],[-48,0],[-46,-1],
      [-44,-2],[-42,-3],[-40,-3],[-38,-5],[-36,-6],[-35,-8],[-35,-10],
      [-36,-12],[-37,-14],[-38,-16],[-39,-18],[-40,-20],[-41,-22],[-43,-23],
      [-45,-24],[-47,-25],[-48,-27],[-50,-28],[-51,-30],[-52,-32],[-53,-33],
      [-54,-34],[-56,-35],[-58,-36],[-60,-38],[-62,-39],[-64,-42],[-65,-44],
      [-66,-46],[-67,-48],[-68,-50],[-68,-52],[-68,-54],[-68,-55],
      [-70,-53],[-72,-50],[-73,-48],[-74,-46],[-75,-44],[-75,-42],
      [-74,-40],[-73,-38],[-72,-36],[-72,-34],[-71,-32],[-71,-30],
      [-70,-28],[-70,-26],[-70,-24],[-70,-22],[-70,-20],[-70,-18],
      [-71,-16],[-72,-14],[-74,-12],[-75,-10],[-76,-8],[-76,-6],
      [-77,-4],[-78,-2],[-79,0],[-80,2],[-80,5],[-80,8],[-80,10],
    ],
    // ── Eurasia (single clean outline — Europe + Asia mainland) ──
    [
      // Start at SW Spain, go NORTH along Atlantic coast
      [-10,37],[-9,39],[-9,43],[-5,44],
      // Bay of Biscay → Brittany → Channel coast (stay WEST)
      [-4,47],[-2,48],[-1,49],[1,50],[2,51],
      [5,54],[8,55],[10,54],[13,54],[14,55],
      // Jutland / Denmark, then up Scandinavia
      [10,56],[8,58],[6,59],[5,60],[6,62],[8,64],[10,65],[12,67],
      [14,69],[18,70],[22,71],[26,72],[30,71],
      // East along arctic coast
      [32,70],[36,70],[40,70],[50,70],[60,68],[70,70],[80,72],
      [90,72],[100,72],[110,72],[120,72],[130,72],
      [140,68],[150,62],[155,59],[160,60],[170,66],[180,72],
      // Down Pacific coast
      [180,68],[170,64],[160,58],[155,56],[148,54],[142,50],
      [140,46],[138,44],[135,42],[132,40],
      // Korea
      [130,38],[128,36],[127,35],[126,34],[127,38],[130,40],[132,42],
      // China coast
      [122,32],[120,30],[118,28],[116,24],[114,22],[112,20],
      [110,18],[108,16],[108,12],[106,10],
      // SE Asia peninsula
      [106,8],[104,4],[104,2],[102,0],[100,2],[100,6],[102,10],
      [104,14],[102,16],[100,14],[98,10],[100,6],[98,4],[96,10],
      // Bay of Bengal → India
      [92,22],[90,20],[88,16],[86,14],[84,16],[82,20],
      [80,12],[80,8],[78,8],[76,10],[74,16],[72,20],
      [70,24],[68,28],[66,30],
      // Pakistan → Iran → Arabia
      [62,26],[58,26],[56,24],[54,22],[52,20],[50,24],
      [48,26],[46,28],[44,30],[42,28],[40,24],[38,18],
      [36,14],[34,12],[32,14],[34,18],[36,22],
      // Middle East → Turkey
      [36,28],[34,32],[30,36],[28,36],[26,36],
      [28,38],[30,40],[32,42],[36,42],
      // Black Sea → Eastern Europe
      [40,42],[42,42],[40,44],[38,44],
      [36,44],[34,46],[32,48],[30,52],
      // Baltic → Central Europe
      [28,55],[26,55],[24,55],[22,54],[20,52],[18,52],[16,52],
      // South through central Europe (stay EAST of the Atlantic path)
      [16,48],[18,46],[20,44],[22,42],[24,40],[26,38],
      // Greece → Med coast
      [22,36],[20,36],[16,38],[14,38],[12,38],
      // Up through Italy base → southern France → Pyrenees (stay EAST)
      [12,42],[10,44],[8,46],[6,44],[4,44],[2,44],
      [0,43],[-2,42],[-4,40],[-6,38],[-8,37],[-10,37],
    ],
    // ── Iberian Peninsula ──
    [
      [-10,37],[-9,39],[-9,43],[-5,44],[-2,44],[0,43],
      [0,41],[-1,39],[-4,37],[-6,37],[-8,37],[-10,37],
    ],
    // ── Italian Peninsula ──
    [
      [8,46],[10,46],[12,44],[13,43],[14,42],[15,40],
      [16,39],[16,38],[15,37],[14,38],[12,38],
      [12,40],[11,42],[10,44],[8,46],
    ],
    // ── Sicily ──
    [
      [13,38],[15,37],[16,38],[15,38],[13,38],
    ],
    // ── Sardinia + Corsica ──
    [
      [9,39],[9,41],[10,43],[10,41],[10,40],[9,39],
    ],
    // ── UK (Great Britain) ──
    [
      [-6,50],[-5,51],[-4,52],[-3,53],[-4,54],[-5,56],[-4,57],
      [-3,58],[-1,58],[0,57],[2,55],[1,53],[1,52],
      [0,51],[-2,51],[-5,50],[-6,50],
    ],
    // ── Ireland ──
    [
      [-10,52],[-9,53],[-8,55],[-6,55],[-6,53],[-8,52],[-10,52],
    ],
    // ── Iceland ──
    [
      [-24,64],[-22,64],[-18,65],[-14,66],[-14,65],[-18,64],
      [-22,63],[-24,64],
    ],
    // ── Africa ──
    [
      [-18,15],[-16,20],[-15,24],[-13,28],[-10,30],[-6,34],[-5,36],
      [0,36],[4,37],[8,37],[11,37],[12,35],[14,34],[18,33],
      [22,32],[26,32],[30,32],[32,32],[34,30],[36,28],[40,20],
      [44,12],[48,5],[51,0],[50,-2],[46,-6],[42,-10],[38,-14],
      [34,-22],[30,-28],[26,-32],[22,-34],[18,-35],
      [20,-32],[24,-28],[28,-20],[28,-16],[26,-12],[22,-4],
      [18,2],[14,5],[10,5],[6,4],[2,5],[-2,5],[-6,4],
      [-10,5],[-14,8],[-17,12],[-18,15],
    ],
    // ── Madagascar ──
    [
      [44,-12],[46,-15],[48,-20],[48,-24],[46,-26],[44,-26],
      [43,-22],[43,-16],[44,-12],
    ],
    // ── Arabian Peninsula ──
    [
      [34,30],[36,28],[40,24],[42,18],[44,14],[48,16],[52,20],
      [56,24],[56,26],[54,26],[50,24],[48,26],[44,30],
      [40,32],[36,34],[34,32],[34,30],
    ],
    // ── India ──
    [
      [68,30],[72,26],[76,20],[78,14],[80,8],
      [78,8],[76,12],[72,20],[68,26],[68,30],
    ],
    // ── Sri Lanka ──
    [
      [80,6],[82,8],[82,10],[80,10],[80,6],
    ],
    // ── SE Asia peninsula (Indochina) ──
    [
      [98,18],[100,14],[102,10],[104,6],[104,2],[106,2],[108,8],
      [108,14],[106,16],[104,18],[102,18],[100,16],[98,18],
    ],
    // ── Japan (Honshu) ──
    [
      [130,31],[132,34],[136,36],[140,40],[143,44],[144,46],
      [143,45],[140,42],[138,38],[134,34],[130,31],
    ],
    // ── Japan (Hokkaido) ──
    [
      [140,42],[142,43],[145,44],[145,43],[142,42],[140,42],
    ],
    // ── Korea ──
    [
      [126,34],[127,36],[128,38],[130,38],[129,36],[128,34],[126,34],
    ],
    // ── Philippines ──
    [
      [118,10],[120,14],[122,18],[121,16],[119,12],[118,10],
    ],
    // ── Taiwan ──
    [
      [120,22],[122,24],[122,26],[120,24],[120,22],
    ],
    // ── Borneo ──
    [
      [108,0],[112,2],[116,6],[118,6],[118,4],
      [116,0],[112,-2],[108,0],
    ],
    // ── Sumatra ──
    [
      [96,4],[100,2],[104,-2],[106,-6],
      [104,-6],[100,-2],[96,2],[96,4],
    ],
    // ── Java ──
    [
      [106,-6],[110,-7],[114,-8],[116,-8],
      [114,-9],[110,-8],[106,-7],[106,-6],
    ],
    // ── Papua / New Guinea ──
    [
      [130,-2],[136,-5],[140,-6],[144,-4],[148,-7],[150,-6],
      [146,-4],[142,-2],[138,-4],[134,-3],[130,-2],
    ],
    // ── Australia ──
    [
      [114,-12],[116,-14],[118,-14],[120,-14],[122,-14],[124,-14],
      [126,-13],[128,-12],[130,-12],[132,-12],[134,-12],[136,-12],
      [138,-14],[140,-16],[142,-16],[144,-16],[146,-18],[148,-20],
      [150,-22],[152,-24],[154,-26],[154,-28],[152,-30],[150,-32],
      [148,-34],[146,-36],[144,-38],[142,-38],[140,-38],[138,-36],
      [136,-36],[134,-36],[132,-34],[130,-34],[128,-32],[126,-32],
      [124,-34],[122,-34],[120,-34],[118,-32],[116,-30],[114,-28],
      [114,-26],[114,-24],[114,-22],[114,-20],[114,-18],[114,-16],
      [114,-14],[114,-12],
    ],
    // ── Tasmania ──
    [
      [144,-40],[146,-42],[148,-44],[148,-42],[146,-40],[144,-40],
    ],
    // ── New Zealand (North Island) ──
    [
      [172,-34],[174,-36],[178,-38],[178,-40],[176,-40],[174,-38],
      [172,-36],[172,-34],
    ],
    // ── New Zealand (South Island) ──
    [
      [168,-42],[170,-44],[172,-46],[172,-44],[170,-42],[168,-42],
    ],
    // ── Svalbard ──
    [
      [12,76],[16,78],[20,80],[24,80],[22,78],[18,76],[14,76],[12,76],
    ],
    // ── Novaya Zemlya ──
    [
      [50,70],[52,72],[54,74],[56,76],[54,76],[52,74],[50,72],[50,70],
    ],
    // ── Kamchatka ──
    [
      [156,52],[158,54],[160,56],[162,58],[160,60],[158,58],[156,56],[156,52],
    ],
  ],

  // ─── MAP: TERRAIN BIOMES ───────────────────────────────
  // type: 'forest' | 'jungle' | 'desert' | 'mountain' | 'tundra' | 'savanna'
  // Each terrain zone is a polygon of [lon, lat] pairs drawn on top of land.
  terrain: [
    // ═══ DESERTS ═══

    // Sahara
    { type: 'desert', poly: [
      [-14,28],[-10,30],[-5,33],[0,33],[5,32],[10,32],[15,30],[20,28],
      [25,26],[30,24],[32,22],[34,20],[30,16],[25,14],[20,14],[15,16],
      [10,18],[5,20],[0,22],[-5,22],[-10,24],[-14,26],[-14,28],
    ]},
    // Arabian Desert
    { type: 'desert', poly: [
      [36,28],[40,26],[44,22],[48,18],[52,20],[56,22],[56,26],
      [52,26],[48,26],[44,28],[40,30],[36,30],[36,28],
    ]},
    // Gobi Desert
    { type: 'desert', poly: [
      [90,48],[95,48],[100,46],[105,44],[110,42],[112,42],
      [112,44],[108,46],[104,48],[100,50],[95,50],[90,48],
    ]},
    // Australian Outback
    { type: 'desert', poly: [
      [122,-20],[126,-18],[130,-18],[134,-20],[138,-22],[140,-24],
      [142,-26],[140,-28],[138,-30],[136,-32],[134,-32],[130,-30],
      [126,-28],[124,-26],[122,-24],[122,-20],
    ]},
    // Sonoran / Chihuahuan (SW USA / Mexico)
    { type: 'desert', poly: [
      [-118,36],[-114,34],[-112,32],[-110,32],[-108,30],[-106,28],
      [-104,28],[-102,26],[-104,26],[-108,28],[-112,30],[-116,32],
      [-118,34],[-118,36],
    ]},
    // Karakum / Central Asian desert
    { type: 'desert', poly: [
      [54,40],[58,42],[62,42],[66,40],[68,38],[64,36],[60,36],[56,38],[54,40],
    ]},
    // Thar Desert (India/Pakistan)
    { type: 'desert', poly: [
      [66,28],[70,28],[72,26],[72,24],[70,22],[68,24],[66,26],[66,28],
    ]},
    // Patagonian steppe
    { type: 'desert', poly: [
      [-72,-40],[-70,-42],[-68,-46],[-66,-48],[-68,-50],[-70,-48],
      [-72,-46],[-74,-44],[-74,-42],[-72,-40],
    ]},
    // Kalahari
    { type: 'desert', poly: [
      [18,-20],[22,-20],[26,-22],[28,-26],[26,-28],[22,-28],
      [20,-26],[18,-24],[18,-20],
    ]},

    // ═══ FORESTS / TAIGA ═══

    // Canadian boreal forest
    { type: 'forest', poly: [
      [-135,58],[-125,55],[-115,54],[-105,54],[-95,52],[-85,50],
      [-80,48],[-75,48],[-70,48],[-65,50],[-60,52],[-58,54],
      [-60,56],[-65,58],[-70,60],[-80,62],[-90,64],[-100,66],
      [-110,66],[-120,64],[-130,62],[-135,60],[-135,58],
    ]},
    // Scandinavian / Russian taiga
    { type: 'forest', poly: [
      [10,62],[15,60],[20,58],[25,58],[30,58],[35,58],[40,58],
      [50,58],[60,58],[70,58],[80,58],[90,58],[100,58],[110,58],
      [120,58],[130,58],[140,58],[145,58],
      [145,62],[140,64],[130,64],[120,62],[110,62],[100,62],
      [90,62],[80,62],[70,62],[60,62],[50,62],[40,62],
      [30,62],[20,64],[15,64],[10,62],
    ]},
    // Eastern US / Appalachian forest
    { type: 'forest', poly: [
      [-85,46],[-82,44],[-80,40],[-78,38],[-76,36],[-78,34],
      [-80,34],[-82,36],[-84,38],[-86,40],[-88,44],[-85,46],
    ]},
    // European temperate forest
    { type: 'forest', poly: [
      [6,52],[10,52],[14,52],[18,52],[22,52],[24,50],[22,48],
      [18,48],[14,48],[10,50],[8,50],[6,52],
    ]},
    // Pacific Northwest
    { type: 'forest', poly: [
      [-126,50],[-124,48],[-122,46],[-122,44],[-124,42],
      [-126,44],[-128,48],[-126,50],
    ]},
    // Siberian taiga (east)
    { type: 'forest', poly: [
      [130,58],[135,56],[140,54],[145,52],[150,54],[155,56],
      [155,60],[150,62],[145,62],[140,60],[135,58],[130,58],
    ]},

    // ═══ JUNGLES / TROPICAL FOREST ═══

    // Amazon rainforest
    { type: 'jungle', poly: [
      [-76,-2],[-74,0],[-70,2],[-66,2],[-62,0],[-58,-2],[-54,-4],
      [-50,-4],[-48,-6],[-48,-10],[-50,-12],[-52,-14],[-56,-14],
      [-60,-12],[-64,-10],[-68,-8],[-72,-6],[-76,-4],[-76,-2],
    ]},
    // Congo rainforest
    { type: 'jungle', poly: [
      [10,4],[14,4],[18,4],[22,4],[26,2],[30,0],[30,-4],
      [28,-6],[24,-6],[20,-4],[16,-2],[12,0],[10,2],[10,4],
    ]},
    // SE Asian rainforest (mainland)
    { type: 'jungle', poly: [
      [96,18],[100,16],[104,14],[106,12],[108,10],[106,8],
      [104,6],[100,8],[98,12],[96,16],[96,18],
    ]},
    // Indonesian / Borneo jungle
    { type: 'jungle', poly: [
      [108,2],[112,4],[116,4],[118,4],[116,0],[112,-2],[108,0],[108,2],
    ]},
    // Central American jungle
    { type: 'jungle', poly: [
      [-92,18],[-90,16],[-88,14],[-86,12],[-84,10],[-82,10],
      [-84,12],[-86,14],[-88,16],[-90,18],[-92,18],
    ]},
    // West African forest
    { type: 'jungle', poly: [
      [-14,6],[-10,8],[-6,8],[-2,6],[2,5],[6,5],[10,5],
      [10,4],[6,3],[2,4],[-2,4],[-6,5],[-10,6],[-14,6],
    ]},

    // ═══ MOUNTAINS ═══

    // Rocky Mountains
    { type: 'mountain', poly: [
      [-118,50],[-116,48],[-114,46],[-112,44],[-110,42],[-108,40],
      [-106,38],[-106,36],[-108,36],[-110,38],[-112,40],[-114,42],
      [-116,44],[-118,46],[-120,48],[-118,50],
    ]},
    // Andes
    { type: 'mountain', poly: [
      [-78,-2],[-76,-6],[-74,-10],[-72,-14],[-70,-18],[-70,-22],
      [-70,-28],[-70,-34],[-72,-38],[-72,-42],[-74,-42],
      [-74,-38],[-72,-34],[-72,-28],[-72,-22],[-72,-18],
      [-74,-14],[-76,-10],[-78,-6],[-80,-2],[-78,-2],
    ]},
    // Alps
    { type: 'mountain', poly: [
      [6,46],[8,47],[10,47],[12,47],[14,47],[16,48],
      [16,46],[14,46],[12,45],[10,46],[8,46],[6,46],
    ]},
    // Himalayas
    { type: 'mountain', poly: [
      [72,36],[76,34],[80,32],[84,30],[88,28],[92,28],
      [96,28],[96,30],[92,30],[88,30],[84,32],[80,34],
      [76,36],[72,36],
    ]},
    // Ural Mountains
    { type: 'mountain', poly: [
      [58,52],[60,54],[60,58],[60,62],[60,66],[58,66],
      [58,62],[58,58],[58,54],[58,52],
    ]},
    // Atlas Mountains
    { type: 'mountain', poly: [
      [-6,34],[-4,34],[-2,34],[0,34],[2,34],[4,34],
      [4,32],[2,32],[0,32],[-2,34],[-4,34],[-6,34],
    ]},
    // Caucasus
    { type: 'mountain', poly: [
      [38,42],[40,42],[42,43],[44,42],[46,42],
      [46,40],[44,40],[42,41],[40,40],[38,42],
    ]},
    // Carpathians
    { type: 'mountain', poly: [
      [18,48],[20,49],[22,48],[24,48],[26,47],[26,46],
      [24,46],[22,46],[20,47],[18,48],
    ]},
    // Japanese Alps / spine
    { type: 'mountain', poly: [
      [136,34],[138,36],[140,38],[140,40],[138,40],
      [136,38],[134,36],[136,34],
    ]},
    // East African Rift / Ethiopian Highlands
    { type: 'mountain', poly: [
      [34,14],[36,12],[38,10],[40,8],[38,6],[36,4],
      [34,2],[32,4],[34,8],[34,12],[34,14],
    ]},
    // Appalachians
    { type: 'mountain', poly: [
      [-82,38],[-80,40],[-78,42],[-76,44],[-74,42],
      [-76,40],[-78,38],[-80,36],[-82,36],[-82,38],
    ]},
    // Scandinavian Mountains
    { type: 'mountain', poly: [
      [8,60],[10,62],[12,64],[14,66],[16,68],[14,68],
      [12,66],[10,64],[8,62],[6,60],[8,60],
    ]},
    // New Zealand Southern Alps
    { type: 'mountain', poly: [
      [168,-43],[170,-44],[172,-46],[172,-44],[170,-43],[168,-43],
    ]},

    // ═══ TUNDRA ═══

    // Canadian Arctic tundra
    { type: 'tundra', poly: [
      [-130,68],[-120,66],[-110,66],[-100,68],[-90,68],[-80,66],
      [-70,64],[-65,62],[-60,60],[-58,62],[-60,64],
      [-65,66],[-70,68],[-80,70],[-90,72],[-100,72],[-110,72],
      [-120,72],[-130,72],[-130,68],
    ]},
    // Siberian tundra
    { type: 'tundra', poly: [
      [60,66],[70,66],[80,68],[90,70],[100,72],[110,72],
      [120,72],[130,72],[140,68],[150,66],[160,64],
      [155,62],[145,62],[135,64],[125,64],[115,64],
      [105,64],[95,64],[85,64],[75,64],[65,64],[60,66],
    ]},
    // Greenland interior ice
    { type: 'tundra', poly: [
      [-50,64],[-45,62],[-40,64],[-35,68],[-30,72],[-25,76],
      [-28,80],[-35,82],[-42,80],[-48,76],[-52,72],[-54,68],[-50,64],
    ]},

    // ═══ SAVANNA ═══

    // African savanna (East/South)
    { type: 'savanna', poly: [
      [28,14],[32,10],[36,6],[38,2],[38,-4],[36,-8],
      [34,-12],[30,-14],[26,-14],[22,-10],[20,-6],
      [22,-2],[24,2],[26,6],[28,10],[28,14],
    ]},
    // Brazilian cerrado
    { type: 'savanna', poly: [
      [-48,-8],[-46,-10],[-44,-14],[-44,-18],[-46,-20],[-48,-20],
      [-50,-18],[-52,-16],[-52,-12],[-50,-10],[-48,-8],
    ]},
    // Indian Deccan savanna
    { type: 'savanna', poly: [
      [74,20],[78,18],[80,16],[80,12],[78,10],[76,12],
      [74,14],[72,18],[74,20],
    ]},
    // Australian savanna (north)
    { type: 'savanna', poly: [
      [126,-14],[130,-14],[134,-14],[138,-16],[140,-18],
      [138,-18],[134,-16],[130,-16],[126,-16],[126,-14],
    ]},
  ],

  // ─── ACHIEVEMENTS ───────────────────────────────────────
  // locked: true  → grayed out with 🔒 icon
  // locked: false → unlocked, shows the icon and date
  achievements: [
    // ── Unlocked ──────────────────────────────────────────
    { icon: '🌍', name: 'Globe Trotter',     description: 'Visit 3+ continents',                            locked: false, date: 'Unlocked Summer 2025' },
    { icon: '📸', name: 'Shutterbug',        description: 'Take 3000+ travel photos',                       locked: false, date: 'Unlocked Summer 2025' },
    { icon: '✈️', name: 'Sky Rider',         description: 'Take 10+ flights',                               locked: false, date: 'Unlocked Summer 2025' },
    { icon: '🌊', name: 'Coastal Wanderer',  description: 'Visit 4+ coastal cities in one trip',             locked: false, date: 'Unlocked Summer 2025' },
    { icon: '🏔️', name: 'Cliffhanger',      description: 'Survive the Caminito del Rey gorge walk',         locked: false, date: 'Unlocked Summer 2025' },
    { icon: '🗺️', name: 'Cartographer',     description: 'Visit 10+ cities around the world',              locked: false, date: 'Unlocked Summer 2025' },
    { icon: '🤝', name: 'Social Butterfly',  description: 'Make 40+ friends while traveling',               locked: false, date: 'Unlocked Summer 2025' },
    { icon: '🥘', name: 'Gastronaut',        description: 'Eat 200+ meals across different countries',      locked: false, date: 'Unlocked Summer 2025' },
    { icon: '🏄', name: 'Wave Rider',        description: 'Catch your first wave',                          locked: false, date: 'Unlocked Summer 2024' },
    { icon: '🥶', name: 'Polar Plunger',     description: 'Swim in a freezing Pacific beach and survive',   locked: false, date: 'Unlocked Summer 2024' },
    { icon: '🚗', name: 'Road Warrior',      description: 'Complete a 1000+ km road trip',                  locked: false, date: 'Unlocked Summer 2024' },
    { icon: '🐋', name: 'Leviathan Spotter', description: 'Go whale watching in the wild',                  locked: false, date: 'Unlocked Summer 2024' },
    { icon: '🌅', name: 'Atlantic Dreamer',  description: 'Watch a sunset over the Atlantic Ocean',         locked: false, date: 'Unlocked Winter 2024' },
    { icon: '🕳️', name: 'Myth Explorer',    description: 'Discover the Caves of Hercules in Tangier',      locked: false, date: 'Unlocked Winter 2024' },
    { icon: '🥾', name: 'Trail Blazer',      description: 'Walk 500+ km on foot across all trips',          locked: false, date: 'Unlocked Summer 2025' },
    { icon: '🛶', name: 'Waterfall Chaser',  description: 'Kayak to a hidden waterfall',                    locked: false, date: 'Unlocked Summer 2025' },
    // ── Locked ────────────────────────────────────────────
    { icon: '🔒', name: 'Summit Seeker',     description: 'Reach Jungfraujoch, Top of Europe',              locked: true },
    { icon: '🔒', name: 'Aurora Hunter',     description: 'Witness the Northern Lights',                    locked: true },
    { icon: '🔒', name: 'Seven Seas',        description: 'Visit all 7 continents',                         locked: true },
    { icon: '🔒', name: 'La Dolce Vita',     description: 'Complete a road trip through Italy',              locked: true },
    { icon: '🔒', name: 'Cinque Terre',      description: 'Hike the full Italian coastal trail',             locked: true },
    { icon: '🔒', name: 'Sahara Nightwalker',description: 'Camp under the stars in the Sahara desert',      locked: true },
    { icon: '🔒', name: 'Polyglot',          description: 'Speak 5+ languages at conversational level',     locked: true },
    { icon: '🔒', name: 'Century Club',      description: 'Visit 100 cities across the world',              locked: true },
    { icon: '🔒', name: 'Silk Road',         description: 'Travel overland across 3+ countries in one trip',locked: true },
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

  // ─── MAGNET COLLECTION ──────────────────────────────────
  // Pixel-art fridge magnets from every city.
  // collected: true = visited, false = planned (locked on the board)
  magnets: [
    // Canada
    { city: 'Montreal',    country: 'Canada',      image: 'montreal.png',    collected: true,  region: 'CANADA' },
    { city: 'Quebec City', country: 'Canada',      image: 'quebec_city.png', collected: true,  region: 'CANADA' },
    { city: 'Moncton',    country: 'Canada',       image: 'moncton.png',     collected: true,  region: 'CANADA' },
    { city: 'Halifax',    country: 'Canada',        image: 'halifax.png',     collected: true,  region: 'CANADA' },
    { city: 'Vancouver',  country: 'Canada',        image: 'vancouver.png',   collected: true,  region: 'CANADA' },
    { city: 'Tofino',     country: 'Canada',        image: 'tofino.png',      collected: true,  region: 'CANADA' },
    { city: 'Nanaimo',    country: 'Canada',        image: 'nanaimo.png',     collected: true,  region: 'CANADA' },
    // Europe — visited
    { city: 'Amsterdam',  country: 'Netherlands',   image: 'amsterdam.png',   collected: true,  region: 'EUROPE' },
    { city: 'Nice',       country: 'France',        image: 'nice.png',        collected: true,  region: 'EUROPE' },
    { city: 'Cannes',     country: 'France',        image: 'cannes.png',      collected: true,  region: 'EUROPE' },
    { city: 'Monaco',     country: 'Monaco',        image: 'monaco.png',      collected: true,  region: 'EUROPE' },
    { city: 'Barcelona',  country: 'Spain',         image: 'barcelona.png',   collected: true,  region: 'EUROPE' },
    { city: 'Málaga',     country: 'Spain',         image: 'malaga.png',      collected: true,  region: 'EUROPE' },
    { city: 'Nerja',      country: 'Spain',         image: 'nerja.png',       collected: true,  region: 'EUROPE' },
    // Africa — visited
    { city: 'Larache',    country: 'Morocco',       image: 'larache.png',     collected: true,  region: 'AFRICA' },
    // Europe — planned (Grand Continental 2026)
    { city: 'Paris',      country: 'France',        image: 'paris.png',       collected: false, region: 'EUROPE' },
    { city: 'Milan',      country: 'Italy',         image: 'milan.png',       collected: false, region: 'EUROPE' },
    { city: 'Lake Como',  country: 'Italy',         image: 'lake_como.png',   collected: false, region: 'EUROPE' },
    { city: 'La Spezia',  country: 'Italy',         image: 'la_spezia.png',   collected: false, region: 'EUROPE' },
    { city: 'Interlaken', country: 'Switzerland',   image: 'interlaken.png',  collected: false, region: 'EUROPE' },
    { city: 'Lucerne',    country: 'Switzerland',   image: 'lucerne.png',     collected: false, region: 'EUROPE' },
    // Africa — planned
    { city: 'Rabat',      country: 'Morocco',       image: 'rabat.png',       collected: false, region: 'AFRICA' },
  ],

  // ─── WEATHER (fallback — overridden by live fetch) ─────
  weather: {
    icon: '🌤️',
    temp: '--°C',
    description: 'Loading...',
    location: 'DETECTING...',
  },
};
