import crypto from 'crypto';
import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { notificationAdapter } from '../adapters/notifications.ts';
import { executeBookingPayment } from '../adapters/payment.ts';
import { getDb } from '../db/client.ts';
import {
  canCancel,
  canPartnerTransition,
  defaultCancellationTerms,
  type BookingStatus,
} from '../domain/bookingStateMachine.ts';
import { computeHomeServiceOrder } from '../domain/homeServiceCalc.ts';
import { requireAuth, requireRole } from '../middleware/auth.ts';

export const bookingsRouter = Router();

function generateBookingCode(): string {
  const num = crypto.randomInt(100000, 999999);
  return `SRV-2026-${num}`;
}

function getBookingAccess(bookingId: string, req: Request) {
  const db = getDb();
  const booking = db.prepare(`SELECT * FROM bookings WHERE id = ?`).get(bookingId) as
    | Record<string, any>
    | undefined;
  if (!booking) return { status: 404 as const, booking: null };

  const user = req.user!;
  if (user.role === 'ADMIN') return { status: 200 as const, booking };
  if (user.role === 'CUSTOMER' && booking.customer_id === user.id) {
    return { status: 200 as const, booking };
  }
  if (user.role === 'PARTNER') {
    if (booking.partner_id && booking.partner_id === user.partner_id) {
      return { status: 200 as const, booking };
    }
    if (!booking.partner_id && booking.status === 'REQUEST_SUBMITTED') {
      return { status: 200 as const, booking };
    }
  }
  return { status: 403 as const, booking: null };
}

function buildBookingDetail(booking: Record<string, any>, role: string) {
  const db = getDb();
  const items = db
    .prepare(`SELECT * FROM booking_items WHERE booking_id = ?`)
    .all(booking.id);

  const quotations = db
    .prepare(
      `SELECT q.*, p.business_name as partner_name
       FROM quotations q
       LEFT JOIN partners p ON p.id = q.partner_id
       WHERE q.booking_id = ?
       ORDER BY q.version DESC`
    )
    .all(booking.id) as Array<Record<string, any>>;

  for (const q of quotations) {
    q.lines = db
      .prepare(`SELECT * FROM quotation_lines WHERE quotation_id = ? ORDER BY id ASC`)
      .all(q.id);
  }

  const payments = db
    .prepare(`SELECT * FROM payments WHERE booking_id = ? ORDER BY created_at DESC`)
    .all(booking.id);

  const messages = db
    .prepare(
      `SELECT m.*, u.name as sender_name
       FROM messages m
       JOIN users u ON u.id = m.sender_id
       WHERE m.booking_id = ?
       ORDER BY m.created_at ASC`
    )
    .all(booking.id);

  const reviews = db
    .prepare(`SELECT * FROM reviews WHERE booking_id = ? ORDER BY created_at DESC`)
    .all(booking.id);

  const complaints = db
    .prepare(`SELECT * FROM complaints WHERE booking_id = ? ORDER BY created_at DESC`)
    .all(booking.id);

  const customer = db
    .prepare(`SELECT id, name FROM users WHERE id = ?`)
    .get(booking.customer_id);

  const partner = booking.partner_id
    ? db
        .prepare(
          `SELECT id, business_name, service_area, experience_years, team_size, rating_avg, rating_count, verification_status
           FROM partners WHERE id = ?`
        )
        .get(booking.partner_id)
    : null;

  let pricingBreakdown: Record<string, any> | null = null;
  let customerPricing: Record<string, any> | null = null;
  let partnerPayout: Record<string, any> | null = null;

  if (booking.category_slug === 'home-services') {
    const pb = db
      .prepare(`SELECT * FROM pricing_breakdowns WHERE booking_id = ?`)
      .get(booking.id) as Record<string, any> | undefined;
    if (pb) {
      if (role === 'ADMIN') {
        pricingBreakdown = pb;
      } else if (role === 'PARTNER') {
        partnerPayout = { payoutPaise: pb.worker_payout_paise };
      } else {
        customerPricing = {
          servicePricePaise: pb.display_price_paise,
          offerDiscountPaise: pb.discount_paise,
          payablePaise: pb.payable_paise,
          discountLabel: 'Offer discount',
          ingredientPassthroughPaise: pb.ingredient_passthrough_paise,
        };
      }
    }
  }

  const isEventUnconfirmed =
    booking.category_slug === 'events' &&
    (Number(booking.paid_paise) < Number(booking.advance_required_paise) ||
      !booking.partner_id ||
      ['AWAITING_ADVANCE', 'REQUEST_SUBMITTED'].includes(booking.status));

  return {
    ...booking,
    confirmed_booking_id: isEventUnconfirmed ? null : booking.booking_code,
    address: JSON.parse(booking.address_json || '{}'),
    details: JSON.parse(booking.details_json || '{}'),
    customer,
    partner,
    items,
    quotations,
    payments,
    messages,
    reviews,
    complaints,
    ...(customerPricing ? { customerPricing } : {}),
    ...(partnerPayout ? { partnerPayout } : {}),
    ...(role === 'ADMIN' && pricingBreakdown ? { pricingBreakdown } : {}),
  };
}

const createBookingSchema = z.object({
  categorySlug: z.string().trim().min(1),
  serviceSlug: z.string().trim().min(1),
  quantity: z.number().int().min(1).max(500).optional().default(1),
  scheduledDate: z.string().trim().min(4),
  scheduledTime: z.string().trim().min(2),
  address: z
    .object({
      label: z.string().trim().optional(),
      line1: z.string().trim().min(3, 'Address line is required'),
      area: z.string().trim().optional(),
      city: z.string().trim().default('Hyderabad'),
      pincode: z.string().trim().optional(),
    })
    .optional()
    .default({ line1: 'Madhapur, Hyderabad', city: 'Hyderabad' }),
  details: z.record(z.string(), z.unknown()).optional().default({}),
  items: z
    .array(
      z.object({
        itemType: z.string().trim().default('SERVICE'),
        name: z.string().trim().min(1),
        quantity: z.number().int().min(1).default(1),
      })
    )
    .optional()
    .default([]),
});

