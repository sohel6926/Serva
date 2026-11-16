import { getDb } from './client.ts';

export function runMigrations(): void {
  const db = getDb();

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE,
      mobile TEXT UNIQUE,
      password_hash TEXT,
      role TEXT NOT NULL CHECK(role IN ('CUSTOMER', 'PARTNER', 'ADMIN')),
      auth_provider TEXT NOT NULL DEFAULT 'LOCAL',
      mobile_verified INTEGER NOT NULL DEFAULT 0,
      language TEXT NOT NULL DEFAULT 'en',
      default_city TEXT NOT NULL DEFAULT 'Hyderabad, TG',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS otp_codes (
      id TEXT PRIMARY KEY,
      target TEXT NOT NULL,
      code_hash TEXT NOT NULL,
      purpose TEXT NOT NULL DEFAULT 'LOGIN',
      attempts INTEGER NOT NULL DEFAULT 0,
      consumed INTEGER NOT NULL DEFAULT 0,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS auth_rate_limits (
      key TEXT PRIMARY KEY,
      attempts INTEGER NOT NULL DEFAULT 0,
      window_start TEXT NOT NULL,
      blocked_until TEXT
    );

    CREATE TABLE IF NOT EXISTS partners (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      business_name TEXT NOT NULL,
      is_individual INTEGER NOT NULL DEFAULT 1,
      categories_json TEXT NOT NULL DEFAULT '[]',
      services_json TEXT NOT NULL DEFAULT '[]',
      service_area TEXT NOT NULL DEFAULT 'Hyderabad, TG',
      experience_years INTEGER NOT NULL DEFAULT 1,
      team_size INTEGER NOT NULL DEFAULT 1,
      identity_doc_ref TEXT,
      payout_account_json TEXT DEFAULT '{}',
      cancellation_terms TEXT DEFAULT 'Standard 24-hour notice before scheduled time.',
      verification_status TEXT NOT NULL DEFAULT 'SUBMITTED' CHECK(verification_status IN ('SUBMITTED', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED')),
      rating_avg REAL NOT NULL DEFAULT 0,
      rating_count INTEGER NOT NULL DEFAULT 0,
      bio TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS service_categories (
      id TEXT PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      name_te TEXT,
      tagline TEXT NOT NULL,
      description TEXT NOT NULL,
      accent_color TEXT NOT NULL,
      hero_image TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS services (
      id TEXT PRIMARY KEY,
      category_slug TEXT NOT NULL REFERENCES service_categories(slug) ON DELETE CASCADE,
      slug TEXT NOT NULL,
      name TEXT NOT NULL,
      sub_category TEXT,
      description TEXT NOT NULL,
      base_price_paise INTEGER NOT NULL DEFAULT 0,
      unit_label TEXT NOT NULL DEFAULT 'per service',
      image_url TEXT,
      online_payment_only INTEGER NOT NULL DEFAULT 0,
      requires_quotation INTEGER NOT NULL DEFAULT 0,
      is_free_enquiry INTEGER NOT NULL DEFAULT 0,
      metadata_json TEXT NOT NULL DEFAULT '{}',
      UNIQUE(category_slug, slug)
    );

    CREATE TABLE IF NOT EXISTS sub_services (
      id TEXT PRIMARY KEY,
      service_id TEXT NOT NULL REFERENCES services(id) ON DELETE CASCADE,
      slug TEXT NOT NULL,
      name TEXT NOT NULL,
      base_price_paise INTEGER NOT NULL DEFAULT 0,
      unit_label TEXT NOT NULL DEFAULT 'unit',
      metadata_json TEXT NOT NULL DEFAULT '{}'
    );

    CREATE TABLE IF NOT EXISTS portfolio_items (
      id TEXT PRIMARY KEY,
      partner_id TEXT NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
      category_slug TEXT NOT NULL,
      sub_category TEXT,
      style_tag TEXT,
      title TEXT NOT NULL,
      description TEXT,
      media_type TEXT NOT NULL CHECK(media_type IN ('IMAGE', 'VIDEO')),
      media_url TEXT NOT NULL,
      thumbnail_url TEXT,
      price_paise INTEGER,
      moderation_status TEXT NOT NULL DEFAULT 'APPROVED' CHECK(moderation_status IN ('PENDING', 'APPROVED', 'REJECTED')),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      booking_code TEXT NOT NULL UNIQUE,
      customer_id TEXT NOT NULL REFERENCES users(id),
      partner_id TEXT REFERENCES partners(id),
      category_slug TEXT NOT NULL,
      service_slug TEXT NOT NULL,
      title TEXT NOT NULL,
      status TEXT NOT NULL,
      price_status TEXT NOT NULL DEFAULT 'ESTIMATED' CHECK(price_status IN ('ESTIMATED', 'CONFIRMED')),
      payment_mode TEXT NOT NULL DEFAULT 'ONLINE_ONLY',
      payment_status TEXT NOT NULL DEFAULT 'PENDING' CHECK(payment_status IN ('PENDING', 'ADVANCE_PAID', 'PARTIAL', 'PAID', 'REFUNDED', 'NOT_REQUIRED')),
      scheduled_date TEXT,
      scheduled_time TEXT,
      address_json TEXT NOT NULL DEFAULT '{}',
      details_json TEXT NOT NULL DEFAULT '{}',
      total_paise INTEGER NOT NULL DEFAULT 0,
      advance_required_paise INTEGER NOT NULL DEFAULT 0,
      paid_paise INTEGER NOT NULL DEFAULT 0,
      balance_paise INTEGER NOT NULL DEFAULT 0,
      cancellation_terms TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS booking_items (
      id TEXT PRIMARY KEY,
      booking_id TEXT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
      item_type TEXT NOT NULL,
      name TEXT NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      unit_price_paise INTEGER NOT NULL DEFAULT 0,
      total_paise INTEGER NOT NULL DEFAULT 0,
      metadata_json TEXT NOT NULL DEFAULT '{}'
    );

    CREATE TABLE IF NOT EXISTS quotations (
      id TEXT PRIMARY KEY,
      booking_id TEXT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
      partner_id TEXT REFERENCES partners(id),
      version INTEGER NOT NULL DEFAULT 1,
      status TEXT NOT NULL DEFAULT 'PENDING_APPROVAL' CHECK(status IN ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'SUPERSEDED')),
      is_revised INTEGER NOT NULL DEFAULT 0,
      total_paise INTEGER NOT NULL DEFAULT 0,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS quotation_lines (
      id TEXT PRIMARY KEY,
      quotation_id TEXT NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
      line_type TEXT NOT NULL,
      label TEXT NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      unit_price_paise INTEGER NOT NULL DEFAULT 0,
      amount_paise INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS pricing_breakdowns (
      id TEXT PRIMARY KEY,
      booking_id TEXT NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
      worker_price_paise INTEGER NOT NULL,
      platform_percent REAL NOT NULL,
      fixed_addon_paise INTEGER NOT NULL,
      display_price_paise INTEGER NOT NULL,
      discount_paise INTEGER NOT NULL,
      payable_paise INTEGER NOT NULL,
      worker_payout_paise INTEGER NOT NULL,
      platform_revenue_paise INTEGER NOT NULL,
      ingredient_passthrough_paise INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      booking_id TEXT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id),
      milestone_label TEXT NOT NULL DEFAULT 'FULL',
      method TEXT NOT NULL,
      provider TEXT NOT NULL DEFAULT 'MOCK',
      provider_ref TEXT,
      amount_paise INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'SUCCEEDED' CHECK(status IN ('PENDING', 'SUCCEEDED', 'FAILED', 'REFUNDED')),
      receipt_number TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS wallets (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      balance_paise INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS wallet_transactions (
      id TEXT PRIMARY KEY,
      wallet_id TEXT NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
      type TEXT NOT NULL CHECK(type IN ('CREDIT', 'DEBIT', 'REFUND', 'PAYOUT')),
      amount_paise INTEGER NOT NULL,
      description TEXT NOT NULL,
      reference_id TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS addresses (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      label TEXT NOT NULL,
      kind TEXT NOT NULL DEFAULT 'HOME' CHECK(kind IN ('HOME', 'WORK', 'FARM', 'SITE', 'OTHER')),
      line1 TEXT NOT NULL,
      area TEXT,
      village_mandal TEXT,
      city TEXT NOT NULL,
      state TEXT NOT NULL DEFAULT 'Telangana',
      pincode TEXT NOT NULL,
      lat REAL,
      lng REAL,
      is_default INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      booking_id TEXT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
      customer_id TEXT NOT NULL REFERENCES users(id),
      partner_id TEXT NOT NULL REFERENCES partners(id),
      rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
      comment TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS complaints (
      id TEXT PRIMARY KEY,
      booking_id TEXT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id),
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      photos_json TEXT NOT NULL DEFAULT '[]',
      status TEXT NOT NULL DEFAULT 'OPEN' CHECK(status IN ('OPEN', 'IN_REVIEW', 'RESOLVED', 'CLOSED')),
      resolution_note TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      link TEXT,
      is_read INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      booking_id TEXT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
      sender_id TEXT NOT NULL REFERENCES users(id),
      sender_role TEXT NOT NULL,
      body TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS offers (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category_slug TEXT,
      discount_type TEXT NOT NULL DEFAULT 'FLAT',
      discount_value INTEGER NOT NULL DEFAULT 0,
      min_order_paise INTEGER NOT NULL DEFAULT 0,
      valid_until TEXT NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS machines (
      id TEXT PRIMARY KEY,
      partner_id TEXT NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
      category TEXT NOT NULL CHECK(category IN ('AGRICULTURE', 'CONTRACTORS')),
      machine_type TEXT NOT NULL,
      make_model TEXT NOT NULL,
      capacity TEXT,
      service_area TEXT NOT NULL,
      hourly_rate_paise INTEGER NOT NULL DEFAULT 0,
      daily_rate_paise INTEGER NOT NULL DEFAULT 0,
      per_acre_rate_paise INTEGER NOT NULL DEFAULT 0,
      operator_included INTEGER NOT NULL DEFAULT 1,
      image_url TEXT,
      is_available INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS vendor_availability (
      id TEXT PRIMARY KEY,
      partner_id TEXT NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
      date TEXT NOT NULL,
      is_available INTEGER NOT NULL DEFAULT 1,
      slots_json TEXT NOT NULL DEFAULT '["09:00","14:00","18:00"]',
      UNIQUE(partner_id, date)
    );

    CREATE TABLE IF NOT EXISTS admin_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS construction_enquiries (
      id TEXT PRIMARY KEY,
      customer_id TEXT NOT NULL REFERENCES users(id),
      partner_id TEXT REFERENCES partners(id),
      project_title TEXT,
      building_type TEXT NOT NULL,
      plot_size TEXT NOT NULL,
      budget_range TEXT NOT NULL,
      location TEXT NOT NULL,
      timeline TEXT NOT NULL,
      notes TEXT,
      status TEXT NOT NULL DEFAULT 'SENT',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
}
