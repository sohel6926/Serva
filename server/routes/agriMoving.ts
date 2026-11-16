import crypto from 'crypto';
import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { notificationAdapter } from '../adapters/notifications.ts';
import {
  AGRI_MACHINERY,
  AGRI_SERVICES,
  MOVING_INVENTORY_CATEGORIES,
  MOVING_MAIN_SERVICES,
  PACKING_BOX_SPECS,
  convertFarmArea,
} from '../data/agriMovingCatalog.ts';
import { getDb } from '../db/client.ts';
import { defaultCancellationTerms } from '../domain/bookingStateMachine.ts';
import { requireAuth } from '../middleware/auth.ts';

export const agriMovingRouter = Router();

agriMovingRouter.get('/agriculture/catalog', (_req: Request, res: Response) => {
  res.json({
    services: AGRI_SERVICES,
    machinery: AGRI_MACHINERY,
  });
});

agriMovingRouter.get('/moving/catalog', (_req: Request, res: Response) => {
  res.json({
    mainServices: MOVING_MAIN_SERVICES, // Exactly 7 main services (Test 9)
    boxSpecs: PACKING_BOX_SPECS, // 5 box sizes in inches & cm (Test 10)
    inventoryCategories: MOVING_INVENTORY_CATEGORIES,
    vehicleProvidedByServa: false,
  });
});

const agriBookSchema = z.object({
  entryMode: z.enum(['WORKERS', 'SERVICES', 'MACHINERY']).default('SERVICES'),
  serviceId: z.string().optional(),
  cropType: z.string().trim().min(2),
  areaValue: z.number().positive(),
  areaUnit: z.enum(['ACRES', 'GUNTAS', 'HECTARES']),
  workerCount: z.number().int().min(0).max(200).optional().default(0),
  machineId: z.string().optional(),
  machineryBilling: z.enum(['HOURLY', 'DAILY', 'PER_ACRE']).optional().default('PER_ACRE'),
  machineryDuration: z.number().int().min(1).max(100).optional().default(1),
  includeOperator: z.boolean().optional().default(true),
  isRecurring: z.boolean().optional().default(false),
  location: z.object({
    village: z.string().trim().min(2),
    mandal: z.string().trim().min(2),
    district: z.string().trim().min(2),
    pinNote: z.string().trim().optional(),
  }),
  scheduledDate: z.string().trim().min(4),
  scheduledTime: z.string().trim().min(2),
  serviceSpecific: z.record(z.string(), z.unknown()).optional().default({}),
  notes: z.string().trim().max(800).optional(),
});

