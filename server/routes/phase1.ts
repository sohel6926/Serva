import { Router, type Request, type Response } from 'express';
import { getDb } from '../db/client.ts';
import { requireAuth, requireRole } from '../middleware/auth.ts';

export const phase1Router = Router();

phase1Router.get('/categories', (_req: Request, res: Response) => {
  const db = getDb();
  const categories = db
    .prepare(
      `SELECT sc.*, COUNT(s.id) as service_count
       FROM service_categories sc
       LEFT JOIN services s ON s.category_slug = sc.slug
       GROUP BY sc.id
       ORDER BY sc.sort_order ASC`
    )
    .all();
  res.json({ categories });
});

phase1Router.get('/notifications', requireAuth, (req: Request, res: Response) => {
  const db = getDb();
  const notifications = db
    .prepare(
      `SELECT id, title, body, link, is_read, created_at
       FROM notifications WHERE user_id = ?
       ORDER BY created_at DESC LIMIT 20`
    )
    .all(req.user!.id);
  res.json({ notifications });
});

phase1Router.post('/notifications/read-all', requireAuth, (req: Request, res: Response) => {
  const db = getDb();
  db.prepare(`UPDATE notifications SET is_read = 1 WHERE user_id = ?`).run(req.user!.id);
  res.json({ updated: true });
});

// Role & ownership-protected Partner Earnings route (Test 19)
phase1Router.get(
  '/partner/earnings',
  requireRole('PARTNER', 'ADMIN'),
  (req: Request, res: Response) => {
    const db = getDb();
    const requestedPartnerId = typeof req.query.partnerId === 'string' ? req.query.partnerId : null;

    if (req.user!.role === 'PARTNER') {
      if (!req.user!.partner_id) {
        res.status(403).json({ error: 'Partner profile not found.' });
        return;
      }
      if (requestedPartnerId && requestedPartnerId !== req.user!.partner_id) {
        res.status(403).json({ error: 'Access denied: cannot view another partner earnings.' });
        return;
      }
    }

    const targetPartnerId = requestedPartnerId ?? req.user!.partner_id;
    const partner = db
      .prepare(`SELECT id, business_name, verification_status FROM partners WHERE id = ?`)
      .get(targetPartnerId);

    const bookings = db
      .prepare(
        `SELECT b.id, b.booking_code, b.title, b.status, b.created_at,
                COALESCE(pb.worker_payout_paise, b.total_paise) as partner_payout_paise
         FROM bookings b
         LEFT JOIN pricing_breakdowns pb ON pb.booking_id = b.id
         WHERE b.partner_id = ?
         ORDER BY b.created_at DESC`
      )
      .all(targetPartnerId) as Array<{ partner_payout_paise: number }>;

    const totalPayoutPaise = bookings.reduce((sum, b) => sum + (b.partner_payout_paise || 0), 0);

    res.json({
      partner,
      totalPayoutPaise,
      bookings,
    });
  }
);

// Role-protected Admin overview route (Test 19)
phase1Router.get('/admin/overview', requireRole('ADMIN'), (_req: Request, res: Response) => {
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
  res.json({ counts });
});