// Create Booking (Server-side price calculation only — ignores client-sent prices -> Test 20)
bookingsRouter.post('/bookings', requireAuth, (req: Request, res: Response) => {
  const parsed = createBookingSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Invalid booking input' });
    return;
  }

  const db = getDb();
  const { categorySlug, serviceSlug, quantity, scheduledDate, scheduledTime, address, details, items } =
    parsed.data;

  const service = db
    .prepare(`SELECT * FROM services WHERE category_slug = ? AND slug = ?`)
    .get(categorySlug, serviceSlug) as Record<string, any> | undefined;

  if (!service) {
    res.status(404).json({ error: 'Selected service was not found.' });
    return;
  }

  if (service.is_free_enquiry) {
    res.status(400).json({
      error: 'Home Construction uses the free enquiry flow with no booking payment.',
    });
    return;
  }

  const bookingId = crypto.randomUUID();
  const bookingCode = generateBookingCode();
  const initialStatus: BookingStatus =
    categorySlug === 'events' ? 'AWAITING_ADVANCE' : 'REQUEST_SUBMITTED';
  const terms = defaultCancellationTerms(categorySlug);

  // Server-authoritative calculation (never trusts client-sent prices)
  let unitPricePaise = Number(service.base_price_paise || 0);
  let totalPaise = unitPricePaise * quantity;
  let advanceRequiredPaise =
    categorySlug === 'events' ? Math.round((totalPaise * 30) / 100) : totalPaise;
  let paymentMode =
    service.online_payment_only || categorySlug === 'events' ? 'ONLINE_ONLY' : 'ONLINE_OR_CASH';
  let homePricingOrder: ReturnType<typeof computeHomeServiceOrder> | null = null;

  if (categorySlug === 'home-services') {
    homePricingOrder = computeHomeServiceOrder({
      serviceSlug,
      serviceName: service.name,
      basePricePaise: unitPricePaise,
      quantity,
      details,
    });
    totalPaise = homePricingOrder.pricing.payablePaise;
    advanceRequiredPaise = totalPaise;
    if (homePricingOrder.onlineOnly || service.online_payment_only) {
      paymentMode = 'ONLINE_ONLY';
    }
  }

  db.prepare(
    `INSERT INTO bookings (
      id, booking_code, customer_id, category_slug, service_slug, title, status, price_status,
      payment_mode, payment_status, scheduled_date, scheduled_time, address_json, details_json,
      total_paise, advance_required_paise, paid_paise, balance_paise, cancellation_terms
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 'ESTIMATED', ?, 'PENDING', ?, ?, ?, ?, ?, ?, 0, ?, ?)`
  ).run(
    bookingId,
    bookingCode,
    req.user!.id,
    categorySlug,
    serviceSlug,
    service.name,
    initialStatus,
    paymentMode,
    scheduledDate,
    scheduledTime,
    JSON.stringify(address),
    JSON.stringify({ ...details, quantity, rejected_partner_ids: [] }),
    totalPaise,
    advanceRequiredPaise,
    totalPaise,
    terms
  );

  if (homePricingOrder) {
    const p = homePricingOrder.pricing;
    db.prepare(
      `INSERT INTO pricing_breakdowns (
        id, booking_id, worker_price_paise, platform_percent, fixed_addon_paise,
        display_price_paise, discount_paise, payable_paise, worker_payout_paise,
        platform_revenue_paise, ingredient_passthrough_paise
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      crypto.randomUUID(),
      bookingId,
      p.workerPricePaise,
      p.platformPercent,
      p.fixedAddonPaise,
      p.displayPricePaise,
      p.discountPaise,
      p.payablePaise,
      p.workerPayoutPaise,
      p.platformRevenuePaise,
      p.ingredientPassthroughPaise
    );

    const insertItem = db.prepare(
      `INSERT INTO booking_items (id, booking_id, item_type, name, quantity, unit_price_paise, total_paise)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    );
    for (const ci of homePricingOrder.customerItems) {
      insertItem.run(
        crypto.randomUUID(),
        bookingId,
        ci.itemType,
        ci.name,
        ci.quantity,
        ci.unitPricePaise,
        ci.totalPaise
      );
    }
  } else if (items.length > 0) {
    const insertItem = db.prepare(
      `INSERT INTO booking_items (id, booking_id, item_type, name, quantity, unit_price_paise, total_paise)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    );
    for (const item of items) {
      insertItem.run(
        crypto.randomUUID(),
        bookingId,
        item.itemType,
        item.name,
        item.quantity,
        unitPricePaise,
        unitPricePaise * item.quantity
      );
    }
  } else {
    db.prepare(
      `INSERT INTO booking_items (id, booking_id, item_type, name, quantity, unit_price_paise, total_paise)
       VALUES (?, ?, 'SERVICE', ?, ?, ?, ?)`
    ).run(crypto.randomUUID(), bookingId, service.name, quantity, unitPricePaise, totalPaise);
  }

  notificationAdapter.notifyUser({
    userId: req.user!.id,
    title: 'Booking Request Created',
    body: `Your request for ${service.name} (${bookingCode}) has been submitted.`,
    link: `/bookings/${bookingId}`,
    smsTarget: req.user!.mobile ?? undefined,
    emailTarget: req.user!.email ?? undefined,
  });

  const created = db.prepare(`SELECT * FROM bookings WHERE id = ?`).get(bookingId) as Record<
    string,
    any
  >;
  res.status(201).json({ booking: buildBookingDetail(created, req.user!.role) });
});

// List Bookings (Role & Ownership scoped)
bookingsRouter.get('/bookings', requireAuth, (req: Request, res: Response) => {
  const db = getDb();
  const user = req.user!;

  let rows: Array<Record<string, any>> = [];
  if (user.role === 'ADMIN') {
    rows = db.prepare(`SELECT * FROM bookings ORDER BY created_at DESC`).all() as Array<
      Record<string, any>
    >;
  } else if (user.role === 'PARTNER') {
    if (!user.partner_id) {
      res.json({ bookings: [] });
      return;
    }
    const partner = db
      .prepare(`SELECT categories_json, verification_status FROM partners WHERE id = ?`)
      .get(user.partner_id) as { categories_json: string; verification_status: string } | undefined;

    const cats = JSON.parse(partner?.categories_json || '[]') as string[];
    const allPartnerRows = db
      .prepare(
        `SELECT * FROM bookings
         WHERE partner_id = ? OR (partner_id IS NULL AND status IN ('REQUEST_SUBMITTED', 'AWAITING_ADVANCE'))
         ORDER BY created_at DESC`
      )
      .all(user.partner_id) as Array<Record<string, any>>;

    rows = allPartnerRows.filter((b) => {
      if (b.partner_id === user.partner_id) return true;
      const details = JSON.parse(b.details_json || '{}');
      const rejected: string[] = Array.isArray(details.rejected_partner_ids)
        ? details.rejected_partner_ids
        : [];
      if (rejected.includes(user.partner_id!)) return false;
      return cats.length === 0 || cats.includes(b.category_slug);
    });
  } else {
    rows = db
      .prepare(`SELECT * FROM bookings WHERE customer_id = ? ORDER BY created_at DESC`)
      .all(user.id) as Array<Record<string, any>>;
  }

  const enriched = rows.map((b) => ({
    ...b,
    confirmed_booking_id:
      b.category_slug === 'events' &&
      (Number(b.paid_paise) < Number(b.advance_required_paise) ||
        !b.partner_id ||
        ['AWAITING_ADVANCE', 'REQUEST_SUBMITTED'].includes(b.status))
        ? null
        : b.booking_code,
  }));

  res.json({ bookings: enriched });
});

// Get Single Booking Detail
bookingsRouter.get('/bookings/:id', requireAuth, (req: Request, res: Response) => {
  const access = getBookingAccess(String(req.params.id), req);
  if (access.status === 404) {
    res.status(404).json({ error: 'Booking not found.' });
    return;
  }
  if (access.status === 403 || !access.booking) {
    res.status(403).json({ error: 'Access denied for this booking.' });
    return;
  }
  res.json({ booking: buildBookingDetail(access.booking, req.user!.role) });
});

// Partner Accepts Request (Test 13: Unverified Partner blocked with 403)
bookingsRouter.post(
  '/bookings/:id/accept',
  requireRole('PARTNER'),
  (req: Request, res: Response) => {
    const db = getDb();
    const partner = db
      .prepare(`SELECT id, business_name, verification_status FROM partners WHERE user_id = ?`)
      .get(req.user!.id) as
      | { id: string; business_name: string; verification_status: string }
      | undefined;

    if (!partner || partner.verification_status !== 'VERIFIED') {
      res.status(403).json({
        error: 'Only verified SERVA partners can accept jobs. Your verification is pending admin approval.',
      });
      return;
    }

    const booking = db
      .prepare(`SELECT * FROM bookings WHERE id = ?`)
      .get(String(req.params.id)) as Record<string, any> | undefined;

    if (!booking) {
      res.status(404).json({ error: 'Booking not found.' });
      return;
    }

    if (booking.partner_id && booking.partner_id !== partner.id) {
      res.status(409).json({ error: 'This booking has already been accepted by another partner.' });
      return;
    }

    // Events: if advance already paid, accepting confirms the booking; otherwise remains awaiting advance or assigned
    let nextStatus: BookingStatus = 'PROVIDER_ASSIGNED';
    if (booking.category_slug === 'events') {
      nextStatus = booking.paid_paise >= booking.advance_required_paise && booking.advance_required_paise > 0
        ? 'CONFIRMED'
        : 'AWAITING_ADVANCE';
    } else if (booking.category_slug === 'home-services' && booking.payment_status === 'PAID') {
      nextStatus = 'CONFIRMED';
    }

    db.prepare(
      `UPDATE bookings SET partner_id = ?, status = ?, updated_at = datetime('now') WHERE id = ?`
    ).run(partner.id, nextStatus, booking.id);

    notificationAdapter.notifyUser({
      userId: booking.customer_id,
      title: 'Partner Assigned',
      body: `${partner.business_name} accepted your booking ${booking.booking_code}.`,
      link: `/bookings/${booking.id}`,
    });

    const updated = db.prepare(`SELECT * FROM bookings WHERE id = ?`).get(booking.id) as Record<
      string,
      any
    >;
    res.json({ booking: buildBookingDetail(updated, req.user!.role) });
  }
);

// Partner Rejects Request -> Re-offers to next eligible partner
bookingsRouter.post(
  '/bookings/:id/reject',
  requireRole('PARTNER'),
  (req: Request, res: Response) => {
    const db = getDb();
    const partnerId = req.user!.partner_id;
    if (!partnerId) {
      res.status(403).json({ error: 'Partner profile missing.' });
      return;
    }

    const booking = db
      .prepare(`SELECT * FROM bookings WHERE id = ?`)
      .get(String(req.params.id)) as Record<string, any> | undefined;

    if (!booking) {
      res.status(404).json({ error: 'Booking not found.' });
      return;
    }

    const details = JSON.parse(booking.details_json || '{}');
    const rejected: string[] = Array.isArray(details.rejected_partner_ids)
      ? details.rejected_partner_ids
      : [];
    if (!rejected.includes(partnerId)) rejected.push(partnerId);
    details.rejected_partner_ids = rejected;

    db.prepare(
      `UPDATE bookings
       SET partner_id = NULL, status = 'REQUEST_SUBMITTED', details_json = ?, updated_at = datetime('now')
       WHERE id = ?`
    ).run(JSON.stringify(details), booking.id);

    notificationAdapter.notifyUser({
      userId: booking.customer_id,
      title: 'Re-matching Your Request',
      body: `We are offering booking ${booking.booking_code} to the next available verified partner.`,
      link: `/bookings/${booking.id}`,
    });

    const updated = db.prepare(`SELECT * FROM bookings WHERE id = ?`).get(booking.id) as Record<
      string,
      any
    >;
    res.json({ booking: buildBookingDetail(updated, req.user!.role) });
  }
);

const quoteSchema = z.object({
  notes: z.string().trim().max(500).optional(),
  isRevised: z.boolean().optional().default(false),
  lines: z
    .array(
      z.object({
        line_type: z.string().trim().min(1),
        label: z.string().trim().min(1),
        quantity: z.number().int().min(1),
        unit_price_paise: z.number().int().min(0),
      })
    )
    .min(1, 'Quotation needs at least one line item'),
});

// Partner Submits Initial or Revised Quotation (Test 9, Test 14, Test 15)
bookingsRouter.post(
  '/bookings/:id/quotations',
  requireRole('PARTNER'),
  (req: Request, res: Response) => {
    const parsed = quoteSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Invalid quotation' });
      return;
    }

    const db = getDb();
    const booking = db
      .prepare(`SELECT * FROM bookings WHERE id = ?`)
      .get(String(req.params.id)) as Record<string, any> | undefined;

    if (!booking) {
      res.status(404).json({ error: 'Booking not found.' });
      return;
    }
    if (booking.partner_id !== req.user!.partner_id) {
      res.status(403).json({ error: 'You are not assigned to this booking.' });
      return;
    }

    // Hard Rule 2 / Test 9: Moving rejects any quotation line of type vehicle
    if (
      booking.category_slug === 'moving' &&
      parsed.data.lines.some((l) => l.line_type.toLowerCase() === 'vehicle')
    ) {
      res.status(400).json({
        error: 'SERVA Moving & Shifting does not provide vehicles or allow vehicle charges.',
      });
      return;
    }

    const latestVersionRow = db
      .prepare(`SELECT COALESCE(MAX(version), 0) as v FROM quotations WHERE booking_id = ?`)
      .get(booking.id) as { v: number };
    const nextVersion = latestVersionRow.v + 1;

    // Supersede any old pending quotations
    db.prepare(
      `UPDATE quotations SET status = 'SUPERSEDED' WHERE booking_id = ? AND status = 'PENDING_APPROVAL'`
    ).run(booking.id);

    const totalPaise = parsed.data.lines.reduce(
      (sum, line) => sum + line.quantity * line.unit_price_paise,
      0
    );

    const quoteId = crypto.randomUUID();
    const isRevised = parsed.data.isRevised || nextVersion > 1 ? 1 : 0;

    db.prepare(
      `INSERT INTO quotations (id, booking_id, partner_id, version, status, is_revised, total_paise, notes)
       VALUES (?, ?, ?, ?, 'PENDING_APPROVAL', ?, ?, ?)`
    ).run(quoteId, booking.id, req.user!.partner_id, nextVersion, isRevised, totalPaise, parsed.data.notes ?? null);

    const insertLine = db.prepare(
      `INSERT INTO quotation_lines (id, quotation_id, line_type, label, quantity, unit_price_paise, amount_paise)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    );
    for (const line of parsed.data.lines) {
      insertLine.run(
        crypto.randomUUID(),
        quoteId,
        line.line_type,
        line.label,
        line.quantity,
        line.unit_price_paise,
        line.quantity * line.unit_price_paise
      );
    }

    const nextAdvance =
      booking.category_slug === 'events' ? Math.round((totalPaise * 30) / 100) : totalPaise;
    const balancePaise = Math.max(0, totalPaise - Number(booking.paid_paise || 0));

    db.prepare(
      `UPDATE bookings
       SET status = 'QUOTATION_PENDING_APPROVAL',
           price_status = 'ESTIMATED',
           total_paise = ?,
           advance_required_paise = ?,
           balance_paise = ?,
           updated_at = datetime('now')
       WHERE id = ?`
    ).run(totalPaise, nextAdvance, balancePaise, booking.id);

    notificationAdapter.notifyUser({
      userId: booking.customer_id,
      title: isRevised ? 'Revised Quotation Requires Approval' : 'Quotation Ready for Approval',
      body: `Please review and approve quotation v${nextVersion} for ${booking.booking_code}.`,
      link: `/bookings/${booking.id}`,
    });

    const updated = db.prepare(`SELECT * FROM bookings WHERE id = ?`).get(booking.id) as Record<
      string,
      any
    >;
    res.status(201).json({ booking: buildBookingDetail(updated, req.user!.role) });
  }
);