// Server-side Agriculture Booking (Spec §9 + Test 11)
agriMovingRouter.post('/agriculture/book', requireAuth, (req: Request, res: Response) => {
  const parsed = agriBookSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Invalid agriculture booking details.' });
    return;
  }

  const d = parsed.data;
  const db = getDb();
  const areaConverted = convertFarmArea(d.areaValue, d.areaUnit);
  const chosenService = AGRI_SERVICES.find((s) => s.id === d.serviceId);
  const chosenMachine = d.machineId ? AGRI_MACHINERY.find((m) => m.id === d.machineId) : undefined;

  const lines: Array<{ name: string; quantity: number; unitPaise: number; totalPaise: number }> = [];

  // 1. Workers component (₹600/worker/day)
  if (d.entryMode === 'WORKERS' || d.workerCount > 0) {
    const workers = Math.max(1, d.workerCount);
    const workerTotal = workers * 60000;
    lines.push({
      name: `Agricultural Workers (${workers} workers)`,
      quantity: workers,
      unitPaise: 60000,
      totalPaise: workerTotal,
    });
  }

  // 2. Service component
  if (chosenService && d.entryMode !== 'WORKERS') {
    const isPerAcre = chosenService.unitLabel.includes('acre');
    const qty = isPerAcre ? Math.max(1, Math.ceil(areaConverted.acres)) : 1;
    const svcTotal = Math.round(
      isPerAcre ? chosenService.ratePaise * areaConverted.acres : chosenService.ratePaise
    );
    lines.push({
      name: chosenService.name,
      quantity: qty,
      unitPaise: chosenService.ratePaise,
      totalPaise: svcTotal,
    });
  }

  // 3. Machinery component + operator
  if (chosenMachine) {
    let rate = chosenMachine.perAcreRatePaise;
    let qty = Math.max(1, areaConverted.acres);
    let label = 'per acre';
    if (d.machineryBilling === 'HOURLY') {
      rate = chosenMachine.hourlyRatePaise;
      qty = d.machineryDuration;
      label = 'hours';
    } else if (d.machineryBilling === 'DAILY') {
      rate = chosenMachine.dailyRatePaise;
      qty = d.machineryDuration;
      label = 'days';
    }
    const machTotal = Math.round(rate * qty);
    lines.push({
      name: `Machinery Rental: ${chosenMachine.name} (${qty} ${label})`,
      quantity: Math.max(1, Math.round(qty)),
      unitPaise: rate,
      totalPaise: machTotal,
    });

    if (d.includeOperator) {
      lines.push({
        name: 'Trained Machine Operator',
        quantity: 1,
        unitPaise: chosenMachine.operatorFeePaise,
        totalPaise: chosenMachine.operatorFeePaise,
      });
    }
  }

  if (lines.length === 0) {
    lines.push({
      name: 'Agricultural Field Service',
      quantity: 1,
      unitPaise: 85000,
      totalPaise: 85000,
    });
  }

  // Separate travel & platform fee estimate lines per Spec §9
  const travelPaise = 15000;
  const platformFeePaise = 5000;
  lines.push({ name: 'Field Travel Allowance', quantity: 1, unitPaise: travelPaise, totalPaise: travelPaise });
  lines.push({ name: 'Platform Support Fee', quantity: 1, unitPaise: platformFeePaise, totalPaise: platformFeePaise });

  const totalPaise = lines.reduce((sum, l) => sum + l.totalPaise, 0);
  const bookingId = crypto.randomUUID();
  const bookingCode = `SRV-2026-${crypto.randomInt(100000, 999999)}`;

  const serviceSlug =
    d.entryMode === 'WORKERS'
      ? 'agricultural-workers'
      : d.entryMode === 'MACHINERY'
      ? 'tractor-rental'
      : chosenService?.slug ?? 'paddy-harvesting';

  const title =
    chosenService?.name ||
    chosenMachine?.name ||
    `Agricultural Workers (${Math.max(1, d.workerCount)})`;

  db.prepare(
    `INSERT INTO bookings (
      id, booking_code, customer_id, category_slug, service_slug, title, status, price_status,
      payment_mode, payment_status, scheduled_date, scheduled_time, address_json, details_json,
      total_paise, advance_required_paise, paid_paise, balance_paise, cancellation_terms
    ) VALUES (?, ?, ?, 'agriculture', ?, ?, 'REQUEST_SUBMITTED', 'ESTIMATED', 'ONLINE_OR_CASH', 'PENDING', ?, ?, ?, ?, ?, ?, 0, ?, ?)`
  ).run(
    bookingId,
    bookingCode,
    req.user!.id,
    serviceSlug,
    `${title} — ${d.cropType}`,
    d.scheduledDate,
    d.scheduledTime,
    JSON.stringify({
      line1: `${d.location.village}, ${d.location.mandal} Mandal`,
      area: d.location.mandal,
      city: d.location.district,
    }),
    JSON.stringify({
      ...d,
      areaConverted,
      pesticideSafetyAcknowledged: Boolean(chosenService?.requiresPesticideNotice),
      rejected_partner_ids: [],
    }),
    totalPaise,
    totalPaise,
    totalPaise,
    defaultCancellationTerms('agriculture')
  );

  const insertItem = db.prepare(
    `INSERT INTO booking_items (id, booking_id, item_type, name, quantity, unit_price_paise, total_paise)
     VALUES (?, ?, 'AGRI_LINE', ?, ?, ?, ?)`
  );
  for (const l of lines) {
    insertItem.run(crypto.randomUUID(), bookingId, l.name, l.quantity, l.unitPaise, l.totalPaise);
  }

  notificationAdapter.notifyUser({
    userId: req.user!.id,
    title: 'Agriculture Request Submitted',
    body: `${title} (${areaConverted.acres} acres / ${areaConverted.guntas} guntas) created (${bookingCode}).`,
    link: `/bookings/${bookingId}`,
  });

  const created = db.prepare(`SELECT * FROM bookings WHERE id = ?`).get(bookingId) as Record<string, any>;
  const items = db.prepare(`SELECT * FROM booking_items WHERE booking_id = ?`).all(bookingId);

  res.status(201).json({
    booking: {
      ...created,
      confirmed_booking_id: created.booking_code,
      address: JSON.parse(created.address_json),
      details: JSON.parse(created.details_json),
      items,
    },
  });
});

