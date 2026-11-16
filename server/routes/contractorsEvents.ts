import crypto from 'crypto';
import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { notificationAdapter } from '../adapters/notifications.ts';
import {
  CONTRACTOR_MACHINERY,
  CONTRACTOR_WORKER_TRADES,
  DJ_PROFILES,
  EVENT_LAUNCH_SERVICES,
  EVENT_OTHER_ADDONS,
  EVENT_TYPES,
} from '../data/contractorsEventsCatalog.ts';
import { getDb } from '../db/client.ts';
import { defaultCancellationTerms } from '../domain/bookingStateMachine.ts';
import { requireAuth, requireRole } from '../middleware/auth.ts';

export const contractorsEventsRouter = Router();

// Public catalogs for Contractors & Events
contractorsEventsRouter.get('/contractors/catalog', (_req: Request, res: Response) => {
  res.json({
    workerTrades: CONTRACTOR_WORKER_TRADES,
    machinery: CONTRACTOR_MACHINERY,
  });
});

contractorsEventsRouter.get('/events/catalog', (_req: Request, res: Response) => {
  res.json({
    eventTypes: EVENT_TYPES,
    launchServices: EVENT_LAUNCH_SERVICES,
    otherAddons: EVENT_OTHER_ADDONS,
    djProfiles: DJ_PROFILES,
  });
});

// Contractors Server-Side Booking (Workers / Vehicles / Interior / Furniture)
const contractorBookSchema = z.object({
  serviceSlug: z.enum([
    'interior-design',
    'furniture-design',
    'site-workers',
    'jcb-excavator',
    'material-transport',
    'concrete-road-machinery',
  ]),
  scheduledDate: z.string().trim().min(4),
  scheduledTime: z.string().trim().min(2),
  address: z.object({
    line1: z.string().trim().min(3),
    area: z.string().trim().optional(),
    city: z.string().trim().default('Hyderabad'),
    pincode: z.string().trim().optional(),
  }),
  workerTradeId: z.string().optional(),
  workerCount: z.number().int().min(1).max(100).optional().default(1),
  days: z.number().int().min(1).max(180).optional().default(1),
  machineId: z.string().optional(),
  durationUnits: z.number().int().min(1).max(100).optional().default(1),
  operatorRequired: z.boolean().optional().default(true),
  furnitureCategory: z.string().optional(),
  interiorRoomType: z.string().optional(),
  areaSqft: z.number().int().min(50).max(50000).optional(),
  notes: z.string().trim().max(500).optional(),
});