// Customer Approves Quotation -> Price becomes CONFIRMED (Test 14 & Test 15)
bookingsRouter.post(
  '/bookings/:id/quotations/:qid/approve',
  requireRole('CUSTOMER', 'ADMIN'),
  (req: Request, res: Response) => {
    const access = getBookingAccess(String(req.params.id), req);
    if (access.status !== 200 || !access.booking) {
      res.status(access.status).json({ error: 'Cannot access booking.' });
      return;
    }

    const db = getDb();
    const quote = db
      .prepare(`SELECT * FROM quotations WHERE id = ? AND booking_id = ?`)
      .get(String(req.params.qid), access.booking.id) as Record<string, any> | undefined;

    if (!quote || quote.status !== 'PENDING_APPROVAL') {
      res.status(400).json({ error: 'Quotation is not pending approval.' });
      return;
    }

    db.prepare(`UPDATE quotations SET status = 'APPROVED' WHERE id = ?`).run(quote.id);

    let nextStatus: BookingStatus = 'CONFIRMED';
    if (
      access.booking.category_slug === 'events' &&
      Number(access.booking.paid_paise) < Number(access.booking.advance_required_paise)
    ) {
      nextStatus = 'AWAITING_ADVANCE';
    }

    const balancePaise = Math.max(0, Number(quote.total_paise) - Number(access.booking.paid_paise || 0));

    db.prepare(
      `UPDATE bookings
       SET status = ?, price_status = 'CONFIRMED', total_paise = ?, balance_paise = ?, updated_at = datetime('now')
       WHERE id = ?`
    ).run(nextStatus, quote.total_paise, balancePaise, access.booking.id);

    if (access.booking.partner_id) {
      const partnerUser = db
        .prepare(`SELECT user_id FROM partners WHERE id = ?`)
        .get(access.booking.partner_id) as { user_id: string } | undefined;
      if (partnerUser) {
        notificationAdapter.notifyUser({
          userId: partnerUser.user_id,
          title: 'Quotation Approved',
          body: `Customer approved quotation v${quote.version} for ${access.booking.booking_code}.`,
          link: `/partner/dashboard`,
        });
      }
    }

    const updated = db.prepare(`SELECT * FROM bookings WHERE id = ?`).get(access.booking.id) as Record<
      string,
      any
    >;
    res.json({ booking: buildBookingDetail(updated, req.user!.role) });
  }
);

