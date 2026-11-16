import crypto from 'crypto';
import { getDb } from '../db/client.ts';
import { roundPercentHalfUpInRupees } from './money.ts';

export interface HomeServicePricingConfig {
  platformPercent: number;
  fixedAddonPaise: number;
  markupIngredients: boolean;
}

export interface HomeServicePricingInput {
  workerPricePaise: number;
  platformPercent?: number;
  fixedAddonPaise?: number;
  ingredientPassthroughPaise?: number;
  markupIngredients?: boolean;
  /** Internal deterministic override for unit tests only; never exposed to HTTP APIs. */
  discountRupeesOverride?: number;
}

export interface HomeServicePricingResult {
  workerPricePaise: number;
  platformPercent: number;
  fixedAddonPaise: number;
  percentAddonPaise: number;
  displayPricePaise: number;
  discountRupees: number;
  discountPaise: number;
  payablePaise: number;
  workerPayoutPaise: number;
  platformRevenuePaise: number;
  ingredientPassthroughPaise: number;
}

export function getHomeServicePricingConfig(): HomeServicePricingConfig {
  try {
    const db = getDb();
    const rows = db
      .prepare(
        `SELECT key, value FROM admin_settings WHERE key IN ('home_service_percent', 'home_service_fixed_addon_paise', 'cooking_markup_ingredients')`
      )
      .all() as Array<{ key: string; value: string }>;

    const map = new Map(rows.map((r) => [r.key, r.value]));
    const platformPercent = Number(map.get('home_service_percent') ?? '7');
    const fixedAddonPaise = Number(map.get('home_service_fixed_addon_paise') ?? '10000');
    const markupIngredients = map.get('cooking_markup_ingredients') === '1';

    return {
      platformPercent: Number.isFinite(platformPercent) ? platformPercent : 7,
      fixedAddonPaise: Number.isFinite(fixedAddonPaise) ? fixedAddonPaise : 10000,
      markupIngredients,
    };
  } catch {
    return {
      platformPercent: 7,
      fixedAddonPaise: 10000,
      markupIngredients: false,
    };
  }
}

export function generateHomeServiceDiscountRupees(): number {
  return crypto.randomInt(20, 51); // 20 to 50 inclusive
}

/**
 * SERVA Spec §6.1 Home Services Pricing Engine
 * - worker_price is partner's payout base
 * - display_price = worker_price + roundHalfUp(platformPercent% of worker_price in rupees) + fixedAddon (+ ingredient pass-through)
 * - discount = whole number from ₹20 to ₹50 generated once server-side and locked
 * - payable = display_price - discount
 * - worker_payout = worker_price (+ ingredient pass-through)
 * - platform_revenue = payable - worker_payout
 */
export function calculateHomeServicePricing(input: HomeServicePricingInput): HomeServicePricingResult {
  const platformPercent = input.platformPercent ?? 7;
  const fixedAddonPaise = input.fixedAddonPaise ?? 10000;
  const ingredientPassthroughPaise = Math.max(0, Math.round(input.ingredientPassthroughPaise ?? 0));
  const markupIngredients = Boolean(input.markupIngredients);

  const rawWorkerPaise = Math.max(0, Math.round(input.workerPricePaise));
  const markupBasePaise = markupIngredients
    ? rawWorkerPaise + ingredientPassthroughPaise
    : rawWorkerPaise;

  const percentAddonPaise = roundPercentHalfUpInRupees(markupBasePaise, platformPercent);
  const effectivePassthrough = markupIngredients ? 0 : ingredientPassthroughPaise;

  const displayPricePaise = markupBasePaise + percentAddonPaise + fixedAddonPaise + effectivePassthrough;

  const discountRupees =
    input.discountRupeesOverride !== undefined
      ? Math.max(20, Math.min(50, Math.round(input.discountRupeesOverride)))
      : generateHomeServiceDiscountRupees();
  const discountPaise = discountRupees * 100;

  const payablePaise = Math.max(0, displayPricePaise - discountPaise);
  const workerPayoutPaise = rawWorkerPaise + ingredientPassthroughPaise;
  const platformRevenuePaise = payablePaise - workerPayoutPaise;

  return {
    workerPricePaise: rawWorkerPaise,
    platformPercent,
    fixedAddonPaise,
    percentAddonPaise,
    displayPricePaise,
    discountRupees,
    discountPaise,
    payablePaise,
    workerPayoutPaise,
    platformRevenuePaise,
    ingredientPassthroughPaise,
  };
}
