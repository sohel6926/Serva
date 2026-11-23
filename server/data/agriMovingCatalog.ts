export interface FarmAreaConversion {
  acres: number;
  guntas: number;
  hectares: number;
}

export function convertFarmArea(
  value: number,
  unit: 'ACRES' | 'GUNTAS' | 'HECTARES'
): FarmAreaConversion {
  let acres = 0;
  if (unit === 'ACRES') {
    acres = value;
  } else if (unit === 'GUNTAS') {
    acres = value / 40.0;
  } else if (unit === 'HECTARES') {
    acres = value * 2.47105;
  }
  const guntas = Math.round(acres * 40 * 1000) / 1000;
  const hectares = Math.round((acres / 2.47105) * 1000) / 1000;
  return {
    acres: Math.round(acres * 1000) / 1000,
    guntas,
    hectares,
  };
}

export interface MovingMainService {
  slug: string;
  name: string;
  description: string;
  basePaise: number;
}

export const MOVING_MAIN_SERVICES: MovingMainService[] = [
  {
    slug: 'home-shifting',
    name: 'Home Shifting',
    description: 'Complete household packing, loading, unloading, and unpacking assistance.',
    basePaise: 90000,
  },
  {
    slug: 'office-shifting',
    name: 'Office Shifting',
    description: 'Commercial relocation, desk, server, and workspace setup.',
    basePaise: 120000,
  },
  {
    slug: 'packing',
    name: 'Packing',
    description: 'Professional packing with multi-layered protective materials.',
    basePaise: 60000,
  },
  {
    slug: 'loading-unloading',
    name: 'Loading & Unloading (Combined)',
    description: 'Skilled labour crew for safe loading into and unloading from your vehicle.',
    basePaise: 50000,
  },
  {
    slug: 'transport',
    name: 'Transport (Customer-Arranged)',
    description: 'Coordination for loading and transit with your arranged transport.',
    basePaise: 40000,
  },
  {
    slug: 'labour-only',
    name: 'Labour Only',
    description: 'Hourly or daily trained movers for heavy lifting, rearranging, or site work.',
    basePaise: 45000,
  },
  {
    slug: 'heavy-item-moving',
    name: 'Heavy Item Moving',
    description: 'Specialised moving for pianos, safes, gym equipment, and fragile marble.',
    basePaise: 80000,
  },
];

export interface PackingBoxSpec {
  id: 'small' | 'medium' | 'large' | 'xl' | 'custom';
  label: string;
  dimensionsIn: string;
  dimensionsCm: string;
  unitPricePaise: number;
  warning?: string;
}

export const PACKING_BOX_SPECS: PackingBoxSpec[] = [
  {
    id: 'small',
    label: 'Small Box (Books & Fragile)',
    dimensionsIn: '16 x 12 x 12 in',
    dimensionsCm: '40 x 30 x 30 cm',
    unitPricePaise: 6000,
  },
  {
    id: 'medium',
    label: 'Medium Box (Kitchen & Pantry)',
    dimensionsIn: '18 x 18 x 16 in',
    dimensionsCm: '45 x 45 x 40 cm',
    unitPricePaise: 9000,
  },
  {
    id: 'large',
    label: 'Large Box (Clothes & Linens)',
    dimensionsIn: '24 x 18 x 18 in',
    dimensionsCm: '60 x 45 x 45 cm',
    unitPricePaise: 12000,
  },
  {
    id: 'xl',
    label: 'Extra Large (XL) Box (Blankets & Pillows)',
    dimensionsIn: '24 x 24 x 20 in',
    dimensionsCm: '60 x 60 x 50 cm',
    unitPricePaise: 16000,
    warning: 'Do not pack heavy items; ideal for blankets, cushions, and light linens.',
  },
  {
    id: 'custom',
    label: 'Custom / Wardrobe Box',
    dimensionsIn: '24 x 24 x 40 in',
    dimensionsCm: '60 x 60 x 100 cm',
    unitPricePaise: 25000,
  },
];

export const MOVING_INVENTORY_CATEGORIES: string[] = [
  'Living Room',
  'Bedroom',
  'Kitchen & Dining',
  'Appliances',
  'Boxes & Storage',
  'Fragile & Miscellaneous',
];

export interface AgriServiceCatalogItem {
  id: string;
  slug: string;
  name: string;
  category: string;
  ratePaise: number;
  unitLabel: string;
  requiresPesticideNotice?: boolean;
}

export const AGRI_SERVICES: AgriServiceCatalogItem[] = [
  {
    id: 'ag-drone',
    slug: 'drone-spraying',
    name: 'Agriculture Drone Spraying',
    category: 'Crop Protection',
    ratePaise: 65000,
    unitLabel: 'per acre',
    requiresPesticideNotice: true,
  },
  {
    id: 'ag-harvest',
    slug: 'paddy-harvesting',
    name: 'Paddy Harvesting & Threshing',
    category: 'Harvesting',
    ratePaise: 120000,
    unitLabel: 'per acre',
  },
  {
    id: 'ag-tilling',
    slug: 'land-tilling',
    name: 'Deep Ploughing & Land Tilling',
    category: 'Land Preparation',
    ratePaise: 80000,
    unitLabel: 'per acre',
  },
  {
    id: 'ag-sowing',
    slug: 'seed-sowing',
    name: 'Precision Seed Sowing',
    category: 'Planting',
    ratePaise: 70000,
    unitLabel: 'per acre',
  },
  {
    id: 'ag-irrigation',
    slug: 'drip-irrigation',
    name: 'Drip Irrigation Installation',
    category: 'Water Management',
    ratePaise: 95000,
    unitLabel: 'per acre',
  },
  {
    id: 'ag-soil',
    slug: 'soil-testing',
    name: 'Soil Health Card & Testing',
    category: 'Testing',
    ratePaise: 45000,
    unitLabel: 'per test',
  },
];

export interface AgriMachineCatalogItem {
  id: string;
  name: string;
  hourlyRatePaise: number;
  dailyRatePaise: number;
  perAcreRatePaise: number;
  operatorFeePaise: number;
}

export const AGRI_MACHINERY: AgriMachineCatalogItem[] = [
  {
    id: 'm-drone',
    name: 'Agriculture Spraying Drone',
    hourlyRatePaise: 80000,
    dailyRatePaise: 500000,
    perAcreRatePaise: 65000,
    operatorFeePaise: 25000,
  },
  {
    id: 'm-tractor',
    name: '45-55 HP 4WD Tractor',
    hourlyRatePaise: 90000,
    dailyRatePaise: 600000,
    perAcreRatePaise: 85000,
    operatorFeePaise: 30000,
  },
  {
    id: 'm-harvester',
    name: 'Multi-Crop Combine Harvester',
    hourlyRatePaise: 180000,
    dailyRatePaise: 1200000,
    perAcreRatePaise: 140000,
    operatorFeePaise: 40000,
  },
  {
    id: 'm-rotavator',
    name: 'Heavy Duty Rotavator Attachment',
    hourlyRatePaise: 50000,
    dailyRatePaise: 350000,
    perAcreRatePaise: 45000,
    operatorFeePaise: 20000,
  },
  {
    id: 'm-tiller',
    name: 'Power Tiller (12-15 HP)',
    hourlyRatePaise: 45000,
    dailyRatePaise: 300000,
    perAcreRatePaise: 40000,
    operatorFeePaise: 20000,
  },
  {
    id: 'm-pump',
    name: 'High-Discharge Diesel Water Pump',
    hourlyRatePaise: 35000,
    dailyRatePaise: 220000,
    perAcreRatePaise: 30000,
    operatorFeePaise: 15000,
  },
];
