import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import {
  CLEANING_OPTIONS,
  COOKING_DISHES,
  REPAIR_OPTIONS,
  REQUIRED_CLEANING_ITEMS,
} from '../data/homeServicesCatalog.ts';
import { getDb } from '../db/client.ts';
import { computeHomeServiceOrder } from '../domain/homeServiceCalc.ts';
import { calculateHomeServicePricing, getHomeServicePricingConfig } from '../domain/pricing.ts';

export const homeServicesRouter = Router();

// Customer-safe Home Services catalog (never exposes worker_price, 7%, or ₹100)
homeServicesRouter.get('/home-services/catalog', (_req: Request, res: Response) => {
  const config = getHomeServicePricingConfig();

  const repairOptions = REPAIR_OPTIONS.map((o) => {
    const p = calculateHomeServicePricing({
      workerPricePaise: o.workerPricePaise,
      platformPercent: config.platformPercent,
      fixedAddonPaise: config.fixedAddonPaise,
      discountRupeesOverride: 20,
    });
    return {
      id: o.id,
      domain: o.domain,
      name: o.name,
      subLabel: o.subLabel,
      estimatedServicePricePaise: p.displayPricePaise,
    };
  });

  const cleaningOptions = CLEANING_OPTIONS.map((o) => {
    const p = calculateHomeServicePricing({
      workerPricePaise: o.workerPricePerUnitPaise,
      platformPercent: config.platformPercent,
      fixedAddonPaise: config.fixedAddonPaise,
      discountRupeesOverride: 20,
    });
    return {
      id: o.id,
      tab: o.tab,
      name: o.name,
      unitLabel: o.unitLabel,
      hasWorkerStepper: Boolean(o.hasWorkerStepper),
      estimatedUnitServicePricePaise: p.displayPricePaise,
    };
  });

  res.json({
    repairOptions,
    cleaningOptions,
    requiredCleaningItems: REQUIRED_CLEANING_ITEMS,
    cookingDishes: COOKING_DISHES,
  });
});

const previewSchema = z.object({
  serviceSlug: z.string().trim().min(1),
  quantity: z.number().int().min(1).max(300).optional().default(1),
  details: z.record(z.string(), z.unknown()).optional().default({}),
});

// Server-computed customer-safe estimate preview (no worker price or split leaked)
homeServicesRouter.post('/home-services/estimate', (req: Request, res: Response) => {
  const parsed = previewSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid estimate request.' });
    return;
  }

  const db = getDb();
  const service = db
    .prepare(`SELECT * FROM services WHERE category_slug = 'home-services' AND slug = ?`)
    .get(parsed.data.serviceSlug) as Record<string, any> | undefined;

  const basePricePaise = Number(service?.base_price_paise ?? 25000);
  const serviceName = String(service?.name ?? 'Home Service');

  const computed = computeHomeServiceOrder({
    serviceSlug: parsed.data.serviceSlug,
    serviceName,
    basePricePaise,
    quantity: parsed.data.quantity,
    details: parsed.data.details,
    previewOnly: true,
  });

  res.json({
    estimate: {
      servicePricePaise: computed.pricing.displayPricePaise,
      priceStatus: 'ESTIMATED',
      onlinePaymentOnly: computed.onlineOnly,
      cookingBreakdown: computed.cookingBreakdown ?? null,
    },
  });
});