contractorsEventsRouter.post('/contractors/book', requireAuth, (req: Request, res: Response) => {
  const parsed = contractorBookSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Invalid contractor booking input' });
    return;
  }

  const db = getDb();
  const d = parsed.data;
  const service = db
    .prepare(`SELECT * FROM services WHERE category_slug = 'contractors' AND slug = ?`)
    .get(d.serviceSlug) as Record<string, any> | undefined;

  if (!service) {
    res.status(404).json({ error: 'Contractor service not found.' });
    return;
  }

  let totalPaise = Number(service.base_price_paise || 250000);
  let itemName = service.name;
  let qty = 1;
  let unitPaise = totalPaise;

  if (d.serviceSlug === 'site-workers') {
    const trade =
      CONTRACTOR_WORKER_TRADES.find((t) => t.id === d.workerTradeId) ?? CONTRACTOR_WORKER_TRADES[0];
    unitPaise = trade.dailyRatePaise;
    qty = d.workerCount * d.days;
    totalPaise = unitPaise * qty;
    itemName = `${trade.name} (${d.workerCount} workers × ${d.days} days)`;
  } else if (
    ['jcb-excavator', 'material-transport', 'concrete-road-machinery'].includes(d.serviceSlug)
  ) {
    const machine =
      CONTRACTOR_MACHINERY.find((m) => m.id === d.machineId) ?? CONTRACTOR_MACHINERY[0];
    unitPaise = machine.ratePaise;
    qty = d.durationUnits;
    const opFee = d.operatorRequired ? 50000 * d.durationUnits : 0;
    totalPaise = unitPaise * qty + opFee;
    itemName = `${machine.name} (${qty} ${machine.unitLabel}${d.operatorRequired ? ', with operator' : ''})`;
  } else if (d.serviceSlug === 'furniture-design') {
    itemName = `Furniture Design — ${d.furnitureCategory || 'Custom Unit'}`;
  } else if (d.serviceSlug === 'interior-design') {
    itemName = `Interior Design Consultation (${d.interiorRoomType || 'Full Home'})`;
  }

  const bookingId = crypto.randomUUID();
  const bookingCode = `SRV-2026-${crypto.randomInt(100000, 999999)}`;

  db.prepare(
    `INSERT INTO bookings (
      id, booking_code, customer_id, category_slug, service_slug, title, status, price_status,
      payment_mode, payment_status, scheduled_date, scheduled_time, address_json, details_json,
      total_paise, advance_required_paise, paid_paise, balance_paise, cancellation_terms
    ) VALUES (?, ?, ?, 'contractors', ?, ?, 'REQUEST_SUBMITTED', 'ESTIMATED', 'ONLINE_OR_CASH', 'PENDING', ?, ?, ?, ?, ?, ?, 0, ?, ?)`
  ).run(
    bookingId,
    bookingCode,
    req.user!.id,
    d.serviceSlug,
    itemName,
    d.scheduledDate,
    d.scheduledTime,
    JSON.stringify(d.address),
    JSON.stringify({ ...d, rejected_partner_ids: [] }),
    totalPaise,
    totalPaise,
    totalPaise,
    defaultCancellationTerms('contractors')
  );

  db.prepare(
    `INSERT INTO booking_items (id, booking_id, item_type, name, quantity, unit_price_paise, total_paise)
     VALUES (?, ?, 'SERVICE', ?, ?, ?, ?)`
  ).run(crypto.randomUUID(), bookingId, itemName, qty, unitPaise, totalPaise);

  const created = db.prepare(`SELECT * FROM bookings WHERE id = ?`).get(bookingId) as Record<string, any>;
  res.status(201).json({
    booking: {
      ...created,
      confirmed_booking_id: created.booking_code,
      address: JSON.parse(created.address_json),
      details: JSON.parse(created.details_json),
    },
  });
});

// Home Construction Free Promotion Enquiry (Hard Rule 7 + Test 12: zero payment)
const enquirySchema = z.object({
  projectTitle: z.string().trim().optional(),
  partnerId: z.string().trim().optional(),
  buildingType: z.string().trim().min(2),
  plotSize: z.string().trim().min(2),
  budgetRange: z.string().trim().min(2),
  location: z.string().trim().min(2),
  timeline: z.string().trim().min(2),
  notes: z.string().trim().max(800).optional(),
});

contractorsEventsRouter.post('/contractors/enquiries', requireAuth, (req: Request, res: Response) => {
  const parsed = enquirySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Please fill all project enquiry fields.' });
    return;
  }

  const db = getDb();
  const id = crypto.randomUUID();
  const d = parsed.data;

  db.prepare(
    `INSERT INTO construction_enquiries (
      id, customer_id, partner_id, project_title, building_type, plot_size, budget_range, location, timeline, notes, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'SENT')`
  ).run(
    id,
    req.user!.id,
    d.partnerId ?? 'partner-verified-1',
    d.projectTitle ?? 'Custom Home Construction Enquiry',
    d.buildingType,
    d.plotSize,
    d.budgetRange,
    d.location,
    d.timeline,
    d.notes ?? null
  );

  // Notify verified contractors
  const contractorPartner = db
    .prepare(`SELECT user_id FROM partners WHERE id = ?`)
    .get(d.partnerId ?? 'partner-verified-1') as { user_id: string } | undefined;

  if (contractorPartner) {
    notificationAdapter.notifyUser({
      userId: contractorPartner.user_id,
      title: 'New Home Construction Enquiry',
      body: `${req.user!.name} is interested in ${d.buildingType} (${d.plotSize}, ${d.location}).`,
      link: '/partner/dashboard',
    });
  }

  const created = db
    .prepare(`SELECT * FROM construction_enquiries WHERE id = ?`)
    .get(id);

  res.status(201).json({
    noPaymentRequired: true,
    enquiry: created,
  });
});

