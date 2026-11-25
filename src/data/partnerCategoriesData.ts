export type PartnerTypeCategory = 'INDIVIDUAL' | 'SHOP_BUSINESS';

export interface PartnerCategoryConfig {
  id: string;
  name: string;
  icon: string;
  subCategories: {
    INDIVIDUAL: string[];
    SHOP_BUSINESS: string[];
  };
}

export const PARTNER_CATEGORIES: PartnerCategoryConfig[] = [
  {
    id: 'home-services',
    name: 'Home Services',
    icon: '🏠',
    subCategories: {
      INDIVIDUAL: [
        'Electrician & Wiring',
        'Plumber & Pipe Fitting',
        'AC Repair, Servicing & Gas Refilling',
        'Washing Machine & Refrigerator Repair',
        'Television & Home Appliance Specialist',
        'House Painter & Wall Touch-up',
        'Carpenter & Furniture Assembly',
        'RO Water Purifier Technician',
        'Kitchen Chimney & Hob Repair',
        'Home Cook / Private Event Chef',
        'Bathroom & Deep Cleaning Specialist',
        'Pest Control Operator',
      ],
      SHOP_BUSINESS: [
        'Multi-Brand Appliance Service & Repair Center',
        'Complete Home Deep Cleaning & Sanitization Agency',
        'Turnkey Painting & Wall Texture Contracting Firm',
        'Commercial Pest Control & Fumigation Company',
        'Facility Management & Housekeeping Agency',
        'Custom Carpentry & Modular Kitchen Studio',
        'Solar Rooftop Panel Installation & Maintenance Firm',
        'CCTV, Security & Smart Home Automation Agency',
        'Waterproofing & Structural Leakage Treatment Agency',
      ],
    },
  },
  {
    id: 'contractors',
    name: 'Contractors & Construction',
    icon: '🏗️',
    subCategories: {
      INDIVIDUAL: [
        'Civil Mason (Brickwork & Plastering)',
        'Tile, Granite & Marble Layer',
        'False Ceiling, Gypsum & POP Craftsman',
        'Welder & Iron Gate / Grill Fabricator',
        'Waterproofing & Chemical Coating Specialist',
        'Borewell Drilling & Submersible Pump Electrician',
        'Building Estimator & 3D Plan Drafter',
        'Wood Flooring & Decking Carpenter',
      ],
      SHOP_BUSINESS: [
        'Turnkey Civil Construction & Contracting Firm',
        'Luxury Interior Design & Fitout Studio',
        'Architectural Design & Structural Engineering Consultancy',
        'Heavy Earthmover, JCB & Crane Rental Fleet',
        'Ready Mix Concrete (RMC) & Construction Material Supplier',
        'Commercial Glass, UPVC & Aluminum Glazing Contractor',
        'Demolition, Excavation & Site Clearing Contractor',
        'Road Paving & Industrial Flooring Agency',
      ],
    },
  },
  {
    id: 'agriculture',
    name: 'Agriculture Services',
    icon: '🌾',
    subCategories: {
      INDIVIDUAL: [
        'Agricultural Field Worker & Harvest Laborer',
        'Tractor Driver & Rotary Tiller Operator',
        'Certified Agri Drone Spraying Pilot',
        'Borewell & Drip Irrigation Handyman',
        'Dairy Cattle & Livestock Care Specialist',
        'Coconut Tree Climber & Orchard Pruner',
        'Soil Testing & Crop Health Scout',
        'Nursery Plantation & Grafting Specialist',
      ],
      SHOP_BUSINESS: [
        'Heavy Agricultural Machinery & Harvester Rental Fleet',
        'Commercial Agri Drone Spraying & Crop Mapping Agency',
        'Fertilizer, Certified Seeds & Bio-Pesticide Wholesaler',
        'Commercial Polyhouse, Greenhouse & Micro-Irrigation Contractor',
        'Agro Cold Storage & Grain Warehousing Hub',
        'Bulk Cattle Feed & Poultry Supply Distributorship',
        'Solar Irrigation Pump & Solar Fencing Firm',
      ],
    },
  },
  {
    id: 'events',
    name: 'Event Services',
    icon: '🎉',
    subCategories: {
      INDIVIDUAL: [
        'Wedding & Event Cinematographer / Photographer',
        'Professional DJ & Audio Console Operator',
        'Traditional Wedding Purohit / Pandit / Priest',
        'Bridal Makeup, Hair & Mehndi / Henna Artist',
        'Live Singer / Instrumental Musician / Band Performer',
        'Event Anchor, Emcee & Stage Host',
        'Event Lighting & Spotlights Operator',
        'Custom Cake & Specialty Dessert Baker',
      ],
      SHOP_BUSINESS: [
        'Turnkey Event Management & Production Agency',
        'Grand Stage Mandap & Theme Floral Decor Studio',
        'Premium Banquet Catering & Live Food Counter Services',
        'Concert Sound System, LED Video Wall & Truss Rental Agency',
        'Luxury Tent House, German Hangar & Seating Furniture Rental',
        'Industrial Silent Generator & Event Power Backup Fleet',
        'Drone Videography & Multi-Cam Broadcast Agency',
      ],
    },
  },
  {
    id: 'moving',
    name: 'Moving & Shifting',
    icon: '🚚',
    subCategories: {
      INDIVIDUAL: [
        'Mini-Truck Driver Partner (Tata Ace / Pickup 8ft)',
        'Professional Loading & Unloading Laborer / Porter',
        'Furniture Dismantling & Assembly Handyman',
        'Heavy Appliance (Fridge, Washing Machine) Lifting Porter',
        'Express 2-Wheeler Courier & Parcel Delivery Partner',
        'Vehicle Driver for Relocation Shifting',
      ],
      SHOP_BUSINESS: [
        'Full-Service Packers & Movers Company (Local & Intercity)',
        'Commercial Mini-Truck & Container Logistics Fleet',
        'Household Goods Secure Warehousing & Long-Term Storage',
        'Corporate Office Relocation & IT Server Moving Specialist',
        'Industrial Machinery & Heavy Crane Transport Logistics',
        'Vehicle Transportation & Car Carrier Service Agency',
      ],
    },
  },
];

export function getSubCategories(categoryName: string, partnerType: 'INDIVIDUAL' | 'SHOP_BUSINESS'): string[] {
  const normalized = categoryName.toLowerCase().replace('&', 'and');
  const found =
    PARTNER_CATEGORIES.find((c) => {
      const cNorm = c.name.toLowerCase().replace('&', 'and');
      return (
        cNorm.includes(normalized) ||
        normalized.includes(cNorm) ||
        c.id === categoryName ||
        c.name === categoryName
      );
    }) || PARTNER_CATEGORIES[0];

  return found.subCategories[partnerType] || [];
}
