import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { notificationAdapter } from '../adapters/notifications.ts';
import { getDb } from '../db/client.ts';
import { requireRole, SESSION_COOKIE_NAME } from '../middleware/auth.ts';

export const partnerAdminRouter = Router();

const PARTNER_CATEGORIES = ['home-services', 'contractors', 'events', 'agriculture', 'moving'];

const partnerRegisterSchema = z.object({
  name: z.string().trim().min(2).optional(),
  email: z.string().trim().email().optional().or(z.literal('')),
  mobile: z.string().trim().regex(/^[6-9]\d{9}$/).optional().or(z.literal('')),
  password: z.string().min(6).optional(),
  partnerType: z.string().trim().min(2),
  businessName: z.string().trim().min(2),
  isIndividual: z.boolean().default(true),
  categories: z.array(z.string()).min(1, 'Select at least one service category'),
  services: z.array(z.string()).optional().default([]),
  serviceArea: z.string().trim().min(2).default('Hyderabad, TG'),
  experienceYears: z.number().int().min(0).max(60).default(1),
  teamSize: z.number().int().min(1).max(200).default(1),
  identityDocRef: z.string().trim().min(4, 'Identity document reference is required'),
  cancellationTerms: z.string().trim().min(4).default('Free cancellation up to 24 hours before service.'),
  payoutAccount: z.object({
    mode: z.enum(['UPI', 'BANK']).default('UPI'),
    upiId: z.string().trim().optional(),
    accountHolder: z.string().trim().optional(),
    accountNumber: z.string().trim().optional(),
    ifsc: z.string().trim().optional(),
  }),
  bio: z.string().trim().max(600).optional(),
  agreedToTerms: z.boolean().refine((v) => v === true, 'You must accept partner terms'),
  portfolioSampleUrl: z.string().trim().optional(),
  portfolioSampleTitle: z.string().trim().optional(),
  availabilityDates: z.array(z.string()).optional().default([]),
});