// Contractor / Partner & Admin view construction enquiries (Test 12)
contractorsEventsRouter.get(
  '/contractors/enquiries',
  requireRole('PARTNER', 'ADMIN', 'CUSTOMER'),
  (req: Request, res: Response) => {
    const db = getDb();
    const user = req.user!;

    if (user.role === 'CUSTOMER') {
      const rows = db
        .prepare(
          `SELECT * FROM construction_enquiries WHERE customer_id = ? ORDER BY created_at DESC`
        )
        .all(user.id);
      res.json({ enquiries: rows });
      return;
    }

    const rows = db
      .prepare(
        `SELECT ce.*, u.name as customer_name, u.mobile as customer_mobile, u.email as customer_email
         FROM construction_enquiries ce
         JOIN users u ON u.id = ce.customer_id
         ORDER BY ce.created_at DESC`
      )
      .all();
    res.json({ enquiries: rows });
  }
);

// Events: Individual or Multi-Service Quotation Builder (Tests 6, 7, 8)
const eventPlanSchema = z.object({
  eventType: z.string().trim().min(2),
  eventName: z.string().trim().min(2),
  eventDate: z.string().trim().min(4),
  startTime: z.string().trim().min(2),
  endTime: z.string().trim().min(2),
  venueType: z.enum(['INDOOR', 'OUTDOOR']).default('INDOOR'),
  guestCount: z.number().int().min(10).max(10000).default(250),
  address: z.object({
    line1: z.string().trim().min(3),
    area: z.string().trim().optional(),
    city: z.string().trim().default('Hyderabad'),
    pincode: z.string().trim().optional(),
  }),
  selectedServiceSlugs: z
    .array(z.enum(['decoration', 'catering', 'dance', 'singing', 'photography', 'dj']))
    .min(1),
  selectedAddonIds: z.array(z.string()).optional().default([]),
  useMarriageSamplePreset: z.boolean().optional().default(false),
  cateringPlates: z.number().int().min(10).max(5000).optional(),
  djProfileId: z.string().optional(),
  notes: z.string().trim().max(800).optional(),
});