// Server-side Moving & Shifting Booking (Spec §10 + Tests 9 & 10)
const movingBookSchema = z.object({
  serviceSlug: z.enum([
    'home-shifting',
    'office-shifting',
    'packing',
    'loading-unloading',
    'transport',
    'labour-only',
    'heavy-item-moving',
    'individual-item',
  ]),
  scheduledDate: z.string().trim().min(4),
  scheduledTime: z.string().trim().min(2),
  pickupAddress: z.object({
    line1: z.string().trim().min(3),
    floor: z.number().int().min(0).max(50).default(0),
    hasLift: z.boolean().default(true),
    city: z.string().trim().default('Hyderabad'),
  }),
  dropAddress: z.object({
    line1: z.string().trim().min(3),
    floor: z.number().int().min(0).max(50).default(0),
    hasLift: z.boolean().default(true),
    city: z.string().trim().default('Hyderabad'),
  }),
  propertySize: z.string().trim().default('2 BHK'),
  workerCount: z.number().int().min(1).max(20).default(3),
  vehicleChoice: z.enum(['ARRANGED', 'WILL_ARRANGE', 'NEED_GUIDANCE']),
  arrangedVehicleInfo: z
    .object({
      vehicleType: z.string().optional(),
      arrivalTime: z.string().optional(),
      registrationNumber: z.string().optional(),
    })
    .optional(),
  providerSuppliesMaterials: z.boolean().default(true),
  boxes: z
    .object({
      small: z.number().int().min(0).max(200).default(0),
      medium: z.number().int().min(0).max(200).default(0),
      large: z.number().int().min(0).max(200).default(0),
      xl: z.number().int().min(0).max(200).default(0),
      custom: z.number().int().min(0).max(200).default(0),
      customDimensions: z.string().optional(),
    })
    .default({ small: 0, medium: 0, large: 0, xl: 0, custom: 0 }),
  inventoryItems: z
    .array(
      z.object({
        category: z.string(),
        name: z.string(),
        quantity: z.number().int().min(1),
        fragile: z.boolean().optional(),
      })
    )
    .optional()
    .default([]),
  individualItemMode: z.string().optional(),
  notes: z.string().trim().max(800).optional(),
});