// Partner Onboarding & Verification Submission (Spec §11)
partnerAdminRouter.post('/partner/register', (req: Request, res: Response) => {
  const parsed = partnerRegisterSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Invalid partner details.' });
    return;
  }

  const d = parsed.data;
  const db = getDb();
  let userId = req.user?.id;
  let newSessionCookieId: string | null = null;

  if (!userId) {
    if (!d.name || (!d.email && !d.mobile) || !d.password) {
      res.status(400).json({
        error: 'Provide your name, mobile or email, and a password (min 6 characters) to create your partner account.',
      });
      return;
    }

    const email = d.email ? d.email.toLowerCase() : null;
    const mobile = d.mobile || null;
    const dup = db
      .prepare(`SELECT id FROM users WHERE (email IS NOT NULL AND email = ?) OR (mobile IS NOT NULL AND mobile = ?)`)
      .get(email ?? '__none__', mobile ?? '__none__');
    if (dup) {
      res.status(409).json({
        error: 'An account already exists with this email or mobile. Sign in first or use another contact.',
      });
      return;
    }

    userId = crypto.randomUUID();
    const hash = bcrypt.hashSync(d.password, 10);
    db.prepare(
      `INSERT INTO users (id, name, email, mobile, password_hash, role, auth_provider, mobile_verified, language, default_city)
       VALUES (?, ?, ?, ?, ?, 'PARTNER', 'LOCAL', 1, 'en', 'Hyderabad, TG')`
    ).run(userId, d.name, email, mobile, hash);

    db.prepare(`INSERT INTO wallets (id, user_id, balance_paise) VALUES (?, ?, 0)`).run(
      crypto.randomUUID(),
      userId
    );

    const sessionId = crypto.randomBytes(24).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    db.prepare(`INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)`).run(
      sessionId,
      userId,
      expiresAt
    );
    newSessionCookieId = sessionId;
  } else if (req.user!.role === 'CUSTOMER') {
    db.prepare(`UPDATE users SET role = 'PARTNER' WHERE id = ?`).run(userId);
  }

  const validCats = d.categories.filter((c) => PARTNER_CATEGORIES.includes(c));
  if (validCats.length === 0) {
    res.status(400).json({ error: 'Select at least one valid SERVA category.' });
    return;
  }

  const existingPartner = db
    .prepare(`SELECT id FROM partners WHERE user_id = ?`)
    .get(userId) as { id: string } | undefined;

  const partnerId = existingPartner?.id ?? crypto.randomUUID();
  if (existingPartner) {
    db.prepare(
      `UPDATE partners
       SET business_name = ?, is_individual = ?, categories_json = ?, services_json = ?,
           service_area = ?, experience_years = ?, team_size = ?, identity_doc_ref = ?,
           payout_account_json = ?, cancellation_terms = ?, bio = ?, verification_status = 'SUBMITTED'
       WHERE id = ?`
    ).run(
      d.businessName,
      d.isIndividual ? 1 : 0,
      JSON.stringify(validCats),
      JSON.stringify(d.services.length ? d.services : [d.partnerType]),
      d.serviceArea,
      d.experienceYears,
      d.teamSize,
      d.identityDocRef,
      JSON.stringify(d.payoutAccount),
      d.cancellationTerms,
      d.bio ?? `${d.partnerType} serving ${d.serviceArea}`,
      partnerId
    );
  } else {
    db.prepare(
      `INSERT INTO partners (
         id, user_id, business_name, is_individual, categories_json, services_json,
         service_area, experience_years, team_size, identity_doc_ref, payout_account_json,
         cancellation_terms, verification_status, bio
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'SUBMITTED', ?)`
    ).run(
      partnerId,
      userId,
      d.businessName,
      d.isIndividual ? 1 : 0,
      JSON.stringify(validCats),
      JSON.stringify(d.services.length ? d.services : [d.partnerType]),
      d.serviceArea,
      d.experienceYears,
      d.teamSize,
      d.identityDocRef,
      JSON.stringify(d.payoutAccount),
      d.cancellationTerms,
      d.bio ?? `${d.partnerType} serving ${d.serviceArea}`
    );
  }

  if (d.portfolioSampleUrl) {
    db.prepare(
      `INSERT INTO portfolio_items (id, partner_id, category_slug, sub_category, style_tag, title, description, media_type, media_url, moderation_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'APPROVED')`
    ).run(
      crypto.randomUUID(),
      partnerId,
      validCats[0],
      d.services[0] || null,
      d.partnerType,
      d.portfolioSampleTitle || `${d.businessName} Showcase`,
      'Uploaded during partner onboarding.',
      d.portfolioSampleUrl.endsWith('.mp4') ? 'VIDEO' : 'IMAGE',
      d.portfolioSampleUrl
    );
  }

  for (const dt of d.availabilityDates) {
    db.prepare(
      `INSERT INTO vendor_availability (id, partner_id, date, is_available)
       VALUES (?, ?, ?, 1)
       ON CONFLICT(partner_id, date) DO UPDATE SET is_available = 1`
    ).run(crypto.randomUUID(), partnerId, dt);
  }

  notificationAdapter.notifyUser({
    userId,
    title: 'Partner Application Submitted',
    body: `Your partner profile (${d.businessName}) is submitted for admin verification.`,
    link: '/partner/dashboard',
  });

  if (newSessionCookieId) {
    res.cookie(SESSION_COOKIE_NAME, newSessionCookieId, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }

  const partner = db.prepare(`SELECT * FROM partners WHERE id = ?`).get(partnerId);
  res.status(201).json({ partner });
});

