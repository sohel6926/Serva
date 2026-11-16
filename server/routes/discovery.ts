import { Router, type Request, type Response } from 'express';
import { getDb } from '../db/client.ts';

export const discoveryRouter = Router();

discoveryRouter.get('/home-data', (_req: Request, res: Response) => {
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

  const popularServices = db
    .prepare(
      `SELECT s.*, sc.name as category_name
       FROM services s
       JOIN service_categories sc ON sc.slug = s.category_slug
       WHERE s.slug IN ('electrician', 'home-cleaning', 'home-cooking', 'dj', 'tractor-rental', 'home-shifting')
       ORDER BY sc.sort_order ASC`
    )
    .all();

  const offers = db
    .prepare(`SELECT * FROM offers WHERE is_active = 1 ORDER BY id ASC`)
    .all();

  res.json({ categories, popularServices, offers });
});

discoveryRouter.get('/services', (req: Request, res: Response) => {
  const db = getDb();
  const category = typeof req.query.category === 'string' ? req.query.category.trim() : '';
  const subCategory = typeof req.query.subCategory === 'string' ? req.query.subCategory.trim() : '';
  const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';

  const conditions: string[] = [];
  const params: unknown[] = [];

  if (category) {
    conditions.push('s.category_slug = ?');
    params.push(category);
  }
  if (subCategory) {
    conditions.push('s.sub_category = ?');
    params.push(subCategory);
  }
  if (q) {
    conditions.push('(lower(s.name) LIKE ? OR lower(s.description) LIKE ? OR lower(s.slug) LIKE ? OR lower(sc.name) LIKE ?)');
    const like = `%${q.toLowerCase()}%`;
    params.push(like, like, like, like);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const services = db
    .prepare(
      `SELECT s.*, sc.name as category_name, sc.hero_image as category_hero
       FROM services s
       JOIN service_categories sc ON sc.slug = s.category_slug
       ${where}
       ORDER BY sc.sort_order ASC, s.id ASC`
    )
    .all(...params);

  res.json({ services });
});

discoveryRouter.get('/search', (req: Request, res: Response) => {
  const db = getDb();
  const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';

  if (!q) {
    const services = db
      .prepare(
        `SELECT s.*, sc.name as category_name
         FROM services s
         JOIN service_categories sc ON sc.slug = s.category_slug
         ORDER BY sc.sort_order ASC, s.id ASC LIMIT 18`
      )
      .all();
    res.json({ query: '', services, categories: [], partners: [] });
    return;
  }

  const like = `%${q.toLowerCase()}%`;
  const services = db
    .prepare(
      `SELECT s.*, sc.name as category_name
       FROM services s
       JOIN service_categories sc ON sc.slug = s.category_slug
       WHERE lower(s.name) LIKE ? OR lower(s.description) LIKE ? OR lower(s.slug) LIKE ? OR lower(COALESCE(s.sub_category, '')) LIKE ?
       ORDER BY sc.sort_order ASC, s.id ASC`
    )
    .all(like, like, like, like);

  const categories = db
    .prepare(
      `SELECT * FROM service_categories
       WHERE lower(name) LIKE ? OR lower(description) LIKE ? OR lower(tagline) LIKE ?
       ORDER BY sort_order ASC`
    )
    .all(like, like, like);

  const partners = db
    .prepare(
      `SELECT id, business_name, service_area, experience_years, rating_avg, rating_count, verification_status, services_json, bio
       FROM partners
       WHERE verification_status = 'VERIFIED'
         AND (lower(business_name) LIKE ? OR lower(services_json) LIKE ? OR lower(bio) LIKE ?)`
    )
    .all(like, like, like);

  res.json({ query: q, services, categories, partners });
});

discoveryRouter.get('/search/suggestions', (req: Request, res: Response) => {
  const db = getDb();
  const q = typeof req.query.q === 'string' ? req.query.q.trim().toLowerCase() : '';
  if (!q) {
    const defaults = [
      { label: 'Electrician & Switchboard Repair', category_slug: 'home-services', slug: 'electrician' },
      { label: 'DJ (Standalone Booking Service)', category_slug: 'events', slug: 'dj' },
      { label: 'Tractor & Land Leveller Rental', category_slug: 'agriculture', slug: 'tractor-rental' },
      { label: 'Home Shifting', category_slug: 'moving', slug: 'home-shifting' },
      { label: 'Interior Design & Modular Consultation', category_slug: 'contractors', slug: 'interior-design' },
    ];
    res.json({ suggestions: defaults });
    return;
  }

  const like = `%${q}%`;
  const rows = db
    .prepare(
      `SELECT s.name as label, s.category_slug, s.slug, sc.name as category_name
       FROM services s
       JOIN service_categories sc ON sc.slug = s.category_slug
       WHERE lower(s.name) LIKE ? OR lower(s.slug) LIKE ? OR lower(s.description) LIKE ?
       LIMIT 8`
    )
    .all(like, like, like);

  res.json({ suggestions: rows });
});

discoveryRouter.get('/portfolio', (req: Request, res: Response) => {
  const db = getDb();
  const category = typeof req.query.category === 'string' ? req.query.category.trim() : '';
  const subCategory = typeof req.query.subCategory === 'string' ? req.query.subCategory.trim() : '';
  const style = typeof req.query.style === 'string' ? req.query.style.trim() : '';

  const conditions = [`pi.moderation_status = 'APPROVED'`];
  const params: unknown[] = [];

  if (category) {
    conditions.push('pi.category_slug = ?');
    params.push(category);
  }
  if (subCategory) {
    conditions.push('pi.sub_category = ?');
    params.push(subCategory);
  }
  if (style && style !== 'All') {
    conditions.push('pi.style_tag = ?');
    params.push(style);
  }

  const items = db
    .prepare(
      `SELECT pi.*, p.business_name as partner_name, p.rating_avg, p.verification_status
       FROM portfolio_items pi
       JOIN partners p ON p.id = pi.partner_id
       WHERE ${conditions.join(' AND ')}
       ORDER BY pi.created_at DESC`
    )
    .all(...params);

  res.json({ items });
});
