import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { getDb } from './client.ts';
import { runMigrations } from './schema.ts';

export const HERO_IMAGES = {
  homeServices: '/src/assets/images/hero_home_services_1794821794674.jpg',
  contractors: '/src/assets/images/hero_contractors_1794821794462.jpg',
  events: '/src/assets/images/hero_events_1794821796128.jpg',
  agriculture: '/src/assets/images/hero_agriculture_1794821795928.jpg',
  moving: '/src/assets/images/hero_moving_1794821795552.jpg',
};

export const SERVICE_IMAGES: Record<string, string> = {
  electrician: '/src/assets/images/svc_electrician_1794825491346.jpg',
  plumbing: '/src/assets/images/svc_plumbing_1794825491603.jpg',
  'ac-service': '/src/assets/images/svc_ac_appliance_1794825492024.jpg',
  'vehicle-repair': '/src/assets/images/svc_vehicle_repair_1794825492574.jpg',
  'home-cleaning': '/src/assets/images/svc_home_cleaning_1794825493004.jpg',
  'washing-service': '/src/assets/images/svc_washing_1794825492995.jpg',
  'home-cooking': '/src/assets/images/svc_cooking_1794825494618.jpg',
  'wall-painting': '/src/assets/images/svc_wall_painting_1794825494920.jpg',
  'interior-design': '/src/assets/images/svc_interior_design_1794825494857.jpg',
  'furniture-design': '/src/assets/images/svc_furniture_design_1794825495056.jpg',
  'site-workers': '/src/assets/images/svc_site_workers_1794825495047.jpg',
  'jcb-excavator': '/src/assets/images/svc_jcb_machinery_1794825496052.jpg',
  'material-transport': '/src/assets/images/svc_jcb_machinery_1794825496052.jpg',
  'concrete-road-machinery': '/src/assets/images/svc_jcb_machinery_1794825496052.jpg',
  'home-construction': '/src/assets/images/svc_home_construction_1794825495507.jpg',
  decoration: '/src/assets/images/svc_event_decor_1794825496811.jpg',
  catering: '/src/assets/images/svc_event_catering_1794825497630.jpg',
  dance: '/src/assets/images/svc_event_music_dance_1794825497765.jpg',
  singing: '/src/assets/images/svc_event_music_dance_1794825497765.jpg',
  photography: '/src/assets/images/svc_event_photography_1794825498468.jpg',
  dj: '/src/assets/images/svc_event_dj_1794825498947.jpg',
  'agricultural-workers': '/src/assets/images/svc_agri_workers_1794825499110.jpg',
  'tractor-rental': '/src/assets/images/svc_agri_tractor_harvest_1794825499106.jpg',
  'paddy-harvesting': '/src/assets/images/svc_agri_tractor_harvest_1794825499106.jpg',
  'ploughing-rotavator': '/src/assets/images/svc_agri_tractor_harvest_1794825499106.jpg',
  'drone-spraying': '/src/assets/images/svc_agri_drone_irrigation_1794825499973.jpg',
  'drip-irrigation': '/src/assets/images/svc_agri_drone_irrigation_1794825499973.jpg',
  'dairy-farm-cleaning': '/src/assets/images/svc_agri_workers_1794825499110.jpg',
  'home-shifting': '/src/assets/images/svc_moving_shifting_1794825499341.jpg',
  'office-shifting': '/src/assets/images/svc_moving_shifting_1794825499341.jpg',
  packing: '/src/assets/images/svc_moving_shifting_1794825499341.jpg',
  'loading-unloading': '/src/assets/images/svc_moving_shifting_1794825499341.jpg',
  transport: '/src/assets/images/svc_moving_shifting_1794825499341.jpg',
  'labour-only': '/src/assets/images/svc_moving_shifting_1794825499341.jpg',
  'heavy-item-moving': '/src/assets/images/svc_moving_shifting_1794825499341.jpg',
  'individual-item': '/src/assets/images/svc_moving_shifting_1794825499341.jpg',
};