// Partner Self-Service Overview (strictly scoped to own partner_id)
partnerAdminRouter.get(
  '/partner/overview',
  requireRole('PARTNER', 'ADMIN'),
  (req: Request, res: Response) => {
    const db = getDb();
    const partnerId = req.user!.partner_id;
    if (!partnerId) {
      res.status(404).json({ error: 'Partner profile not found.' });
      return;
    }

    const partner = db
      .prepare(`SELECT * FROM partners WHERE id = ?`)
      .get(partnerId) as Record<string, any> | undefined;
    if (!partner) {
      res.status(404).json({ error: 'Partner profile missing.' });
      return;
    }

    // Partner sees ONLY own payout (never platform revenue / 7% / ₹100)
    const payoutRows = db
      .prepare(
        `SELECT b.id, b.booking_code, b.category_slug, b.service_slug, b.title, b.status,
                b.scheduled_date, b.payment_status,
                COALESCE(pb.worker_payout_paise, b.paid_paise, b.total_paise) as partner_payout_paise
         FROM bookings b
         LEFT JOIN pricing_breakdowns pb ON pb.booking_id = b.id
         WHERE b.partner_id = ?
         ORDER BY b.created_at DESC`
      )
      .all(partnerId) as Array<Record<string, any>>;

    const totalPayoutPaise = payoutRows.reduce(
      (sum, r) => sum + Number(r.partner_payout_paise || 0),
      0
    );

    const machineryRentalIncomePaise = payoutRows
      .filter((r) => ['agriculture', 'contractors'].includes(r.category_slug))
      .reduce((sum, r) => sum + Number(r.partner_payout_paise || 0), 0);

    const machines = db
      .prepare(`SELECT * FROM machines WHERE partner_id = ? ORDER BY machine_type ASC`)
      .all(partnerId);

    const portfolio = db
      .prepare(`SELECT * FROM portfolio_items WHERE partner_id = ? ORDER BY created_at DESC`)
      .all(partnerId);

    const availability = db
      .prepare(`SELECT * FROM vendor_availability WHERE partner_id = ? ORDER BY date ASC`)
      .all(partnerId);

    const customSetting = db
      .prepare(`SELECT value FROM admin_settings WHERE key = ?`)
      .get(`partner_rates_${partnerId}`) as { value: string } | undefined;

    res.json({
      partner: {
        ...partner,
        categories: JSON.parse(partner.categories_json || '[]'),
        services: JSON.parse(partner.services_json || '[]'),
      },
      totalPayoutPaise,
      machineryRentalIncomePaise,
      payoutRows,
      machines,
      portfolio,
      availability,
      customRates: customSetting ? JSON.parse(customSetting.value) : null,
    });
  }
);

// Partner Availability Toggle
const availSchema = z.object({
  date: z.string().trim().min(8),
  isAvailable: z.boolean(),
  slots: z.array(z.string()).optional().default(['09:00', '14:00', '18:00']),
});

partnerAdminRouter.put(
  '/partner/availability',
  requireRole('PARTNER', 'ADMIN'),
  (req: Request, res: Response) => {
    const parsed = availSchema.safeParse(req.body);
    if (!parsed.success || !req.user!.partner_id) {
      res.status(400).json({ error: 'Invalid availability payload.' });
      return;
    }
    const db = getDb();
    db.prepare(
      `INSERT INTO vendor_availability (id, partner_id, date, is_available, slots_json)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(partner_id, date) DO UPDATE SET is_available = excluded.is_available, slots_json = excluded.slots_json`
    ).run(
      crypto.randomUUID(),
      req.user!.partner_id,
      parsed.data.date,
      parsed.data.isAvailable ? 1 : 0,
      JSON.stringify(parsed.data.slots)
    );
    const availability = db
      .prepare(`SELECT * FROM vendor_availability WHERE partner_id = ? ORDER BY date ASC`)
      .all(req.user!.partner_id);
    res.json({ availability });
  }
);

// Partner Portfolio Manager
const portfolioSchema = z.object({
  categorySlug: z.string().trim().min(2),
  subCategory: z.string().trim().optional(),
  styleTag: z.string().trim().optional(),
  title: z.string().trim().min(3),
  description: z.string().trim().max(400).optional(),
  mediaType: z.enum(['IMAGE', 'VIDEO']).default('IMAGE'),
  mediaUrl: z.string().trim().min(3),
  pricePaise: z.number().int().min(0).optional(),
});

