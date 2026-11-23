export const COOK_SERVICE_WORKER_BASE_PAISE = 37400; // ₹374 base for cook

export interface RepairOptionCatalogItem {
  id: string;
  domain: 'Kitchen' | 'Bathroom' | 'Electrical' | 'Vehicle';
  name: string;
  subLabel: string;
  workerPricePaise: number;
}

export const REPAIR_OPTIONS: RepairOptionCatalogItem[] = [
  {
    id: 'rep-e-bulb',
    domain: 'Electrical',
    name: 'Light Bulb / Tube Light Replacement',
    subLabel: 'Switchboard, bulb fixture, wiring check',
    workerPricePaise: 10000, // ₹100
  },
  {
    id: 'rep-e-fan',
    domain: 'Electrical',
    name: 'Ceiling Fan Installation & Repair',
    subLabel: 'Capacitor replacement, blade balancing, regulator',
    workerPricePaise: 25000, // ₹250
  },
  {
    id: 'rep-e-wiring',
    domain: 'Electrical',
    name: 'Short Circuit & MCB Tripping Fix',
    subLabel: 'Trace concealed electrical fault & reset circuit',
    workerPricePaise: 40000, // ₹400
  },
  {
    id: 'rep-p-tap',
    domain: 'Bathroom',
    name: 'Tap / Mixer Repair & Replacement',
    subLabel: 'Leakage fix, valve replacement, spindle washers',
    workerPricePaise: 15000, // ₹150
  },
  {
    id: 'rep-p-leak',
    domain: 'Bathroom',
    name: 'Drainage Pipe Blockage Removal',
    subLabel: 'Bathroom sink, wash basin, gully trap cleaning',
    workerPricePaise: 30000, // ₹300
  },
  {
    id: 'rep-k-sink',
    domain: 'Kitchen',
    name: 'Kitchen Sink Waste Pipe & Sealant Fix',
    subLabel: 'Clog clearing, flexi-pipe change, silicone sealing',
    workerPricePaise: 20000, // ₹200
  },
  {
    id: 'rep-k-ro',
    domain: 'Kitchen',
    name: 'Water Purifier / RO Filter Service',
    subLabel: 'Sediment, carbon & membrane replacement',
    workerPricePaise: 35000, // ₹350
  },
  {
    id: 'rep-v-bike',
    domain: 'Vehicle',
    name: 'Two-Wheeler Basic Doorstep Service',
    subLabel: 'Engine oil top-up, spark plug, brake shoe adjust',
    workerPricePaise: 35000, // ₹350
  },
  {
    id: 'rep-v-car',
    domain: 'Vehicle',
    name: 'Car Jumpstart & Battery Diagnostics',
    subLabel: 'Booster cable jumpstart, terminal cleanup, voltage check',
    workerPricePaise: 30000, // ₹300
  },
];

export interface CleaningOptionCatalogItem {
  id: string;
  tab: 'Home Cleaning' | 'Vehicle Cleaning' | 'Washing';
  name: string;
  unitLabel: string;
  hasWorkerStepper: boolean;
  workerPricePerUnitPaise: number;
}

export const CLEANING_OPTIONS: CleaningOptionCatalogItem[] = [
  {
    id: 'clean-deep-home',
    tab: 'Home Cleaning',
    name: 'Full Home Deep Cleaning',
    unitLabel: 'per BHK',
    hasWorkerStepper: true,
    workerPricePerUnitPaise: 80000, // ₹800/BHK
  },
  {
    id: 'clean-bathroom',
    tab: 'Home Cleaning',
    name: 'Intense Bathroom Descaling & Tile Scrub',
    unitLabel: 'per Bathroom',
    hasWorkerStepper: false,
    workerPricePerUnitPaise: 35000, // ₹350
  },
  {
    id: 'clean-kitchen',
    tab: 'Home Cleaning',
    name: 'Kitchen Chimney & Degreasing Cleaning',
    unitLabel: 'per Kitchen',
    hasWorkerStepper: false,
    workerPricePerUnitPaise: 45000, // ₹450
  },
  {
    id: 'clean-sofa',
    tab: 'Home Cleaning',
    name: 'Fabric & Leather Sofa Shampooing',
    unitLabel: 'per Seat',
    hasWorkerStepper: false,
    workerPricePerUnitPaise: 15000, // ₹150/seat
  },
  {
    id: 'clean-car-exterior',
    tab: 'Vehicle Cleaning',
    name: 'Car Foam Wash & Wax Polish',
    unitLabel: 'per Car',
    hasWorkerStepper: false,
    workerPricePerUnitPaise: 35000, // ₹350
  },
  {
    id: 'clean-bike-wash',
    tab: 'Vehicle Cleaning',
    name: 'Two-Wheeler High-Pressure Water Wash',
    unitLabel: 'per Bike',
    hasWorkerStepper: false,
    workerPricePerUnitPaise: 15000, // ₹150
  },
  {
    id: 'wash-clothes-press',
    tab: 'Washing',
    name: 'Laundry Washing, Drying & Steam Ironing',
    unitLabel: 'per Load (5kg)',
    hasWorkerStepper: false,
    workerPricePerUnitPaise: 25000, // ₹250
  },
];