const scopeChangeSchema = z.object({
  reason: z.string().trim().min(2),
  extraWorkers: z.number().int().min(0).max(50).optional().default(0),
  extraFloors: z.number().int().min(0).max(30).optional().default(0),
  additionalAmountPaise: z.number().int().min(0).optional().default(0),
  updatedDetails: z.record(z.string(), z.unknown()).optional(),
});

// Scope Change -> Automatically creates Revised Quotation requiring customer approval (Test 15)
bookingsRouter.patch('/bookings/:id/scope', requireAuth, (req: Request, res: Response) => {
  const access = getBookingAccess(String(req.params.id), req);
  if (access.status !== 200 || !access.booking) {
    res.status(access.status).json({ error: 'Cannot access booking.' });
    return;
  }
  const parsed = scopeChangeSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid scope update.' });
    return;
  }

  const db = getDb();
  const booking = access.booking;
  const currentDetails = JSON.parse(booking.details_json || '{}');
  const mergedDetails = {
    ...currentDetails,
    ...(parsed.data.updatedDetails || {}),
    last_scope_change: parsed.data.reason,
  };

  const latestVersionRow = db
    .prepare(`SELECT COALESCE(MAX(version), 0) as v FROM quotations WHERE booking_id = ?`)
    .get(booking.id) as { v: number };
  const nextVersion = latestVersionRow.v + 1;

  db.prepare(
    `UPDATE quotations SET status = 'SUPERSEDED' WHERE booking_id = ? AND status = 'PENDING_APPROVAL'`
  ).run(booking.id);

  const surchargePaise =
    parsed.data.additionalAmountPaise ||
    parsed.data.extraWorkers * 50000 + parsed.data.extraFloors * 25000;
  const newTotalPaise = Number(booking.total_paise) + surchargePaise;

  const quoteId = crypto.randomUUID();
  db.prepare(
    `INSERT INTO quotations (id, booking_id, partner_id, version, status, is_revised, total_paise, notes)
     VALUES (?, ?, ?, ?, 'PENDING_APPROVAL', 1, ?, ?)`
  ).run(quoteId, booking.id, booking.partner_id, nextVersion, newTotalPaise, `Scope revision: ${parsed.data.reason}`);

  db.prepare(
    `INSERT INTO quotation_lines (id, quotation_id, line_type, label, quantity, unit_price_paise, amount_paise)
     VALUES (?, ?, 'BASE', 'Original Scope', 1, ?, ?)`
  ).run(crypto.randomUUID(), quoteId, booking.total_paise, booking.total_paise);

  db.prepare(
    `INSERT INTO quotation_lines (id, quotation_id, line_type, label, quantity, unit_price_paise, amount_paise)
     VALUES (?, ?, 'SCOPE_REVISION', ?, 1, ?, ?)`
  ).run(crypto.randomUUID(), quoteId, `Scope Change (${parsed.data.reason})`, surchargePaise, surchargePaise);

  const balancePaise = Math.max(0, newTotalPaise - Number(booking.paid_paise || 0));

  db.prepare(
    `UPDATE bookings
     SET status = 'QUOTATION_PENDING_APPROVAL',
         price_status = 'ESTIMATED',
         details_json = ?,
         total_paise = ?,
         balance_paise = ?,
         updated_at = datetime('now')
     WHERE id = ?`
  ).run(JSON.stringify(mergedDetails), newTotalPaise, balancePaise, booking.id);

  notificationAdapter.notifyUser({
    userId: booking.customer_id,
    title: 'Scope Updated — Revised Quote Pending',
    body: `Scope changed (${parsed.data.reason}). Approve the revised quote before work continues.`,
    link: `/bookings/${booking.id}`,
  });

  const updated = db.prepare(`SELECT * FROM bookings WHERE id = ?`).get(booking.id) as Record<
    string,
    any
  >;
  res.json({ booking: buildBookingDetail(updated, req.user!.role) });
});