contractorsEventsRouter.post('/events/plan', requireAuth, (req: Request, res: Response) => {
  const parsed = eventPlanSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Invalid event booking details.' });
    return;
  }

  const db = getDb();
  const d = parsed.data;
  const lineItems: Array<{ slug: string; name: string; quantity: number; unitPaise: number; totalPaise: number }> = [];

  for (const slug of d.selectedServiceSlugs) {
    const svc = EVENT_LAUNCH_SERVICES.find((s) => s.slug === slug)!;
    if (d.useMarriageSamplePreset) {
      lineItems.push({
        slug,
        name: svc.name,
        quantity: 1,
        unitPaise: svc.samplePackagePaise,
        totalPaise: svc.samplePackagePaise,
      });
    } else if (slug === 'catering') {
      const plates = d.cateringPlates ?? d.guestCount;
      lineItems.push({
        slug,
        name: `${svc.name} (${plates} plates)`,
        quantity: plates,
        unitPaise: svc.basePaise,
        totalPaise: svc.basePaise * plates,
      });
    } else if (slug === 'dj' && d.djProfileId) {
      const dj = DJ_PROFILES.find((p) => p.id === d.djProfileId) ?? DJ_PROFILES[0];
      lineItems.push({
        slug,
        name: `DJ — ${dj.name}`,
        quantity: 1,
        unitPaise: dj.quotedPricePaise,
        totalPaise: dj.quotedPricePaise,
      });
    } else {
      lineItems.push({
        slug,
        name: svc.name,
        quantity: 1,
        unitPaise: svc.basePaise,
        totalPaise: svc.basePaise,
      });
    }
  }

  for (const addonId of d.selectedAddonIds) {
    const addon = EVENT_OTHER_ADDONS.find((a) => a.id === addonId);
    if (addon) {
      lineItems.push({
        slug: addon.id,
        name: addon.name,
        quantity: 1,
        unitPaise: addon.pricePaise,
        totalPaise: addon.pricePaise,
      });
    }
  }

  // Server computes authoritative sum of service lines (Test 7)
  const totalPaise = lineItems.reduce((sum, l) => sum + l.totalPaise, 0);
  // 30% advance, 40% pre-event milestone, 30% post-completion (Test 6 & 7)
  const advanceRequiredPaise = Math.round((totalPaise * 30) / 100);
  const preEventMilestonePaise = Math.round((totalPaise * 40) / 100);
  const postCompletionPaise = totalPaise - advanceRequiredPaise - preEventMilestonePaise;
  const balanceAfterAdvancePaise = totalPaise - advanceRequiredPaise;

  const bookingId = crypto.randomUUID();
  const bookingCode = `SRV-2026-${crypto.randomInt(100000, 999999)}`;
  const primarySlug = d.selectedServiceSlugs.length === 1 ? d.selectedServiceSlugs[0] : 'multi-service-event';
  const title =
    d.selectedServiceSlugs.length === 1
      ? `${lineItems[0].name} — ${d.eventName}`
      : `${d.eventName} (${d.eventType} · ${d.selectedServiceSlugs.length} Services)`;

  db.prepare(
    `INSERT INTO bookings (
      id, booking_code, customer_id, category_slug, service_slug, title, status, price_status,
      payment_mode, payment_status, scheduled_date, scheduled_time, address_json, details_json,
      total_paise, advance_required_paise, paid_paise, balance_paise, cancellation_terms
    ) VALUES (?, ?, ?, 'events', ?, ?, 'AWAITING_ADVANCE', 'ESTIMATED', 'ONLINE_ONLY', 'PENDING', ?, ?, ?, ?, ?, ?, 0, ?, ?)`
  ).run(
    bookingId,
    bookingCode,
    req.user!.id,
    primarySlug,
    title,
    d.eventDate,
    `${d.startTime} - ${d.endTime}`,
    JSON.stringify(d.address),
    JSON.stringify({
      ...d,
      milestones: {
        advance30Paise: advanceRequiredPaise,
        preEvent40Paise: preEventMilestonePaise,
        final30Paise: postCompletionPaise,
      },
      rejected_partner_ids: [],
    }),
    totalPaise,
    advanceRequiredPaise,
    totalPaise,
    defaultCancellationTerms('events')
  );

  const insertItem = db.prepare(
    `INSERT INTO booking_items (id, booking_id, item_type, name, quantity, unit_price_paise, total_paise)
     VALUES (?, ?, 'EVENT_SERVICE', ?, ?, ?, ?)`
  );
  for (const line of lineItems) {
    insertItem.run(crypto.randomUUID(), bookingId, line.name, line.quantity, line.unitPaise, line.totalPaise);
  }

  notificationAdapter.notifyUser({
    userId: req.user!.id,
    title: 'Event Quotation Created (Awaiting Advance)',
    body: `${title}: pay 30% advance (₹${Math.round(advanceRequiredPaise / 100).toLocaleString('en-IN')}) to confirm your booking ID.`,
    link: `/book/pay?id=${bookingId}`,
  });

  const created = db.prepare(`SELECT * FROM bookings WHERE id = ?`).get(bookingId) as Record<string, any>;
  const items = db.prepare(`SELECT * FROM booking_items WHERE booking_id = ?`).all(bookingId);

  res.status(201).json({
    booking: {
      ...created,
      confirmed_booking_id: null, // No advance payment = no confirmed booking ID (Test 6)
      address: JSON.parse(created.address_json),
      details: JSON.parse(created.details_json),
      items,
      milestones: {
        advancePaise: advanceRequiredPaise,
        preEventPaise: preEventMilestonePaise,
        finalPaise: postCompletionPaise,
        balanceAfterAdvancePaise,
      },
    },
  });
});