export interface RequiredCleaningItem {
  id: string;
  name: string;
  hint: string;
}

export const REQUIRED_CLEANING_ITEMS: RequiredCleaningItem[] = [
  {
    id: 'item-water-elec',
    name: 'Running Water & Power Supply',
    hint: 'Required for pressure washers, vacuums, and steam irons',
  },
  {
    id: 'item-bucket-stool',
    name: 'Ladder / Stool & Bucket Access',
    hint: 'For ceiling fan, high wall tile, and chandelier reaches',
  },
  {
    id: 'item-safe-storage',
    name: 'Secure Delicate Items Prior to Arrival',
    hint: 'Keep jewelry, cash, and high-value documents safely stored',
  },
];

export interface CookingDishCatalogItem {
  id: string;
  name: string;
  diet: 'VEG' | 'NON_VEG';
  category: string;
  perPlatePaise: number;
  imageUrl: string;
  ingredients: string[];
  tools: string[];
}

export const COOKING_DISHES: CookingDishCatalogItem[] = [
  {
    id: 'dish-biryani',
    name: 'Hyderabadi Dum Biryani (Chicken/Mutton)',
    diet: 'NON_VEG',
    category: 'Main Course / Biryani',
    perPlatePaise: 12000, // ₹120
    imageUrl: '/src/assets/images/svc_cooking_1794825494618.jpg',
    ingredients: ['Basmati Rice', 'Chicken / Mutton', 'Yogurt', 'Saffron & Spices', 'Fried Onions'],
    tools: ['Heavy Bottom Handi', 'Dum Sealing Cloth / Dough', 'Large Serving Spoon'],
  },
  {
    id: 'dish-dosa',
    name: 'South Indian Dosa, Idli & Chutneys',
    diet: 'VEG',
    category: 'Breakfast / Tiffin',
    perPlatePaise: 4000, // ₹40 (Test 5 expects 4000 paise per plate)
    imageUrl: '/src/assets/images/svc_cooking_1794825494618.jpg',
    ingredients: ['Fermented Batter', 'Potatoes & Onions', 'Coconut', 'Mustard Seeds', 'Lentils'],
    tools: ['Cast Iron Dosa Tawa', 'Ladle', 'Blender / Mixer'],
  },
  {
    id: 'dish-thali',
    name: 'Traditional North/South Indian Full Meals Thali',
    diet: 'VEG',
    category: 'Full Meals',
    perPlatePaise: 8000, // ₹80
    imageUrl: '/src/assets/images/svc_cooking_1794825494618.jpg',
    ingredients: ['Rice & Roti', 'Dal Tadka', 'Paneer Curry', 'Raita', 'Papad & Pickle'],
    tools: ['Pressure Cooker', 'Kadhai', 'Rolling Pin & Board'],
  },
  {
    id: 'dish-chinese',
    name: 'Indo-Chinese Fried Rice & Chilli Paneer/Chicken',
    diet: 'NON_VEG',
    category: 'Snacks & Starters',
    perPlatePaise: 7000, // ₹70
    imageUrl: '/src/assets/images/svc_cooking_1794825494618.jpg',
    ingredients: ['Steamed Rice', 'Spring Onions', 'Capsicum', 'Soy & Chilli Sauces', 'Chicken/Paneer'],
    tools: ['Carbon Steel Wok', 'High-Flame Burner', 'Wok Spatula'],
  },
];