const statusSchema = z.object({
  status: z.string().trim().min(2),
  completionPhotos: z.array(z.string()).optional(),
  note: z.string().trim().optional(),
});

// Status Progression (Partner or Customer confirmation)
bookingsRouter.post('/bookings/:id/status', requireAuth, (req: Request, res: Response) => {
  const access = getBookingAccess(String(req.params.id), req);
  if (access.status !== 200 || !access.booking) {
    res.status(access.status).json({ error: 'Cannot access booking.' });
    return;
  }

  const parsed = statusSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid status transition payload.' });
    return;
  }

  const db = getDb();
  const booking = access.booking;
  const target = parsed.data.status as BookingStatus;
  const user = req.user!;

  // Block work start/completion if any revised quotation awaits customer approval (Test 15)
  const pendingRevised = db
    .prepare(
      `SELECT id FROM quotations WHERE booking_id = ? AND status = 'PENDING_APPROVAL' AND is_revised = 1`
    )
    .get(booking.id);

  if (
    pendingRevised &&
    [
      'IN_PROGRESS',
      'WORK_STARTED',
      'PACKING_IN_PROGRESS',
      'LOADING_IN_PROGRESS',
      'WORK_COMPLETED',
    ].includes(target)
  ) {
    res.status(409).json({
      error: 'Cannot start or complete work while a revised quotation is pending customer approval.',
    });
    return;
  }

  // Events advance lock
  if (
    booking.category_slug === 'events' &&
    ['CONFIRMED', 'ON_THE_WAY', 'IN_PROGRESS', 'WORK_COMPLETED'].includes(target) &&
    Number(booking.paid_paise) < Number(booking.advance_required_paise)
  ) {
    res.status(409).json({
      error: 'Events booking cannot proceed until the required advance payment is completed.',
    });
    return;
  }

  if (user.role === 'CUSTOMER') {
    const isMovingDepartConfirm =
      booking.category_slug === 'moving' &&
      target === 'VEHICLE_DEPARTED' &&
      ['LOADING_IN_PROGRESS', 'PACKING_IN_PROGRESS', 'ARRIVED'].includes(booking.status);

    if (isMovingDepartConfirm) {
      db.prepare(`UPDATE bookings SET status = 'VEHICLE_DEPARTED', updated_at = datetime('now') WHERE id = ?`).run(
        booking.id
      );
      if (booking.partner_id) {
        const pUser = db
          .prepare(`SELECT user_id FROM partners WHERE id = ?`)
          .get(booking.partner_id) as { user_id: string } | undefined;
        if (pUser) {
          notificationAdapter.notifyUser({
            userId: pUser.user_id,
            title: 'Vehicle Departed (Customer Confirmed)',
            body: `Customer confirmed vehicle departure for moving booking ${booking.booking_code}.`,
            link: `/partner/dashboard`,
          });
        }
      }
      const updated = db.prepare(`SELECT * FROM bookings WHERE id = ?`).get(booking.id) as Record<
        string,
        any
      >;
      res.json({ booking: buildBookingDetail(updated, user.role) });
      return;
    }

    if (target === 'COMPLETED' && booking.status === 'WORK_COMPLETED') {
      const nextStatus: BookingStatus =
        booking.payment_status === 'PAID' ? 'PAID' : 'COMPLETED';
      db.prepare(`UPDATE bookings SET status = ?, updated_at = datetime('now') WHERE id = ?`).run(
        nextStatus,
        booking.id
      );
      if (booking.partner_id) {
        const pUser = db
          .prepare(`SELECT user_id FROM partners WHERE id = ?`)
          .get(booking.partner_id) as { user_id: string } | undefined;
        if (pUser) {
          notificationAdapter.notifyUser({
            userId: pUser.user_id,
            title: 'Work Confirmed by Customer',
            body: `Booking ${booking.booking_code} was marked Completed by customer.`,
            link: `/partner/dashboard`,
          });
        }
      }
      const updated = db.prepare(`SELECT * FROM bookings WHERE id = ?`).get(booking.id) as Record<
        string,
        any
      >;
      res.json({ booking: buildBookingDetail(updated, user.role) });
      return;
    }
    res.status(403).json({
      error: 'Customers can only confirm Vehicle Departed (for Moving) or Work Completed -> Completed.',
    });
    return;
  }

  // Partner transitions
  if (user.role === 'PARTNER') {
    if (!canPartnerTransition(booking.status as BookingStatus, target)) {
      res.status(400).json({
        error: `Cannot transition booking from ${booking.status} to ${target}.`,
      });
      return;
    }

    const details = JSON.parse(booking.details_json || '{}');
    if (parsed.data.completionPhotos && parsed.data.completionPhotos.length > 0) {
      details.completion_photos = [
        ...(Array.isArray(details.completion_photos) ? details.completion_photos : []),
        ...parsed.data.completionPhotos,
      ];
    }
    if (parsed.data.note) {
      details.last_partner_note = parsed.data.note;
    }

    db.prepare(
      `UPDATE bookings SET status = ?, details_json = ?, updated_at = datetime('now') WHERE id = ?`
    ).run(target, JSON.stringify(details), booking.id);

    notificationAdapter.notifyUser({
      userId: booking.customer_id,
      title: `Booking Update: ${target.replace(/_/g, ' ')}`,
      body: `Your booking ${booking.booking_code} is now ${target.replace(/_/g, ' ').toLowerCase()}.`,
      link: `/bookings/${booking.id}`,
    });

    const updated = db.prepare(`SELECT * FROM bookings WHERE id = ?`).get(booking.id) as Record<
      string,
      any
    >;
    res.json({ booking: buildBookingDetail(updated, user.role) });
    return;
  }

  // Admin override
  db.prepare(`UPDATE bookings SET status = ?, updated_at = datetime('now') WHERE id = ?`).run(
    target,
    booking.id
  );
  const updated = db.prepare(`SELECT * FROM bookings WHERE id = ?`).get(booking.id) as Record<
    string,
    any
  >;
  res.json({ booking: buildBookingDetail(updated, user.role) });
});