partnerAdminRouter.post(
  '/partner/portfolio',
  requireRole('PARTNER', 'ADMIN'),
  (req: Request, res: Response) => {
    const parsed = portfolioSchema.safeParse(req.body);
    if (!parsed.success || !req.user!.partner_id) {
      res.status(400).json({ error: parsed.success ? 'Missing partner profile.' : 'Invalid portfolio item.' });
      return;
    }
    const db = getDb();
    const id = crypto.randomUUID();
    db.prepare(
      `INSERT INTO portfolio_items (
        id, partner_id, category_slug, sub_category, style_tag, title, description, media_type, media_url, thumbnail_url, price_paise, moderation_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'APPROVED')`
    ).run(
      id,
      req.user!.partner_id,
      parsed.data.categorySlug,
      parsed.data.subCategory ?? null,
      parsed.data.styleTag ?? null,
      parsed.data.title,
      parsed.data.description ?? null,
      parsed.data.mediaType,
      parsed.data.mediaUrl,
      parsed.data.mediaUrl,
      parsed.data.pricePaise ?? null
    );
    const item = db.prepare(`SELECT * FROM portfolio_items WHERE id = ?`).get(id);
    res.status(201).json({ item });
  }
);

partnerAdminRouter.delete(
  '/partner/portfolio/:id',
  requireRole('PARTNER', 'ADMIN'),
  (req: Request, res: Response) => {
    if (!req.user!.partner_id) {
      res.status(403).json({ error: 'Missing partner profile.' });
      return;
    }
    const db = getDb();
    const row = db
      .prepare(`SELECT partner_id FROM portfolio_items WHERE id = ?`)
      .get(String(req.params.id)) as { partner_id: string } | undefined;
    if (!row) {
      res.status(404).json({ error: 'Portfolio item not found.' });
      return;
    }
    if (row.partner_id !== req.user!.partner_id && req.user!.role !== 'ADMIN') {
      res.status(403).json({ error: 'Cannot delete another partner portfolio item.' });
      return;
    }
    db.prepare(`DELETE FROM portfolio_items WHERE id = ?`).run(String(req.params.id));
    res.json({ deleted: true });
  }
);

// Machinery Owner Registration & Fleet Update
const machineSchema = z.object({
  category: z.enum(['AGRICULTURE', 'CONTRACTORS']),
  machineType: z.string().trim().min(2),
  makeModel: z.string().trim().min(2),
  capacity: z.string().trim().optional(),
  serviceArea: z.string().trim().min(2).default('Hyderabad & Telangana'),
  hourlyRatePaise: z.number().int().min(0).default(0),
  dailyRatePaise: z.number().int().min(0).default(0),
  perAcreRatePaise: z.number().int().min(0).default(0),
  operatorIncluded: z.boolean().default(true),
  imageUrl: z.string().trim().optional(),
});

partnerAdminRouter.post(
  '/partner/machines',
  requireRole('PARTNER', 'ADMIN'),
  (req: Request, res: Response) => {
    const parsed = machineSchema.safeParse(req.body);
    if (!parsed.success || !req.user!.partner_id) {
      res.status(400).json({ error: 'Invalid machinery details.' });
      return;
    }
    const d = parsed.data;
    const db = getDb();
    const id = crypto.randomUUID();
    db.prepare(
      `INSERT INTO machines (
        id, partner_id, category, machine_type, make_model, capacity, service_area,
        hourly_rate_paise, daily_rate_paise, per_acre_rate_paise, operator_included, image_url, is_available
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`
    ).run(
      id,
      req.user!.partner_id,
      d.category,
      d.machineType,
      d.makeModel,
      d.capacity ?? null,
      d.serviceArea,
      d.hourlyRatePaise,
      d.dailyRatePaise,
      d.perAcreRatePaise,
      d.operatorIncluded ? 1 : 0,
      d.imageUrl ?? '/src/assets/images/hero_agriculture_1794821795928.jpg'
    );
    const machine = db.prepare(`SELECT * FROM machines WHERE id = ?`).get(id);
    res.status(201).json({ machine });
  }
);

