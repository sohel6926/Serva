import crypto from 'crypto';
import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { notificationAdapter } from '../adapters/notifications.ts';
import { getDb } from '../db/client.ts';
import { requireAuth } from '../middleware/auth.ts';

export const accountSupportRouter = Router();

// Wallet: balance, transactions, digital receipts
accountSupportRouter.get('/wallet', requireAuth, (req: Request, res: Response) => {
  const db = getDb();
  let wallet = db
    .prepare(`SELECT * FROM wallets WHERE user_id = ?`)
    .get(req.user!.id) as Record<string, any> | undefined;

  if (!wallet) {
    const id = crypto.randomUUID();
    db.prepare(`INSERT INTO wallets (id, user_id, balance_paise) VALUES (?, ?, 0)`).run(id, req.user!.id);
    wallet = db.prepare(`SELECT * FROM wallets WHERE id = ?`).get(id) as Record<string, any>;
  }

  const transactions = db
    .prepare(`SELECT * FROM wallet_transactions WHERE wallet_id = ? ORDER BY created_at DESC LIMIT 50`)
    .all(wallet.id);

  const receipts = db
    .prepare(
      `SELECT pay.*, b.booking_code, b.title as booking_title, b.category_slug
       FROM payments pay
       JOIN bookings b ON b.id = pay.booking_id
       WHERE pay.user_id = ?
       ORDER BY pay.created_at DESC`
    )
    .all(req.user!.id);

  res.json({ wallet, transactions, receipts });
});

// Demo wallet top-up
accountSupportRouter.post('/wallet/topup', requireAuth, (req: Request, res: Response) => {
  const amountRupees = Number(req.body?.amountRupees || 0);
  if (!Number.isFinite(amountRupees) || amountRupees < 100 || amountRupees > 100000) {
    res.status(400).json({ error: 'Top-up amount must be between ₹100 and ₹1,00,000.' });
    return;
  }

  const db = getDb();
  const amountPaise = Math.round(amountRupees * 100);
  let wallet = db
    .prepare(`SELECT * FROM wallets WHERE user_id = ?`)
    .get(req.user!.id) as Record<string, any> | undefined;
  if (!wallet) {
    const id = crypto.randomUUID();
    db.prepare(`INSERT INTO wallets (id, user_id, balance_paise) VALUES (?, ?, 0)`).run(id, req.user!.id);
    wallet = db.prepare(`SELECT * FROM wallets WHERE id = ?`).get(id) as Record<string, any>;
  }

  db.prepare(`UPDATE wallets SET balance_paise = balance_paise + ?, updated_at = datetime('now') WHERE id = ?`).run(
    amountPaise,
    wallet.id
  );
  db.prepare(
    `INSERT INTO wallet_transactions (id, wallet_id, type, amount_paise, description, reference_id)
     VALUES (?, ?, 'CREDIT', ?, 'Demo Wallet Top-Up', ?)`
  ).run(crypto.randomUUID(), wallet.id, amountPaise, `TOPUP-${Date.now()}`);

  const updated = db.prepare(`SELECT * FROM wallets WHERE id = ?`).get(wallet.id);
  res.json({ wallet: updated });
});

// Offers list
accountSupportRouter.get('/offers', (_req: Request, res: Response) => {
  const db = getDb();
  const offers = db
    .prepare(`SELECT * FROM offers WHERE is_active = 1 ORDER BY id ASC`)
    .all();
  res.json({ offers });
});

// Saved Addresses & Farm Locations CRUD
accountSupportRouter.get('/profile/addresses', requireAuth, (req: Request, res: Response) => {
  const db = getDb();
  const addresses = db
    .prepare(`SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, id ASC`)
    .all(req.user!.id);
  res.json({ addresses });
});

const addressSchema = z.object({
  label: z.string().trim().min(2),
  kind: z.enum(['HOME', 'WORK', 'FARM', 'SITE', 'OTHER']).default('HOME'),
  line1: z.string().trim().min(3),
  area: z.string().trim().optional(),
  villageMandal: z.string().trim().optional(),
  city: z.string().trim().min(2),
  state: z.string().trim().default('Telangana'),
  pincode: z.string().trim().regex(/^\d{6}$/, 'Enter a valid 6-digit pincode'),
  isDefault: z.boolean().optional().default(false),
});