const paySchema = z.object({
  method: z.enum(['UPI', 'CARD', 'NETBANKING', 'WALLET', 'CASH']),
  milestoneLabel: z.enum(['FULL', 'ADVANCE', 'MILESTONE', 'FINAL']).optional().default('FULL'),
});

// Pay for Booking (Server determines exact amount due — ignores client amount -> Test 20)
bookingsRouter.post('/bookings/:id/pay', requireAuth, (req: Request, res: Response) => {
  const access = getBookingAccess(String(req.params.id), req);
  if (access.status !== 200 || !access.booking) {
    res.status(access.status).json({ error: 'Cannot access booking.' });
    return;
  }

  const parsed = paySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid payment method.' });
    return;
  }

  const booking = access.booking;
  const db = getDb();

  if (
    (booking.payment_mode === 'ONLINE_ONLY' || ['home-cooking', 'wall-painting'].includes(booking.service_slug)) &&
    parsed.data.method === 'CASH'
  ) {
    res.status(400).json({
      error: 'This service accepts online payment only. Cash and cash on delivery are not allowed.',
    });
    return;
  }

  let amountPaise = Number(booking.balance_paise);
  if (parsed.data.milestoneLabel === 'ADVANCE') {
    amountPaise = Math.max(
      0,
      Number(booking.advance_required_paise) - Number(booking.paid_paise)
    );
  } else if (parsed.data.milestoneLabel === 'MILESTONE') {
    // 40% pre-event milestone or remaining balance if smaller
    const fortyPercent = Math.round((Number(booking.total_paise) * 40) / 100);
    amountPaise = Math.min(Number(booking.balance_paise), fortyPercent);
  }

  if (amountPaise <= 0) {
    res.status(400).json({ error: 'No balance due for this payment milestone.' });
    return;
  }

  try {
    const receipt = executeBookingPayment({
      bookingId: booking.id,
      userId: req.user!.id,
      amountPaise,
      method: parsed.data.method,
      milestoneLabel: parsed.data.milestoneLabel,
    });

    const newPaid = Number(booking.paid_paise) + amountPaise;
    const newBalance = Math.max(0, Number(booking.total_paise) - newPaid);
    const nextPaymentStatus =
      newBalance === 0
        ? 'PAID'
        : parsed.data.milestoneLabel === 'ADVANCE'
        ? 'ADVANCE_PAID'
        : 'PARTIAL';

    let nextStatus = booking.status as BookingStatus;
    let nextPriceStatus = booking.price_status;

    if (booking.category_slug === 'home-services' && newBalance === 0) {
      nextStatus = booking.partner_id ? 'CONFIRMED' : 'REQUEST_SUBMITTED';
      nextPriceStatus = 'CONFIRMED';
    } else if (booking.category_slug === 'events') {
      if (newPaid >= Number(booking.advance_required_paise) && booking.partner_id) {
        nextStatus = 'CONFIRMED';
        nextPriceStatus = 'CONFIRMED';
      } else if (newPaid >= Number(booking.advance_required_paise)) {
        nextStatus = 'REQUEST_SUBMITTED'; // Waiting for vendor acceptance
      }
    } else if (newBalance === 0 && booking.status === 'COMPLETED') {
      nextStatus = 'PAID';
    }

    db.prepare(
      `UPDATE bookings
       SET paid_paise = ?, balance_paise = ?, payment_status = ?, status = ?, price_status = ?, updated_at = datetime('now')
       WHERE id = ?`
    ).run(newPaid, newBalance, nextPaymentStatus, nextStatus, nextPriceStatus, booking.id);

    notificationAdapter.notifyUser({
      userId: req.user!.id,
      title: 'Payment Receipt Issued',
      body: `Payment of ₹${Math.round(amountPaise / 100).toLocaleString('en-IN')} succeeded (${receipt.receiptNumber}).`,
      link: `/bookings/${booking.id}`,
    });

    const updated = db.prepare(`SELECT * FROM bookings WHERE id = ?`).get(booking.id) as Record<
      string,
      any
    >;
    res.json({
      receipt,
      booking: buildBookingDetail(updated, req.user!.role),
    });
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Payment failed.' });
  }
});