partnerAdminRouter.patch(
  '/partner/machines/:id',
  requireRole('PARTNER', 'ADMIN'),
  (req: Request, res: Response) => {
    if (!req.user!.partner_id) {
      res.status(403).json({ error: 'Missing partner profile.' });
      return;
    }
    const db = getDb();
    const row = db
      .prepare(`SELECT * FROM machines WHERE id = ?`)
      .get(String(req.params.id)) as Record<string, any> | undefined;
    if (!row) {
      res.status(404).json({ error: 'Machine not found.' });
      return;
    }
    if (row.partner_id !== req.user!.partner_id && req.user!.role !== 'ADMIN') {
      res.status(403).json({ error: 'Access denied.' });
      return;
    }
    const isAvailable = req.body?.isAvailable !== undefined ? (req.body.isAvailable ? 1 : 0) : row.is_available;
    db.prepare(`UPDATE machines SET is_available = ? WHERE id = ?`).run(isAvailable, row.id);
    const updated = db.prepare(`SELECT * FROM machines WHERE id = ?`).get(row.id);
    res.json({ machine: updated });
  }
);

// Partner Custom Price & Moving Box Configuration
partnerAdminRouter.put(
  '/partner/rates',
  requireRole('PARTNER', 'ADMIN'),
  (req: Request, res: Response) => {
    if (!req.user!.partner_id) {
      res.status(403).json({ error: 'Missing partner profile.' });
      return;
    }
    const db = getDb();
    const key = `partner_rates_${req.user!.partner_id}`;
    db.prepare(
      `INSERT INTO admin_settings (key, value, updated_at)
       VALUES (?, ?, datetime('now'))
       ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')`
    ).run(key, JSON.stringify(req.body || {}));
    res.json({ saved: true, customRates: req.body });
  }
);

/* ======================== ADMIN ENDPOINTS ======================== */