export function seedDatabase(): void {
  runMigrations();
  const db = getDb();

  const existingAdmin = db.prepare(`SELECT id FROM users WHERE email = ?`).get('admin@serva.demo');
  if (!existingAdmin) {
    const hashPass = (pw: string) => bcrypt.hashSync(pw, 10);

    const insertSetting = db.prepare(
      `INSERT OR IGNORE INTO admin_settings (key, value) VALUES (?, ?)`
    );
    insertSetting.run('home_service_percent', '7');
    insertSetting.run('home_service_fixed_addon_paise', '10000');
    insertSetting.run('cooking_markup_ingredients', '0');
    insertSetting.run('auto_confirm_hours', '48');
    insertSetting.run('events_advance_percent', '30');

    const customerId = 'user-customer-1';
    const partnerUserId = 'user-partner-1';
    const partner2UserId = 'user-partner-2';
    const unverifiedPartnerUserId = 'user-partner-unverified';
    const adminId = 'user-admin-1';

    const insertUser = db.prepare(
      `INSERT OR IGNORE INTO users (id, name, email, mobile, password_hash, role, auth_provider, mobile_verified, language, default_city)
       VALUES (?, ?, ?, ?, ?, ?, 'LOCAL', 1, 'en', 'Hyderabad, TG')`
    );

    insertUser.run(customerId, 'Ananya Reddy', 'ananya@serva.demo', '9876543210', hashPass('Serva@123'), 'CUSTOMER');
    insertUser.run(partnerUserId, 'Ramesh Kumar', 'ramesh.partner@serva.demo', '9876500001', hashPass('Serva@123'), 'PARTNER');
    insertUser.run(partner2UserId, 'Lakshmi Devi', 'lakshmi.partner@serva.demo', '9876500003', hashPass('Serva@123'), 'PARTNER');
    insertUser.run(unverifiedPartnerUserId, 'Suresh Pending', 'pending.partner@serva.demo', '9876500002', hashPass('Serva@123'), 'PARTNER');
    insertUser.run(adminId, 'SERVA Admin', 'admin@serva.demo', '9876599999', hashPass('Admin@123'), 'ADMIN');

    const insertWallet = db.prepare(
      `INSERT OR IGNORE INTO wallets (id, user_id, balance_paise) VALUES (?, ?, ?)`
    );
    insertWallet.run('wallet-cust-1', customerId, 150000);
    insertWallet.run('wallet-part-1', partnerUserId, 420000);
    insertWallet.run('wallet-part-2', partner2UserId, 280000);
    insertWallet.run('wallet-part-unv', unverifiedPartnerUserId, 0);
    insertWallet.run('wallet-admin-1', adminId, 0);

    db.prepare(
      `INSERT OR IGNORE INTO wallet_transactions (id, wallet_id, type, amount_paise, description, reference_id)
       VALUES (?, ?, 'CREDIT', 150000, 'Welcome sample wallet credit (Sample Data)', 'SEED-01')`
    ).run('wtx-seed-1', 'wallet-cust-1');

    db.prepare(
      `INSERT OR IGNORE INTO addresses (id, user_id, label, kind, line1, area, city, state, pincode, is_default)
       VALUES (?, ?, 'Home - Madhapur', 'HOME', 'Flat 402, Sri Sai Residency, Road No 5', 'Madhapur', 'Hyderabad', 'Telangana', '500081', 1)`
    ).run('addr-1', customerId);

    db.prepare(
      `INSERT OR IGNORE INTO addresses (id, user_id, label, kind, line1, area, village_mandal, city, state, pincode, is_default)
       VALUES (?, ?, 'Paddy Farm - Nalgonda', 'FARM', 'Survey No. 112, Canal Road', 'Miryalaguda', 'Miryalaguda Mandal', 'Nalgonda', 'Telangana', '508207', 0)`
    ).run('addr-2', customerId);

    const insertPartner = db.prepare(
      `INSERT OR IGNORE INTO partners (id, user_id, business_name, is_individual, categories_json, services_json, service_area, experience_years, team_size, verification_status, rating_avg, rating_count, bio)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );

    insertPartner.run(
      'partner-verified-1',
      partnerUserId,
      'Ramesh Multi-Home & Shifting Crew',
      1,
      JSON.stringify(['home-services', 'contractors', 'moving']),
      JSON.stringify(['electrician', 'plumbing', 'wall-painting', 'home-shifting', 'interior-design']),
      'Hyderabad, TG',
      8,
      4,
      'VERIFIED',
      4.8,
      42,
      'Verified electrical, plumbing, painting, and residential shifting specialist across Hyderabad.'
    );

    insertPartner.run(
      'partner-verified-2',
      partner2UserId,
      'Lakshmi Catering, Events & Farm Services',
      1,
      JSON.stringify(['home-services', 'events', 'agriculture']),
      JSON.stringify(['home-cooking', 'catering', 'decoration', 'dj', 'paddy-harvesting', 'tractor-rental']),
      'Hyderabad & Nalgonda, TG',
      10,
      8,
      'VERIFIED',
      4.9,
      67,
      'Experienced Telugu & South Indian home chef, event team, DJ coordinator, and agricultural specialist.'
    );

    insertPartner.run(
      'partner-unverified-1',
      unverifiedPartnerUserId,
      'Suresh New Partner (Pending Review)',
      1,
      JSON.stringify(['home-services']),
      JSON.stringify(['plumbing']),
      'Hyderabad, TG',
      2,
      1,
      'SUBMITTED',
      0,
      0,
      'Newly registered technician awaiting admin document approval.'
    );

    db.prepare(
      `INSERT OR IGNORE INTO notifications (id, user_id, title, body, link)
       VALUES (?, ?, 'Welcome to SERVA', 'Explore Home Services, Contractors, Events, Agriculture, and Moving & Shifting.', '/services')`
    ).run('notif-seed-1', customerId);
  }

  // Upsert 5 main categories with high-res generated hero images
  const upsertCategory = db.prepare(
    `INSERT INTO service_categories (id, slug, name, name_te, tagline, description, accent_color, hero_image, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(slug) DO UPDATE SET
       hero_image = excluded.hero_image,
       name = excluded.name,
       name_te = excluded.name_te,
       tagline = excluded.tagline,
       description = excluded.description`
  );

  upsertCategory.run(
    'cat-home',
    'home-services',
    'Home Services',
    'గృహ సేవలు',
    'All essential home services at your doorstep',
    'Trusted technicians for repairing, cleaning, home & event cooking, wall painting, and 3D wall art.',
    '#0B5FD9',
    HERO_IMAGES.homeServices,
    1
  );
  upsertCategory.run(
    'cat-contractors',
    'contractors',
    'Contractors',
    'కాంట్రాక్టర్లు',
    'Design, skilled trades, machinery & home construction',
    'Interior design, custom furniture, skilled site workers, heavy construction vehicles, and free home construction enquiries.',
    '#F59E0B',
    HERO_IMAGES.contractors,
    2
  );
  upsertCategory.run(
    'cat-events',
    'events',
    'Events',
    'ఈవెంట్లు',
    'Weddings, birthdays & functions planned end to end',
    'Book individual specialists or a complete multi-service event team for Decoration, Catering, Dance, Singing, Photography, and DJ.',
    '#7C3AED',
    HERO_IMAGES.events,
    3
  );
  upsertCategory.run(
    'cat-agriculture',
    'agriculture',
    'Agriculture',
    'వ్యవసాయం',
    'Farm labour, operations & agricultural machinery',
    'Book agricultural worker teams, crop operations like drone spraying and harvesting, or rent tractors and harvesters.',
    '#16A34A',
    HERO_IMAGES.agriculture,
    4
  );
  upsertCategory.run(
    'cat-moving',
    'moving',
    'Moving and Shifting',
    'మూవింగ్ & షిఫ్టింగ్',
    'Skilled packing, loading & shifting teams',
    'Verified workers for Home Shifting, Office Shifting, Packing, Loading & Unloading, Labour Only, and Heavy Item Moving (customer arranges vehicle).',
    '#DC2626',
    HERO_IMAGES.moving,
    5
  );

  // Seed at least 6 listings per category (Phase 2 Test 22)
  const existingServicesCount = (db.prepare(`SELECT COUNT(*) as c FROM services`).get() as { c: number }).c;
  if (existingServicesCount === 0) {
    const insertService = db.prepare(
      `INSERT INTO services (id, category_slug, slug, name, sub_category, description, base_price_paise, unit_label, image_url, online_payment_only, requires_quotation, is_free_enquiry, metadata_json)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );

    // Home Services (8)
    const homeServices: Array<[string, string, string, string, string, number, string, number]> = [
      ['svc-hs-1', 'electrician', 'Electrician & Switchboard Repair', 'repairing', 'Bulb & board repair, fan, switchboard, MCB, fuse, cooler, TV, and microwave electrical work.', 25000, 'per visit', 0],
      ['svc-hs-2', 'plumbing', 'Kitchen & Bathroom Plumbing', 'repairing', 'Pipe leakage, tap fitting, flusher repair, sink drainage, and bathroom plumbing.', 20000, 'per visit', 0],
      ['svc-hs-3', 'ac-service', 'AC & Appliance Repair', 'repairing', 'AC repair & servicing, fridge, washing machine, gas stove, mixer, and water purifier repair.', 45000, 'per appliance', 0],
      ['svc-hs-4', 'vehicle-repair', 'Bike, Car & Auto Repair', 'repairing', 'Doorstep puncture, brake repair, clutch, cycle chain, and emergency vehicle troubleshooting.', 30000, 'per inspection', 0],
      ['svc-hs-5', 'home-cleaning', 'Home & Room Cleaning', 'cleaning', 'Door, fan, window, floor, bathroom, fridge, terrace, garden, and water tank cleaning.', 35000, 'per slot', 0],
      ['svc-hs-6', 'washing-service', 'Dish, Shoe & Cloth Washing', 'cleaning', 'Dish wash, shoe wash by pair, bed sheet wash, cloth wash, and vehicle wash.', 22000, 'per slot', 0],
      ['svc-hs-7', 'home-cooking', 'Cooking (Home, Event & Bulk)', 'cooking', 'Veg & Non-Veg home chefs. Chef buys fresh ingredients; online payment only.', 50000, 'service charge', 1],
      ['svc-hs-8', 'wall-painting', 'Wall Painting & 3D Wall Art', 'painting', 'Interior/exterior wall painting and 3D wall art with artist portfolios. Online payment only.', 150000, 'per room', 1],
    ];
    for (const [id, slug, name, sub, desc, price, unit, onlineOnly] of homeServices) {
      insertService.run(id, 'home-services', slug, name, sub, desc, price, unit, SERVICE_IMAGES[slug] ?? HERO_IMAGES.homeServices, onlineOnly, 0, 0, JSON.stringify({ sample: true }));
    }

    // Contractors (7)
    const contractorServices: Array<[string, string, string, string, string, number, string, number, number]> = [
      ['svc-con-1', 'interior-design', 'Interior Design & Modular Consultation', 'interior-design', 'Living room, kitchen, and bedroom interior design concepts with photo & video portfolios.', 250000, 'consultation', 1, 0],
      ['svc-con-2', 'furniture-design', 'Custom Furniture Design (Chair, Sofa, Bed, Wardrobe)', 'furniture', 'Bespoke furniture designs by verified carpenters and designers with sample walkthroughs.', 450000, 'starting quote', 1, 0],
      ['svc-con-3', 'site-workers', 'Skilled Workers (Mason, Painter, Electrician, Carpenter)', 'workers', 'Book skilled construction workers and general labour by worker count and days.', 90000, 'per worker / day', 1, 0],
      ['svc-con-4', 'jcb-excavator', 'JCB, Bulldozer & Excavator Rental', 'vehicles', 'Earth-moving vehicles with experienced operators for site excavation and levelling.', 180000, 'per hour', 1, 0],
      ['svc-con-5', 'material-transport', 'Tipper, Lorry, Cement & Water Tanker', 'vehicles', 'Material transport and site supply vehicles booked per trip or day.', 350000, 'per trip', 1, 0],
      ['svc-con-6', 'concrete-road-machinery', 'Concrete Mixer, Boom Placer & Road Roller', 'vehicles', 'Concrete pumping and road construction machinery with operator options.', 480000, 'per shift', 1, 0],
      ['svc-con-7', 'home-construction', 'Home Construction (Residential & Apartment)', 'home-construction', 'Free promotion showcase of contractor projects. Send a free project enquiry—no payment on SERVA.', 0, 'Free Enquiry', 0, 1],
    ];
    for (const [id, slug, name, sub, desc, price, unit, reqQuote, freeEnq] of contractorServices) {
      insertService.run(id, 'contractors', slug, name, sub, desc, price, unit, SERVICE_IMAGES[slug] ?? HERO_IMAGES.contractors, 0, reqQuote, freeEnq, JSON.stringify({ sample: true }));
    }

    // Events (Exactly 6 Launch Services, DJ standalone)
    const eventServices: Array<[string, string, string, string, string, number, string]> = [
      ['svc-ev-1', 'decoration', 'Decoration (Stage, Mandap & Themes)', 'decoration', 'Wedding mandap, haldi, birthday themes, floral backdrops, couple entry, and LED lighting.', 2500000, 'starting package'],
      ['svc-ev-2', 'catering', 'Catering & Food Services', 'catering', 'Veg, Non-Veg, Telangana & Andhra menus, live counters, buffet and traditional serving.', 45000, 'per plate'],
      ['svc-ev-3', 'dance', 'Dance & Choreography', 'dance', 'Bride & groom choreography, sangeet family dances, folk & classical performances.', 1000000, 'per event'],
      ['svc-ev-4', 'singing', 'Singing & Live Music', 'singing', 'Male & female singers, Telugu/Hindi/Tamil live bands, classical & devotional music.', 1500000, 'per event'],
      ['svc-ev-5', 'photography', 'Photography & Videography', 'photography', 'Candid, traditional, pre-wedding, cinematography, drone & wedding albums.', 3500000, 'per package'],
      ['svc-ev-6', 'dj', 'DJ (Standalone Booking Service)', 'dj', 'Direct standalone DJ booking with sound setup, lighting, music preferences, and live performance reels.', 1200000, 'per event'],
    ];
    for (const [id, slug, name, sub, desc, price, unit] of eventServices) {
      insertService.run(id, 'events', slug, name, sub, desc, price, unit, SERVICE_IMAGES[slug] ?? HERO_IMAGES.events, 1, 1, 0, JSON.stringify({ sample: true }));
    }

    // Agriculture (7)
    const agriServices: Array<[string, string, string, string, string, number, string]> = [
      ['svc-ag-1', 'agricultural-workers', 'Book Agricultural Workers (Teams of 5, 10, 20+)', 'workers', 'Verified farm labour teams for planting, weeding, harvesting, and sorting.', 60000, 'per worker / day'],
      ['svc-ag-2', 'tractor-rental', 'Tractor & Land Leveller Rental', 'machinery', 'Rent tractors, rotavators, cultivators, disc ploughs, and land levellers with or without operator.', 120000, 'per hour'],
      ['svc-ag-3', 'paddy-harvesting', 'Paddy Harvesting & Combine Harvester', 'services', 'Combine harvester and reaper binder booking with optional farm labour.', 240000, 'per acre'],
      ['svc-ag-4', 'drone-spraying', 'Agriculture Drone Spraying', 'services', 'Precision drone crop spraying for paddy, cotton, and horticulture crops.', 65000, 'per acre'],
      ['svc-ag-5', 'ploughing-rotavator', 'Land Preparation (Ploughing & Rotavator)', 'services', 'Field clearing, ploughing, rotavator mixing, and seed sowing.', 140000, 'per acre'],
      ['svc-ag-6', 'drip-irrigation', 'Drip & Sprinkler Irrigation Works', 'services', 'Drip irrigation installation, pipeline repair, and water pump assistance.', 180000, 'per visit'],
      ['svc-ag-7', 'dairy-farm-cleaning', 'Livestock & Dairy Farm Cleaning', 'services', 'Dairy farm cleaning, cattle shed maintenance, feeding, and nursery services.', 85000, 'per visit'],
    ];
    for (const [id, slug, name, sub, desc, price, unit] of agriServices) {
      insertService.run(id, 'agriculture', slug, name, sub, desc, price, unit, SERVICE_IMAGES[slug] ?? HERO_IMAGES.agriculture, 0, 1, 0, JSON.stringify({ sample: true }));
    }

    // Moving and Shifting (Exact 7 main services + Individual Item add-on)
    const movingServices: Array<[string, string, string, string, string, number, string]> = [
      ['svc-mv-1', 'home-shifting', 'Home Shifting', 'main', '1 BHK to 4 BHK+, single room or PG shifting labour & packing (customer arranges vehicle).', 350000, 'estimated base'],
      ['svc-mv-2', 'office-shifting', 'Office Shifting', 'main', 'Workstations, IT equipment handling, files, dismantling and reassembly teams.', 500000, 'estimated base'],
      ['svc-mv-3', 'packing', 'Packing', 'main', 'Furniture, kitchen, fragile & electronics packing with configurable box sizes.', 180000, 'estimated base'],
      ['svc-mv-4', 'loading-unloading', 'Loading & Unloading', 'main', 'Combined loading at pickup and unloading at destination into customer-arranged vehicle.', 220000, 'combined service'],
      ['svc-mv-5', 'transport', 'Transport (Customer-Arranged)', 'main', 'Record your arranged vehicle or get non-binding vehicle size guidance. SERVA provides no vehicles.', 0, 'Customer-arranged'],
      ['svc-mv-6', 'labour-only', 'Labour Only', 'main', 'Skilled moving workers for short or full-day shifting without packing materials.', 160000, 'for 2 workers'],
      ['svc-mv-7', 'heavy-item-moving', 'Heavy Item Moving', 'main', 'Special handling for refrigerators, washing machines, wardrobes, safes, and gym gear.', 140000, 'per item'],
      ['svc-mv-8', 'individual-item', 'Individual Item Shifting (Add-on)', 'addon', 'Move one or a few appliances or furniture items with Move only or Packing & move.', 90000, 'per item'],
    ];
    for (const [id, slug, name, sub, desc, price, unit] of movingServices) {
      insertService.run(id, 'moving', slug, name, sub, desc, price, unit, SERVICE_IMAGES[slug] ?? HERO_IMAGES.moving, 0, 1, 0, JSON.stringify({ sample: true }));
    }
  }

  // Always sync distinct per-service images on existing & fresh databases
  const updateServiceImg = db.prepare(`UPDATE services SET image_url = ? WHERE slug = ?`);
  for (const [slug, imageUrl] of Object.entries(SERVICE_IMAGES)) {
    updateServiceImg.run(imageUrl, slug);
  }

  // Seed Portfolio Items (Photos + Local Playable Videos for Interior, Furniture, Painting, Construction, DJ)
  const existingPortfolio = (db.prepare(`SELECT COUNT(*) as c FROM portfolio_items`).get() as { c: number }).c;
  if (existingPortfolio === 0) {
    const insertPort = db.prepare(
      `INSERT INTO portfolio_items (id, partner_id, category_slug, sub_category, style_tag, title, description, media_type, media_url, thumbnail_url, price_paise, moderation_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'APPROVED')`
    );

    insertPort.run(
      'port-1', 'partner-verified-1', 'home-services', 'painting', '3D Wall Art',
      'Geometric 3D Accent Wall — Jubilee Hills (Sample)',
      'Textured metallic 3D wall art finish completed in 2 days with washable matte coat.',
      'IMAGE', SERVICE_IMAGES['wall-painting'], SERVICE_IMAGES['wall-painting'], 1200000
    );
    insertPort.run(
      'port-2', 'partner-verified-1', 'home-services', 'painting', 'Living Room',
      'Modern Apartment Repainting Walkthrough (Sample Video)',
      'Before-and-after walkthrough of royal matte interior painting.',
      'VIDEO', '/media/interior_showcase.mp4', SERVICE_IMAGES['wall-painting'], 1500000
    );
    insertPort.run(
      'port-3', 'partner-verified-1', 'contractors', 'interior-design', 'Contemporary',
      'Warm Teak & Terrazzo Living Space (Sample)',
      'Full living-dining turnkey interior design with recessed pendant lighting.',
      'IMAGE', SERVICE_IMAGES['interior-design'], SERVICE_IMAGES['interior-design'], 35000000
    );
    insertPort.run(
      'port-4', 'partner-verified-1', 'contractors', 'interior-design', 'Kitchen',
      'Modular Walnut Kitchen Walkthrough (Sample Video)',
      'Custom modular walnut cabinetry and island counter installation.',
      'VIDEO', '/media/interior_showcase.mp4', SERVICE_IMAGES['interior-design'], 22000000
    );
    insertPort.run(
      'port-5', 'partner-verified-1', 'contractors', 'furniture', 'Sofa & Table',
      'Solid Teak Lounge Sofa & Coffee Table (Sample)',
      'Handcrafted solid wood sofa frame with breathable woven upholstery.',
      'IMAGE', SERVICE_IMAGES['furniture-design'], SERVICE_IMAGES['furniture-design'], 4500000
    );
    insertPort.run(
      'port-6', 'partner-verified-1', 'contractors', 'home-construction', 'Residential',
      '12-Storey Residential Tower & Villa Execution (Sample Video)',
      'Completed structural and finishing showcase for residential & apartment builds.',
      'VIDEO', '/media/construction_showcase.mp4', SERVICE_IMAGES['home-construction'], null
    );
    insertPort.run(
      'port-7', 'partner-verified-1', 'contractors', 'home-construction', 'Apartment',
      'G+5 Urban Apartment Block — Kondapur (Sample)',
      'Turnkey structural RCC, elevation, and common-area finishing project.',
      'IMAGE', SERVICE_IMAGES['home-construction'], SERVICE_IMAGES['home-construction'], null
    );
    insertPort.run(
      'port-8', 'partner-verified-2', 'events', 'dj', 'Wedding & Sangeet',
      'DJ Vikram — Live Sangeet & Reception Set (Sample Video)',
      'High-energy Telugu, Bollywood, and EDM mixing with line-array sound & moving-head lights.',
      'VIDEO', '/media/dj_live_showcase.mp4', SERVICE_IMAGES['dj'], 1200000
    );
    insertPort.run(
      'port-9', 'partner-verified-2', 'events', 'decoration', 'Mandap',
      'Royal Marigold & Jasmine Mandap Setup (Sample)',
      'Traditional South Indian floral mandap with warm chandelier canopy.',
      'IMAGE', SERVICE_IMAGES['decoration'], SERVICE_IMAGES['decoration'], 8000000
    );
  } else {
    db.prepare(`UPDATE portfolio_items SET media_url = ?, thumbnail_url = ? WHERE id = 'port-1'`).run(SERVICE_IMAGES['wall-painting'], SERVICE_IMAGES['wall-painting']);
    db.prepare(`UPDATE portfolio_items SET thumbnail_url = ? WHERE id = 'port-2'`).run(SERVICE_IMAGES['wall-painting']);
    db.prepare(`UPDATE portfolio_items SET media_url = ?, thumbnail_url = ? WHERE id = 'port-3'`).run(SERVICE_IMAGES['interior-design'], SERVICE_IMAGES['interior-design']);
    db.prepare(`UPDATE portfolio_items SET thumbnail_url = ? WHERE id = 'port-4'`).run(SERVICE_IMAGES['interior-design']);
    db.prepare(`UPDATE portfolio_items SET media_url = ?, thumbnail_url = ? WHERE id = 'port-5'`).run(SERVICE_IMAGES['furniture-design'], SERVICE_IMAGES['furniture-design']);
    db.prepare(`UPDATE portfolio_items SET thumbnail_url = ? WHERE id = 'port-6'`).run(SERVICE_IMAGES['home-construction']);
    db.prepare(`UPDATE portfolio_items SET media_url = ?, thumbnail_url = ? WHERE id = 'port-7'`).run(SERVICE_IMAGES['home-construction'], SERVICE_IMAGES['home-construction']);
    db.prepare(`UPDATE portfolio_items SET thumbnail_url = ? WHERE id = 'port-8'`).run(SERVICE_IMAGES['dj']);
    db.prepare(`UPDATE portfolio_items SET media_url = ?, thumbnail_url = ? WHERE id = 'port-9'`).run(SERVICE_IMAGES['decoration'], SERVICE_IMAGES['decoration']);
  }

  // Seed Sample Offers
  const existingOffers = (db.prepare(`SELECT COUNT(*) as c FROM offers`).get() as { c: number }).c;
  if (existingOffers === 0) {
    const insertOffer = db.prepare(
      `INSERT INTO offers (id, code, title, description, category_slug, discount_type, discount_value, min_order_paise, valid_until)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    insertOffer.run('off-1', 'SERVA50', 'Instant Special Offer on Home Services', 'Automatic offer discount applied at checkout on eligible Home Services.', 'home-services', 'FLAT', 50, 15000, '2026-12-31');
    insertOffer.run('off-2', 'WEDDING30', '30% Advance Booking Lock for Events', 'Lock your wedding or party vendors with just 30% advance payment.', 'events', 'INFO', 30, 1000000, '2026-12-31');
    insertOffer.run('off-3', 'FARMREADY', 'Kharif Machinery & Labour Bundle', 'Combine agricultural worker teams and tractor rental in one booking.', 'agriculture', 'FLAT', 200, 200000, '2026-12-31');
  }

  // Seed Sample Machinery Fleet & Partner Availability
  const existingMachines = (db.prepare(`SELECT COUNT(*) as c FROM machines`).get() as { c: number }).c;
  if (existingMachines === 0) {
    const insertMachine = db.prepare(
      `INSERT INTO machines (id, partner_id, category, machine_type, make_model, capacity, service_area, hourly_rate_paise, daily_rate_paise, per_acre_rate_paise, operator_included, image_url, is_available)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`
    );
    insertMachine.run(
      'mach-1',
      'partner-verified-2',
      'AGRICULTURE',
      'Tractor & Rotavator',
      'John Deere 5310 (Sample)',
      '55 HP · 7ft Rotavator',
      'Nalgonda & Rangareddy, TG',
      120000,
      750000,
      140000,
      1,
      HERO_IMAGES.agriculture
    );
    insertMachine.run(
      'mach-2',
      'partner-verified-1',
      'CONTRACTORS',
      'JCB Backhoe Loader',
      'JCB 3DX EcoXcellence (Sample)',
      '1.1 cum Bucket',
      'Hyderabad & ORR Zone, TG',
      180000,
      1150000,
      0,
      1,
      HERO_IMAGES.contractors
    );
  }
}

const isMain = process.argv[1]?.endsWith('seed.ts');
if (isMain) {
  seedDatabase();
  console.log('SERVA database migrated and seeded cleanly.');
}