// Cancel Booking
bookingsRouter.post('/bookings/:id/cancel', requireAuth, (req: Request, res: Response) => {
  const access = getBookingAccess(String(req.params.id), req);
  if (access.status !== 200 || !access.booking) {
    res.status(access.status).json({ error: 'Cannot access booking.' });
    return;
  }
  const booking = access.booking;
  if (!canCancel(booking.status as BookingStatus)) {
    res.status(400).json({ error: 'Completed or already cancelled bookings cannot be cancelled.' });
    return;
  }

  const db = getDb();
  const reason = typeof req.body?.reason === 'string' ? req.body.reason.trim() : 'Customer requested cancellation';
  const details = JSON.parse(booking.details_json || '{}');
  details.cancellation_reason = reason;

  // Refund any online-paid amount back to user wallet as mock refund
  const paidPaise = Number(booking.paid_paise || 0);
  if (paidPaise > 0) {
    const wallet = db
      .prepare(`SELECT id FROM wallets WHERE user_id = ?`)
      .get(booking.customer_id) as { id: string } | undefined;
    if (wallet) {
      db.prepare(`UPDATE wallets SET balance_paise = balance_paise + ?, updated_at = datetime('now') WHERE id = ?`).run(
        paidPaise,
        wallet.id
      );
      db.prepare(
        `INSERT INTO wallet_transactions (id, wallet_id, type, amount_paise, description, reference_id)
         VALUES (?, ?, 'REFUND', ?, ?, ?)`
      ).run(crypto.randomUUID(), wallet.id, paidPaise, `Refund for cancelled booking ${booking.booking_code}`, booking.id);
    }
  }

  db.prepare(
    `UPDATE bookings
     SET status = 'CANCELLED',
         payment_status = CASE WHEN paid_paise > 0 THEN 'REFUNDED' ELSE payment_status END,
         details_json = ?,
         updated_at = datetime('now')
     WHERE id = ?`
  ).run(JSON.stringify(details), booking.id);

  notificationAdapter.notifyUser({
    userId: booking.customer_id,
    title: 'Booking Cancelled',
    body: `Booking ${booking.booking_code} has been cancelled.${paidPaise > 0 ? ' Refund credited to your SERVA Wallet.' : ''}`,
    link: `/bookings/${booking.id}`,
  });

  const updated = db.prepare(`SELECT * FROM bookings WHERE id = ?`).get(booking.id) as Record<
    string,
    any
  >;
  res.json({ booking: buildBookingDetail(updated, req.user!.role) });
});