partnerAdminRouter.get('/admin/overview', requireRole('ADMIN'), (_req: Request, res: Response) => {
  const db = getDb();

  const counts = {
    users: (db.prepare(`SELECT COUNT(*) as c FROM users`).get() as { c: number }).c,
    partnersPending: (
      db
        .prepare(
          `SELECT COUNT(*) as c FROM partners WHERE verification_status IN ('SUBMITTED', 'UNDER_REVIEW')`
        )
        .get() as { c: number }
    ).c,
    partnersVerified: (
      db.prepare(`SELECT COUNT(*) as c FROM partners WHERE verification_status = 'VERIFIED'`).get() as {
        c: number;
      }
    ).c,
    bookings: (db.prepare(`SELECT COUNT(*) as c FROM bookings`).get() as { c: number }).c,
  };

  const partners = db
    .prepare(
      `SELECT p.*, u.name as owner_name, u.email as owner_email, u.mobile as owner_mobile
       FROM partners p
       JOIN users u ON u.id = p.user_id
       ORDER BY CASE WHEN p.verification_status IN ('SUBMITTED', 'UNDER_REVIEW') THEN 0 ELSE 1 END, p.created_at DESC`
    )
    .all();

  const bookings = db
    .prepare(
      `SELECT b.*, u.name as customer_name, p.business_name as partner_name
       FROM bookings b
       JOIN users u ON u.id = b.customer_id
       LEFT JOIN partners p ON p.id = b.partner_id
       ORDER BY b.created_at DESC`
    )
    .all();

  // Settlement Ledger with complete Home Services pricing split (Admin ONLY)
  const settlements = db
    .prepare(
      `SELECT b.id as booking_id, b.booking_code, b.title, b.status, b.payment_status, b.created_at,
              u.name as customer_name, p.business_name as partner_name,
              pb.worker_price_paise, pb.platform_percent, pb.fixed_addon_paise,
              pb.display_price_paise, pb.discount_paise, pb.payable_paise,
              pb.worker_payout_paise, pb.platform_revenue_paise, pb.ingredient_passthrough_paise
       FROM pricing_breakdowns pb
       JOIN bookings b ON b.id = pb.booking_id
       JOIN users u ON u.id = b.customer_id
       LEFT JOIN partners p ON p.id = b.partner_id
       ORDER BY b.created_at DESC`
    )
    .all() as Array<Record<string, any>>;

  const settlementTotals = settlements.reduce(
    (acc, s) => ({
      totalCustomerPayablePaise: acc.totalCustomerPayablePaise + Number(s.payable_paise || 0),
      totalWorkerPayoutPaise: acc.totalWorkerPayoutPaise + Number(s.worker_payout_paise || 0),
      totalPlatformRevenuePaise: acc.totalPlatformRevenuePaise + Number(s.platform_revenue_paise || 0),
      totalDiscountsPaise: acc.totalDiscountsPaise + Number(s.discount_paise || 0),
    }),
    {
      totalCustomerPayablePaise: 0,
      totalWorkerPayoutPaise: 0,
      totalPlatformRevenuePaise: 0,
      totalDiscountsPaise: 0,
    }
  );

  const settingsRows = db
    .prepare(`SELECT key, value FROM admin_settings WHERE key NOT LIKE 'partner_rates_%'`)
    .all() as Array<{ key: string; value: string }>;
  const settings: Record<string, string> = {};
  for (const r of settingsRows) settings[r.key] = r.value;

  const portfolioItems = db
    .prepare(
      `SELECT pi.*, p.business_name as partner_name
       FROM portfolio_items pi
       JOIN partners p ON p.id = pi.partner_id
       ORDER BY pi.created_at DESC`
    )
    .all();

  const complaints = db
    .prepare(
      `SELECT c.*, b.booking_code, b.title as booking_title, u.name as reporter_name
       FROM complaints c
       JOIN bookings b ON b.id = c.booking_id
       JOIN users u ON u.id = c.user_id
       ORDER BY c.created_at DESC`
    )
    .all();

  res.json({
    counts,
    partners,
    bookings,
    settlements,
    settlementTotals,
    settings,
    portfolioItems,
    complaints,
  });
});

