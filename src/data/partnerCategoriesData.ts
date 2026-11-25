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

export const DEFAULT_PARTNER_CATEGORIES: PartnerCategoryConfig[] = [
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

export const PARTNER_CATEGORIES = DEFAULT_PARTNER_CATEGORIES;

const STORAGE_KEY = 'serva_partner_categories';

/**
 * Retrieve current categories from localStorage, or initialize with defaults.
 */
export function getStoredCategories(): PartnerCategoryConfig[] {
  if (typeof window === 'undefined') return DEFAULT_PARTNER_CATEGORIES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PARTNER_CATEGORIES));
      return DEFAULT_PARTNER_CATEGORIES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch {
    // fallback
  }
  return DEFAULT_PARTNER_CATEGORIES;
}

/**
 * Save updated categories to localStorage and trigger storage sync event.
 */
export function saveStoredCategories(categories: PartnerCategoryConfig[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
    window.dispatchEvent(new CustomEvent('serva:categories-updated', { detail: categories }));
  } catch (err) {
    console.error('Failed to save categories to localStorage:', err);
  }
}

/**
 * Add a new category.
 */
export function addCategory(newCategory: PartnerCategoryConfig): PartnerCategoryConfig[] {
  const current = getStoredCategories();
  // Ensure unique ID
  const existingIndex = current.findIndex((c) => c.id === newCategory.id);
  let updated: PartnerCategoryConfig[];
  if (existingIndex >= 0) {
    updated = [...current];
    updated[existingIndex] = newCategory;
  } else {
    updated = [...current, newCategory];
  }
  saveStoredCategories(updated);
  return updated;
}

/**
 * Remove an existing category by its ID.
 */
export function removeCategory(categoryId: string): PartnerCategoryConfig[] {
  const current = getStoredCategories();
  const updated = current.filter((c) => c.id !== categoryId);
  saveStoredCategories(updated);
  return updated;
}

/**
 * Add a sub-category to either INDIVIDUAL or SHOP_BUSINESS for a category.
 */
export function addSubCategory(
  categoryId: string,
  partnerType: 'INDIVIDUAL' | 'SHOP_BUSINESS',
  subCategoryName: string
): PartnerCategoryConfig[] {
  const trimmed = subCategoryName.trim();
  if (!trimmed) return getStoredCategories();

  const current = getStoredCategories();
  const updated = current.map((c) => {
    if (c.id === categoryId || c.name.toLowerCase() === categoryId.toLowerCase()) {
      const list = c.subCategories[partnerType] || [];
      if (!list.includes(trimmed)) {
        return {
          ...c,
          subCategories: {
            ...c.subCategories,
            [partnerType]: [...list, trimmed],
          },
        };
      }
    }
    return c;
  });

  saveStoredCategories(updated);
  return updated;
}

/**
 * Remove a sub-category from either INDIVIDUAL or SHOP_BUSINESS for a category.
 */
export function removeSubCategory(
  categoryId: string,
  partnerType: 'INDIVIDUAL' | 'SHOP_BUSINESS',
  subCategoryName: string
): PartnerCategoryConfig[] {
  const current = getStoredCategories();
  const updated = current.map((c) => {
    if (c.id === categoryId || c.name.toLowerCase() === categoryId.toLowerCase()) {
      return {
        ...c,
        subCategories: {
          ...c.subCategories,
          [partnerType]: (c.subCategories[partnerType] || []).filter((s) => s !== subCategoryName),
        },
      };
    }
    return c;
  });

  saveStoredCategories(updated);
  return updated;
}

/**
 * Reset all categories and sub-categories to platform defaults.
 */
export function resetCategoriesToDefault(): PartnerCategoryConfig[] {
  saveStoredCategories(DEFAULT_PARTNER_CATEGORIES);
  return DEFAULT_PARTNER_CATEGORIES;
}

/**
 * Dynamic getter for sub-categories by category name/slug and partner type.
 */
export function getSubCategories(categoryName: string, partnerType: 'INDIVIDUAL' | 'SHOP_BUSINESS'): string[] {
  const categories = getStoredCategories();
  const normalized = categoryName.toLowerCase().replace('&', 'and');
  const found =
    categories.find((c) => {
      const cNorm = c.name.toLowerCase().replace('&', 'and');
      return (
        cNorm.includes(normalized) ||
        normalized.includes(cNorm) ||
        c.id === categoryName ||
        c.name === categoryName
      );
    }) || categories[0] || DEFAULT_PARTNER_CATEGORIES[0];

  return found?.subCategories?.[partnerType] || [];
}
