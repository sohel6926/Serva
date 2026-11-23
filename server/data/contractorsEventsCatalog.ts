export interface ContractorWorkerTrade {
  id: string;
  name: string;
  dailyRatePaise: number;
  specialty: string;
}

export const CONTRACTOR_WORKER_TRADES: ContractorWorkerTrade[] = [
  {
    id: 'cw-mason',
    name: 'Master Mason (Brick & Plaster)',
    dailyRatePaise: 110000, // ₹1,100/day
    specialty: 'Bricklaying, stone cladding, tile installation & fine plastering',
  },
  {
    id: 'cw-helper',
    name: 'Site Labour / Construction Helper',
    dailyRatePaise: 65000, // ₹650/day
    specialty: 'Mortar mixing, bricks & sand carrying, site clearance & cleanup',
  },
  {
    id: 'cw-barbender',
    name: 'Steel Bender & Centering Specialist',
    dailyRatePaise: 115000, // ₹1,150/day
    specialty: 'Slab reinforcement, column tying, rebar fabrication & formwork',
  },
  {
    id: 'cw-carpenter',
    name: 'Civil & Shuttering Carpenter',
    dailyRatePaise: 120000, // ₹1,200/day
    specialty: 'Centering, plywood shuttering, beam framing & safety scaffolding',
  },
  {
    id: 'cw-painter',
    name: 'Commercial Site Painter',
    dailyRatePaise: 95000, // ₹950/day
    specialty: 'Exterior weatherproof coating, primer & spray painting',
  },
  {
    id: 'cw-plumber',
    name: 'Sanitary & Concealed Pipe Plumber',
    dailyRatePaise: 105000, // ₹1,050/day
    specialty: 'Underground drainage, CPVC conduit lines & overhead tank plumbing',
  },
];

export interface ContractorMachineryItem {
  id: string;
  group: 'Earth-moving' | 'Material transport' | 'Concrete' | 'Road construction';
  name: string;
  ratePaise: number;
  unitLabel: string;
  operatorDefault: boolean;
}

export const CONTRACTOR_MACHINERY: ContractorMachineryItem[] = [
  {
    id: 'cm-jcb',
    group: 'Earth-moving',
    name: 'JCB 3DX EcoXcellence Backhoe Excavator',
    ratePaise: 140000, // ₹1,400/hour
    unitLabel: 'per hour',
    operatorDefault: true,
  },
  {
    id: 'cm-tipper',
    group: 'Material transport',
    name: '10-Tyre Heavy Tipper / Dumper (16 Ton)',
    ratePaise: 180000, // ₹1,800/trip
    unitLabel: 'per trip',
    operatorDefault: true,
  },
  {
    id: 'cm-mixer',
    group: 'Concrete',
    name: 'Transit Concrete Mixer & Hopper Unit',
    ratePaise: 250000, // ₹2,500/day
    unitLabel: 'per day',
    operatorDefault: true,
  },
  {
    id: 'cm-roller',
    group: 'Road construction',
    name: 'Vibratory Soil & Asphalt Road Roller',
    ratePaise: 160000, // ₹1,600/hour
    unitLabel: 'per hour',
    operatorDefault: true,
  },
  {
    id: 'cm-crane',
    group: 'Earth-moving',
    name: 'Hydra 14T Mobile Pick & Carry Crane',
    ratePaise: 220000, // ₹2,200/hour
    unitLabel: 'per hour',
    operatorDefault: true,
  },
];

export const EVENT_TYPES: string[] = [
  'Marriage / Wedding',
  'Birthday Parties',
  'Corporate Events',
  'Engagement Ceremony',
  'Reception',
  'Sangeet / Mehendi',
  'Anniversary Celebration',
  'House Warming (Griha Pravesh)',
  'Baby Shower / Cradle Ceremony',
  'Naming Ceremony',
  'School / College Gathering',
  'Product Launch',
  'Religious / Festival Pooja',
  'Musical Concert',
  'Fashion Show',
  'Community Gathering',
];

export interface EventLaunchService {
  slug: 'decoration' | 'catering' | 'dance' | 'singing' | 'photography' | 'dj';
  name: string;
  basePaise: number;
  samplePackagePaise: number;
  unitLabel: string;
  description: string;
}

