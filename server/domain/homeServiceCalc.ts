import {
  CLEANING_OPTIONS,
  COOKING_DISHES,
  COOK_SERVICE_WORKER_BASE_PAISE,
  REPAIR_OPTIONS,
} from '../data/homeServicesCatalog.ts';
import {
  calculateHomeServicePricing,
  getHomeServicePricingConfig,
  type HomeServicePricingResult,
} from './pricing.ts';

export interface HomeServiceComputedOrder {
  workerPricePaise: number;
  ingredientPassthroughPaise: number;
  onlineOnly: boolean;
  pricing: HomeServicePricingResult;
  customerItems: Array<{ itemType: string; name: string; quantity: number; unitPricePaise: number; totalPaise: number }>;
  cookingBreakdown?: {
    dishName: string;
    people: number;
    perPlatePaise: number;
    dishSubtotalPaise: number;
    cookServiceChargePaise: number;
  };
}

export function computeHomeServiceOrder(input: {
  serviceSlug: string;
  serviceName: string;
  basePricePaise: number;
  quantity: number;
  details: Record<string, unknown>;
  /** For preview endpoints only, skip generating a random offer discount */
  previewOnly?: boolean;
}): HomeServiceComputedOrder {
  const { serviceSlug, serviceName, basePricePaise, quantity, details } = input;
  const config = getHomeServicePricingConfig();
  const subFlow = typeof details.subFlow === 'string' ? details.subFlow : '';

  let workerPricePaise = Math.max(0, basePricePaise * Math.max(1, quantity));
  let ingredientPassthroughPaise = 0;
  let onlineOnly = ['home-cooking', 'wall-painting'].includes(serviceSlug);
  const customerItems: HomeServiceComputedOrder['customerItems'] = [];
  let cookingBreakdown: HomeServiceComputedOrder['cookingBreakdown'];

  // 1. Repairing sub-flow (Spec §6.2)
  if (subFlow === 'repairing' && Array.isArray(details.selectedOptionIds) && details.selectedOptionIds.length > 0) {
    const ids = details.selectedOptionIds.filter((x): x is string => typeof x === 'string');
    const matched = REPAIR_OPTIONS.filter((o) => ids.includes(o.id));
    if (matched.length > 0) {
      const units = Math.max(1, Number(details.units || quantity || 1));
      workerPricePaise = matched.reduce((sum, item) => sum + item.workerPricePaise, 0) * units;
    }
  }

  // 2. Cleaning sub-flow (Spec §6.3)
  if (subFlow === 'cleaning' && details.quantities && typeof details.quantities === 'object') {
    const qtyMap = details.quantities as Record<string, unknown>;
    let sumWorker = 0;
    let totalUnits = 0;
    for (const opt of CLEANING_OPTIONS) {
      const q = Math.max(0, Math.min(50, Math.floor(Number(qtyMap[opt.id] ?? 0))));
      if (q > 0) {
        sumWorker += opt.workerPricePerUnitPaise * q;
        totalUnits += q;
      }
    }
    const workers = Math.max(1, Math.min(6, Math.floor(Number(details.workers ?? 1))));
    if (sumWorker > 0) {
      workerPricePaise = sumWorker + (workers > 1 ? (workers - 1) * 15000 : 0);
    } else if (totalUnits === 0) {
      workerPricePaise = Math.max(10000, basePricePaise);
    }
  }

  // 3. Cooking sub-flow (Spec §6.4 + Test 5)
  if (subFlow === 'cooking' || serviceSlug === 'home-cooking') {
    onlineOnly = true;
    const dishId = typeof details.dishId === 'string' ? details.dishId : 'dish-dosa';
    const dish = COOKING_DISHES.find((d) => d.id === dishId) ?? COOKING_DISHES[1];
    const people = Math.max(1, Math.min(300, Math.floor(Number(details.people ?? 10))));
    const cookingType = typeof details.cookingType === 'string' ? details.cookingType : 'HOME';
    const typeMultiplier = cookingType === 'BULK' ? 2 : cookingType === 'EVENT' ? 1.5 : 1;

    // Raw dish cost (e.g. ₹40 × 10 = ₹400) passed through without markup
    ingredientPassthroughPaise = dish.perPlatePaise * people;
    // Cook service worker base (₹374 * multiplier -> displays ₹500 for HOME cooking)
    workerPricePaise = Math.round(COOK_SERVICE_WORKER_BASE_PAISE * typeMultiplier);

    const previewServiceOnly = calculateHomeServicePricing({
      workerPricePaise,
      platformPercent: config.platformPercent,
      fixedAddonPaise: config.fixedAddonPaise,
      ingredientPassthroughPaise: 0,
      markupIngredients: false,
      discountRupeesOverride: 20,
    });

    cookingBreakdown = {
      dishName: dish.name,
      people,
      perPlatePaise: dish.perPlatePaise,
      dishSubtotalPaise: ingredientPassthroughPaise,
      cookServiceChargePaise: previewServiceOnly.displayPricePaise,
    };
  }

  // 4. Painting & 3D Wall Art (Spec §6.5)
  if (subFlow === 'painting' || serviceSlug === 'wall-painting') {
    onlineOnly = true;
    const areaSqft = Math.max(50, Math.min(20000, Math.floor(Number(details.areaSqft ?? 250))));
    const rooms = Math.max(1, Math.min(30, Math.floor(Number(details.rooms ?? 1))));
    const finish = typeof details.finish === 'string' ? details.finish : 'MATTE';
    const ratePerSqftPaise =
      finish === 'TEXTURE_3D' ? 4500 : finish === 'ROYAL_WASHABLE' ? 2400 : finish === 'SATIN' ? 1800 : 1400;
    workerPricePaise = Math.max(50000, areaSqft * ratePerSqftPaise + (rooms - 1) * 40000);
  }

  const pricing = calculateHomeServicePricing({
    workerPricePaise,
    platformPercent: config.platformPercent,
    fixedAddonPaise: config.fixedAddonPaise,
    ingredientPassthroughPaise,
    markupIngredients: config.markupIngredients,
    discountRupeesOverride: input.previewOnly ? 20 : undefined,
  });

  if (cookingBreakdown) {
    customerItems.push({
      itemType: 'COOKING_INGREDIENTS',
      name: `${cookingBreakdown.dishName} (${cookingBreakdown.people} people × ₹${Math.round(
        cookingBreakdown.perPlatePaise / 100
      )})`,
      quantity: cookingBreakdown.people,
      unitPricePaise: cookingBreakdown.perPlatePaise,
      totalPaise: cookingBreakdown.dishSubtotalPaise,
    });
    customerItems.push({
      itemType: 'COOKING_SERVICE',
      name: 'Cook Service Charge',
      quantity: 1,
      unitPricePaise: cookingBreakdown.cookServiceChargePaise,
      totalPaise: cookingBreakdown.cookServiceChargePaise,
    });
  } else {
    customerItems.push({
      itemType: 'SERVICE',
      name: `${serviceName} (Service price)`,
      quantity: 1,
      unitPricePaise: pricing.displayPricePaise,
      totalPaise: pricing.displayPricePaise,
    });
  }

  return {
    workerPricePaise,
    ingredientPassthroughPaise,
    onlineOnly,
    pricing,
    customerItems,
    cookingBreakdown,
  };
}