accountSupportRouter.post('/profile/addresses', requireAuth, (req: Request, res: Response) => {
  const parsed = addressSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Invalid address input.' });
    return;
  }
  const d = parsed.data;
  const db = getDb();
  if (d.isDefault) {
    db.prepare(`UPDATE addresses SET is_default = 0 WHERE user_id = ?`).run(req.user!.id);
  }
  const id = crypto.randomUUID();
  db.prepare(
    `INSERT INTO addresses (id, user_id, label, kind, line1, area, village_mandal, city, state, pincode, is_default)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    req.user!.id,
    d.label,
    d.kind,
    d.line1,
    d.area ?? null,
    d.villageMandal ?? null,
    d.city,
    d.state,
    d.pincode,
    d.isDefault ? 1 : 0
  );
  const address = db.prepare(`SELECT * FROM addresses WHERE id = ?`).get(id);
  res.status(201).json({ address });
});

accountSupportRouter.delete('/profile/addresses/:id', requireAuth, (req: Request, res: Response) => {
  const db = getDb();
  const row = db
    .prepare(`SELECT user_id FROM addresses WHERE id = ?`)
    .get(String(req.params.id)) as { user_id: string } | undefined;
  if (!row) {
    res.status(404).json({ error: 'Address not found.' });
    return;
  }
  if (row.user_id !== req.user!.id) {
    res.status(403).json({ error: 'Cannot delete another user address.' });
    return;
  }
  db.prepare(`DELETE FROM addresses WHERE id = ?`).run(String(req.params.id));
  res.json({ deleted: true });
});

// Support FAQs & Complaints / Missing & Damaged Item Tickets
const SUPPORT_FAQS = [
  {
    q: 'Does SERVA provide trucks or tempos for Moving and Shifting?',
    a: 'No. SERVA provides verified packing, loading, unloading, and shifting teams only. Customers arrange their transport vehicle independently, with zero vehicle charges on SERVA.',
  },
  {
    q: 'Why do Cooking and Wall Painting require online payment?',
    a: 'Cooking (where the chef purchases fresh ingredients) and Wall Painting / 3D Art are strictly online payment services to ensure upfront material readiness and transparent receipts.',
  },
  {
    q: 'When is my Events booking confirmed?',
    a: 'Under SERVA policy, No advance payment = No confirmed booking. An Event booking receives a confirmed booking ID only after the 30% advance succeeds and the vendor accepts.',
  },
  {
    q: 'Are Home Construction enquiries free?',
    a: 'Yes. Home Construction (residential and apartment) is a free promotion showcase—submitting a project enquiry sends your requirements to contractors with zero booking payment.',
  },
  {
    q: 'What is the difference between Estimated and Confirmed prices?',
    a: 'Initial requests display an Estimated price. After partner review or customer approval of a quotation, the price becomes Confirmed. Any scope change requires your approval on a revised quote.',
  },
];

accountSupportRouter.get('/support', requireAuth, (req: Request, res: Response) => {
  const db = getDb();
  const tickets = db
    .prepare(
      `SELECT c.*, b.booking_code, b.title as booking_title
       FROM complaints c
       JOIN bookings b ON b.id = c.booking_id
       WHERE c.user_id = ?
       ORDER BY c.created_at DESC`
    )
    .all(req.user!.id);

  const userBookings = db
    .prepare(`SELECT id, booking_code, title, status FROM bookings WHERE customer_id = ? ORDER BY created_at DESC LIMIT 25`)
    .all(req.user!.id);

  res.json({ faqs: SUPPORT_FAQS, tickets, userBookings });
});

accountSupportRouter.post('/support/ticket', requireAuth, (req: Request, res: Response) => {
  const bookingId = typeof req.body?.bookingId === 'string' ? req.body.bookingId.trim() : '';
  const category = typeof req.body?.category === 'string' ? req.body.category.trim() : 'General Support';
  const description = typeof req.body?.description === 'string' ? req.body.description.trim() : '';
  const callbackPhone = typeof req.body?.callbackPhone === 'string' ? req.body.callbackPhone.trim() : '';
  const photos = Array.isArray(req.body?.photos) ? req.body.photos : [];

  if (description.length < 5) {
    res.status(400).json({ error: 'Please describe your issue or request (at least 5 characters).' });
    return;
  }

  const db = getDb();
  if (bookingId) {
    const bk = db
      .prepare(`SELECT id, customer_id, booking_code FROM bookings WHERE id = ?`)
      .get(bookingId) as { id: string; customer_id: string; booking_code: string } | undefined;
    if (!bk || (bk.customer_id !== req.user!.id && req.user!.role !== 'ADMIN')) {
      res.status(404).json({ error: 'Selected booking was not found for your account.' });
      return;
    }

    const id = crypto.randomUUID();
    db.prepare(
      `INSERT INTO complaints (id, booking_id, user_id, category, description, photos_json)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(id, bk.id, req.user!.id, category, description, JSON.stringify(photos));

    notificationAdapter.notifyUser({
      userId: req.user!.id,
      title: `Support Ticket Filed (${bk.booking_code})`,
      body: `We received your ${category} report and will respond shortly.`,
      link: `/bookings/${bk.id}`,
    });

    const ticket = db.prepare(`SELECT * FROM complaints WHERE id = ?`).get(id);
    res.status(201).json({ ticket, mode: 'BOOKING_COMPLAINT' });
    return;
  }

  // General callback / support inquiry
  notificationAdapter.notifyUser({
    userId: req.user!.id,
    title: 'Support Callback Requested',
    body: `SERVA Support logged your ${category} request${callbackPhone ? ` (Callback: ${callbackPhone})` : ''}.`,
    link: '/support',
  });

  res.status(201).json({
    mode: 'CALLBACK',
    message: 'Your support request has been logged. Our Hyderabad support desk will reach out shortly.',
  });
});