export const EVENT_LAUNCH_SERVICES: EventLaunchService[] = [
  {
    slug: 'decoration',
    name: 'Theme & Stage Floral Decoration',
    basePaise: 8000000,
    samplePackagePaise: 8000000, // ₹80,000
    unitLabel: 'package',
    description: 'Mandap, entrance arch, stage backdrop, LED spotlights & thematic florals.',
  },
  {
    slug: 'catering',
    name: 'Gourmet Buffet Catering (Live Counters)',
    basePaise: 25000, // ₹250/plate
    samplePackagePaise: 12500000, // ₹1,25,000 (500 guests * ₹250)
    unitLabel: 'per plate',
    description: 'Multi-course regional & continental feast with live counters and trained servers.',
  },
  {
    slug: 'photography',
    name: 'Candid Photography & Cinematic Film',
    basePaise: 4000000,
    samplePackagePaise: 4000000, // ₹40,000
    unitLabel: 'package',
    description: '2 candid photographers, 1 drone operator, traditional video & edited highlight reel.',
  },
  {
    slug: 'dance',
    name: 'Choreographed Dance Troupe',
    basePaise: 1500000,
    samplePackagePaise: 1500000, // ₹15,000
    unitLabel: 'performance',
    description: '6-member professional dance troupe with custom intro and Bollywood/Tollywood medleys.',
  },
  {
    slug: 'singing',
    name: 'Live Melodies & Ghazal Band',
    basePaise: 1000000,
    samplePackagePaise: 1000000, // ₹10,000
    unitLabel: 'session',
    description: 'Live acoustic vocals, keyboard, tabla & rhythm accompaniment for guest engagement.',
  },
  {
    slug: 'dj',
    name: 'High-Energy DJ & Concert Sound',
    basePaise: 1200000,
    samplePackagePaise: 1200000, // ₹12,000
    unitLabel: 'night',
    description: 'Club-grade line array sound, moving beams, fog blast and curated setlists.',
  },
];

export interface EventAddonItem {
  id: string;
  name: string;
  pricePaise: number;
}

export const EVENT_OTHER_ADDONS: EventAddonItem[] = [
  {
    id: 'ev-other-bundle',
    name: 'Entry Pyro & Cold Sparklers Bundle',
    pricePaise: 800000, // ₹8,000
  },
  {
    id: 'ev-dry-ice',
    name: 'Low-Lying Heavy Dry Ice Cloud Effect',
    pricePaise: 500000, // ₹5,000
  },
  {
    id: 'ev-welcome-hostess',
    name: 'Traditional Welcome Hostesses & Tilak Setup',
    pricePaise: 600000, // ₹6,000
  },
];

export interface DjProfileCatalogItem {
  id: string;
  partnerId: string;
  name: string;
  experienceYears: number;
  languages: string[];
  genres: string[];
  equipmentSummary: string;
  quotedPricePaise: number;
  availabilityDates: string[];
  videoUrl: string;
  rating: number;
}

export const DJ_PROFILES: DjProfileCatalogItem[] = [
  {
    id: 'dj-vikram',
    partnerId: 'partner-dj-1',
    name: 'DJ Vikram (Sound & Bass)',
    experienceYears: 7,
    languages: ['Telugu', 'Hindi', 'English'],
    genres: ['EDM', 'Bollywood', 'Tollywood', 'Punjabi'],
    equipmentSummary: 'JBL VRX Line Array + Pioneer CDJ 3000 + Moving Head Beams + Fog Machine',
    quotedPricePaise: 1200000, // ₹12,000
    availabilityDates: ['2026-11-28', '2026-12-12', '2026-12-25'],
    videoUrl: '/media/dj_live_showcase.mp4',
    rating: 4.9,
  },
  {
    id: 'dj-arjun',
    partnerId: 'partner-dj-2',
    name: 'DJ Arjun Live',
    experienceYears: 5,
    languages: ['Telugu', 'Hindi'],
    genres: ['Tollywood', 'Bollywood Mashups', 'House'],
    equipmentSummary: 'RCF Active Speakers + Pioneer DDJ 1000 + Laser Lights',
    quotedPricePaise: 1000000, // ₹10,000
    availabilityDates: ['2026-11-28', '2026-12-05', '2026-12-12'],
    videoUrl: '/media/dj_live_showcase.mp4',
    rating: 4.8,
  },
];