// In-App Messages
bookingsRouter.post('/bookings/:id/messages', requireAuth, (req: Request, res: Response) => {
  const access = getBookingAccess(String(req.params.id), req);
  if (access.status !== 200 || !access.booking) {
    res.status(access.status).json({ error: 'Cannot access booking.' });
    return;
  }
  const body = typeof req.body?.body === 'string' ? req.body.body.trim() : '';
  if (!body) {
    res.status(400).json({ error: 'Message cannot be empty.' });
    return;
  }

  const db = getDb();
  const id = crypto.randomUUID();
  db.prepare(
    `INSERT INTO messages (id, booking_id, sender_id, sender_role, body) VALUES (?, ?, ?, ?, ?)`
  ).run(id, access.booking.id, req.user!.id, req.user!.role, body);

  const updated = db.prepare(`SELECT * FROM bookings WHERE id = ?`).get(access.booking.id) as Record<
    string,
    any
  >;
  res.status(201).json({ booking: buildBookingDetail(updated, req.user!.role) });
});

// Ratings & Reviews
const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().max(500).optional(),
});

bookingsRouter.post('/bookings/:id/reviews', requireAuth, (req: Request, res: Response) => {
  const access = getBookingAccess(String(req.params.id), req);
  if (access.status !== 200 || !access.booking) {
    res.status(access.status).json({ error: 'Cannot access booking.' });
    return;
  }
  const booking = access.booking;
  if (!['COMPLETED', 'PAID'].includes(booking.status)) {
    res.status(400).json({ error: 'You can review a booking only after completion.' });
    return;
  }
  if (!booking.partner_id) {
    res.status(400).json({ error: 'No partner assigned to review.' });
    return;
  }
  const parsed = reviewSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Select a rating between 1 and 5 stars.' });
    return;
  }

  const db = getDb();
  db.prepare(
    `INSERT INTO reviews (id, booking_id, customer_id, partner_id, rating, comment)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run(
    crypto.randomUUID(),
    booking.id,
    req.user!.id,
    booking.partner_id,
    parsed.data.rating,
    parsed.data.comment ?? null
  );

  // Recalculate partner rating average
  const stats = db
    .prepare(`SELECT AVG(rating) as avg_r, COUNT(*) as cnt FROM reviews WHERE partner_id = ?`)
    .get(booking.partner_id) as { avg_r: number; cnt: number };

  db.prepare(`UPDATE partners SET rating_avg = ?, rating_count = ? WHERE id = ?`).run(
    Number((stats.avg_r || parsed.data.rating).toFixed(2)),
    stats.cnt,
    booking.partner_id
  );

  const updated = db.prepare(`SELECT * FROM bookings WHERE id = ?`).get(booking.id) as Record<
    string,
    any
  >;
  res.status(201).json({ booking: buildBookingDetail(updated, req.user!.role) });
});

// Complaints (with optional photos)
const complaintSchema = z.object({
  category: z.string().trim().min(2),
  description: z.string().trim().min(5),
  photos: z.array(z.string()).optional().default([]),
});

bookingsRouter.post('/bookings/:id/complaints', requireAuth, (req: Request, res: Response) => {
  const access = getBookingAccess(String(req.params.id), req);
  if (access.status !== 200 || !access.booking) {
    res.status(access.status).json({ error: 'Cannot access booking.' });
    return;
  }
  const parsed = complaintSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Please describe the issue (min 5 characters).' });
    return;
  }

  const db = getDb();
  db.prepare(
    `INSERT INTO complaints (id, booking_id, user_id, category, description, photos_json)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run(
    crypto.randomUUID(),
    access.booking.id,
    req.user!.id,
    parsed.data.category,
    parsed.data.description,
    JSON.stringify(parsed.data.photos)
  );

  db.prepare(`UPDATE bookings SET status = 'ISSUE_RAISED', updated_at = datetime('now') WHERE id = ?`).run(
    access.booking.id
  );

  const updated = db.prepare(`SELECT * FROM bookings WHERE id = ?`).get(access.booking.id) as Record<
    string,
    any
  >;
  res.status(201).json({ booking: buildBookingDetail(updated, req.user!.role) });
});