// Admin Partner Verification Transition (Test 13)
const verifySchema = z.object({
  status: z.enum(['SUBMITTED', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED']),
  note: z.string().trim().max(300).optional(),
});

partnerAdminRouter.patch(
  '/admin/partners/:id/verify',
  requireRole('ADMIN'),
  (req: Request, res: Response) => {
    const parsed = verifySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid verification status.' });
      return;
    }

    const db = getDb();
    const partner = db
      .prepare(`SELECT * FROM partners WHERE id = ?`)
      .get(String(req.params.id)) as Record<string, any> | undefined;
    if (!partner) {
      res.status(404).json({ error: 'Partner not found.' });
      return;
    }

    db.prepare(`UPDATE partners SET verification_status = ? WHERE id = ?`).run(
      parsed.data.status,
      partner.id
    );

    notificationAdapter.notifyUser({
      userId: partner.user_id,
      title: `Verification Status: ${parsed.data.status}`,
      body:
        parsed.data.status === 'VERIFIED'
          ? 'Your partner profile is now VERIFIED. You can accept jobs across your categories.'
          : `Your verification status was updated to ${parsed.data.status}.${parsed.data.note ? ` Note: ${parsed.data.note}` : ''}`,
      link: '/partner/dashboard',
    });

    const updated = db.prepare(`SELECT * FROM partners WHERE id = ?`).get(partner.id);
    res.json({ partner: updated });
  }
);

// Admin Settings Editor
const settingsSchema = z.object({
  home_service_percent: z.number().min(0).max(50).optional(),
  home_service_fixed_addon_paise: z.number().int().min(0).max(100000).optional(),
  cooking_markup_ingredients: z.boolean().optional(),
  auto_confirm_hours: z.number().int().min(1).max(240).optional(),
  events_advance_percent: z.number().int().min(10).max(100).optional(),
});

partnerAdminRouter.put('/admin/settings', requireRole('ADMIN'), (req: Request, res: Response) => {
  const parsed = settingsSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid settings input.' });
    return;
  }

  const db = getDb();
  const upsert = db.prepare(
    `INSERT INTO admin_settings (key, value, updated_at)
     VALUES (?, ?, datetime('now'))
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')`
  );

  const d = parsed.data;
  if (d.home_service_percent !== undefined) upsert.run('home_service_percent', String(d.home_service_percent));
  if (d.home_service_fixed_addon_paise !== undefined) {
    upsert.run('home_service_fixed_addon_paise', String(d.home_service_fixed_addon_paise));
  }
  if (d.cooking_markup_ingredients !== undefined) {
    upsert.run('cooking_markup_ingredients', d.cooking_markup_ingredients ? '1' : '0');
  }
  if (d.auto_confirm_hours !== undefined) upsert.run('auto_confirm_hours', String(d.auto_confirm_hours));
  if (d.events_advance_percent !== undefined) {
    upsert.run('events_advance_percent', String(d.events_advance_percent));
  }

  const rows = db
    .prepare(`SELECT key, value FROM admin_settings WHERE key NOT LIKE 'partner_rates_%'`)
    .all() as Array<{ key: string; value: string }>;
  const settings: Record<string, string> = {};
  for (const r of rows) settings[r.key] = r.value;
  res.json({ settings });
});

// Admin Portfolio Moderation
partnerAdminRouter.patch('/admin/portfolio/:id', requireRole('ADMIN'), (req: Request, res: Response) => {
  const status = req.body?.moderationStatus;
  if (!['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
    res.status(400).json({ error: 'Invalid moderation status.' });
    return;
  }
  const db = getDb();
  const row = db.prepare(`SELECT id FROM portfolio_items WHERE id = ?`).get(String(req.params.id));
  if (!row) {
    res.status(404).json({ error: 'Portfolio item not found.' });
    return;
  }
  db.prepare(`UPDATE portfolio_items SET moderation_status = ? WHERE id = ?`).run(
    status,
    String(req.params.id)
  );
  const item = db.prepare(`SELECT * FROM portfolio_items WHERE id = ?`).get(String(req.params.id));
  res.json({ item });
});

// Admin Complaint Resolution
partnerAdminRouter.patch('/admin/complaints/:id', requireRole('ADMIN'), (req: Request, res: Response) => {
  const status = req.body?.status;
  const note = typeof req.body?.resolutionNote === 'string' ? req.body.resolutionNote.trim() : null;
  if (!['OPEN', 'IN_REVIEW', 'RESOLVED', 'CLOSED'].includes(status)) {
    res.status(400).json({ error: 'Invalid complaint status.' });
    return;
  }
  const db = getDb();
  const row = db
    .prepare(`SELECT * FROM complaints WHERE id = ?`)
    .get(String(req.params.id)) as Record<string, any> | undefined;
  if (!row) {
    res.status(404).json({ error: 'Complaint not found.' });
    return;
  }

  db.prepare(`UPDATE complaints SET status = ?, resolution_note = ? WHERE id = ?`).run(
    status,
    note,
    row.id
  );

  notificationAdapter.notifyUser({
    userId: row.user_id,
    title: `Complaint Update: ${status}`,
    body: note ? `Support note: ${note}` : `Your complaint status is now ${status}.`,
    link: `/bookings/${row.booking_id}`,
  });

  const updated = db.prepare(`SELECT * FROM complaints WHERE id = ?`).get(row.id);
  res.json({ complaint: updated });
});