agriMovingRouter.post('/moving/book', requireAuth, (req: Request, res: Response) => {
  const parsed = movingBookSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Invalid moving booking input.' });
    return;
  }

  const d = parsed.data;
  const db = getDb();

  // Never allow any vehicle charge or vehicle rental
  const svcMeta = MOVING_MAIN_SERVICES.find((s) => s.slug === d.serviceSlug);
  const baseServicePaise = svcMeta?.basePaise ?? 90000;
  const workerChargesPaise = d.workerCount * 80000;
  const stairsWithoutLiftFloors =
    (!d.pickupAddress.hasLift ? d.pickupAddress.floor : 0) +
    (!d.dropAddress.hasLift ? d.dropAddress.floor : 0);
  const combinedLoadUnloadPaise =
    d.serviceSlug === 'labour-only' ? 0 : 60000 + stairsWithoutLiftFloors * 20000;

  let packingMaterialsPaise = 0;
  if (d.providerSuppliesMaterials) {
    for (const spec of PACKING_BOX_SPECS) {
      const count = d.boxes[spec.id] ?? 0;
      packingMaterialsPaise += count * spec.unitPricePaise;
    }
  }

  const lines: Array<{ itemType: string; name: string; quantity: number; unitPaise: number; totalPaise: number }> = [
    {
      itemType: 'WORKER_CHARGES',
      name: `Moving Crew (${d.workerCount} workers — ${svcMeta?.name ?? 'Individual Item Shifting'})`,
      quantity: d.workerCount,
      unitPaise: 80000,
      totalPaise: workerChargesPaise + Math.round(baseServicePaise * 0.4),
    },
  ];

  if (combinedLoadUnloadPaise > 0) {
    lines.push({
      itemType: 'LOADING_UNLOADING',
      name: 'Combined Loading & Unloading Handling',
      quantity: 1,
      unitPaise: combinedLoadUnloadPaise,
      totalPaise: combinedLoadUnloadPaise,
    });
  }

  // Separate Material Cost line (Test 10)
  if (packingMaterialsPaise > 0) {
    const totalBoxes =
      d.boxes.small + d.boxes.medium + d.boxes.large + d.boxes.xl + d.boxes.custom;
    lines.push({
      itemType: 'PACKING_MATERIALS',
      name: `Packing Boxes & Materials (${totalBoxes} boxes)`,
      quantity: Math.max(1, totalBoxes),
      unitPaise: Math.round(packingMaterialsPaise / Math.max(1, totalBoxes)),
      totalPaise: packingMaterialsPaise,
    });
  }

  const totalPaise = lines.reduce((sum, l) => sum + l.totalPaise, 0);
  const bookingId = crypto.randomUUID();
  const bookingCode = `SRV-2026-${crypto.randomInt(100000, 999999)}`;
  const title = svcMeta?.name ?? 'Individual Item Shifting';

  db.prepare(
    `INSERT INTO bookings (
      id, booking_code, customer_id, category_slug, service_slug, title, status, price_status,
      payment_mode, payment_status, scheduled_date, scheduled_time, address_json, details_json,
      total_paise, advance_required_paise, paid_paise, balance_paise, cancellation_terms
    ) VALUES (?, ?, ?, 'moving', ?, ?, 'REQUEST_SUBMITTED', 'ESTIMATED', 'ONLINE_OR_CASH', 'PENDING', ?, ?, ?, ?, ?, ?, 0, ?, ?)`
  ).run(
    bookingId,
    bookingCode,
    req.user!.id,
    d.serviceSlug,
    `${title} (${d.propertySize})`,
    d.scheduledDate,
    d.scheduledTime,
    JSON.stringify({ line1: `${d.pickupAddress.line1} → ${d.dropAddress.line1}`, city: d.pickupAddress.city }),
    JSON.stringify({
      ...d,
      vehicleProvidedByServa: false,
      rejected_partner_ids: [],
    }),
    totalPaise,
    totalPaise,
    totalPaise,
    defaultCancellationTerms('moving')
  );

  const insertItem = db.prepare(
    `INSERT INTO booking_items (id, booking_id, item_type, name, quantity, unit_price_paise, total_paise)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  );
  for (const l of lines) {
    insertItem.run(crypto.randomUUID(), bookingId, l.itemType, l.name, l.quantity, l.unitPaise, l.totalPaise);
  }

  notificationAdapter.notifyUser({
    userId: req.user!.id,
    title: 'Moving Request Submitted',
    body: `${title} request (${bookingCode}) created. Customers arrange their own vehicle independently.`,
    link: `/bookings/${bookingId}`,
  });

  const created = db.prepare(`SELECT * FROM bookings WHERE id = ?`).get(bookingId) as Record<string, any>;
  const items = db.prepare(`SELECT * FROM booking_items WHERE booking_id = ?`).all(bookingId);

  res.status(201).json({
    booking: {
      ...created,
      confirmed_booking_id: created.booking_code,
      address: JSON.parse(created.address_json),
      details: JSON.parse(created.details_json),
      items,
    },
  });
});
