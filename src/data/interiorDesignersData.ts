export interface DesignerPortfolioMedia {
  id: string;
  title: string;
  roomType: string;
  style: string;
  mediaType?: 'IMAGE' | 'VIDEO';
  type?: 'photo' | 'video' | 'IMAGE' | 'VIDEO';
  mediaUrl: string;
  thumbnailUrl: string;
  videoDuration?: string;
  duration?: string;
  sqft?: string;
  budgetEst?: string;
  budget?: string;
  description: string;
}

export interface InteriorDesigner {
  id: string;
  partnerId: string;
  name: string;
  businessName: string;
  firmName?: string;
  avatar: string;
  avatarUrl?: string;
  coverImage: string;
  city: string;
  locality: string;
  area?: string;
  distanceKm: number;
  experienceYears: number;
  rating: number;
  reviewCount: number;
  completedProjects: number;
  onTimeRate: string;
  onTimeDeliveryRate?: number | string;
  avgTurnaroundDays: number;
  turnaroundDays?: number;
  pricePerSqFt: string;
  specialties: string[];
  badges: string[];
  bio: string;
  phone: string;
  email: string;
  featuredTestimonial?: {
    client: string;
    project: string;
    comment: string;
    rating: number;
  };
  portfolio: DesignerPortfolioMedia[];
}

export interface DesignerInquiry {
  id: string;
  designerId: string;
  designerName: string;
  designerBusiness?: string;
  customerName: string;
  customerMobile: string;
  customerCity?: string;
  customerAddress?: string;
  customerArea?: string;
  scope?: string;
  roomType?: string;
  estimatedBudget?: string;
  budgetRange?: string;
  preferredDate?: string;
  scheduledDate?: string;
  notes?: string;
  status: 'NEW' | 'CONTACTED' | 'SITE_VISIT_SCHEDULED' | 'SITE_VISIT_BOOKED' | 'QUOTATION_SENT' | 'CONVERTED' | 'COMPLETED';
  createdAt?: string;
  submittedAt?: string;
}

export const INITIAL_INTERIOR_DESIGNERS: InteriorDesigner[] = [
  {
    id: 'dsg-1',
    partnerId: 'PTR-506',
    name: 'Ar. Priya Sharma',
    businessName: 'Studio Vistara Luxury Interiors',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1000&auto=format&fit=crop&q=80',
    city: 'Hyderabad',
    locality: 'Road No. 36, Jubilee Hills',
    distanceKm: 1.8,
    experienceYears: 10,
    rating: 4.95,
    reviewCount: 142,
    completedProjects: 96,
    onTimeRate: '99.2%',
    avgTurnaroundDays: 40,
    pricePerSqFt: '₹1,600 – ₹2,400 / sq.ft',
    specialties: ['Modern Luxury', 'Full 3BHK Turnkey', 'Italian Modular Kitchen', 'Acoustic Ceilings'],
    badges: ['Top Rated 2026', 'COA Certified', 'SERVA Platinum'],
    bio: 'Specializing in contemporary luxury residences, Italian modular kitchens, and turnkey villa aesthetics across Jubilee Hills and Banjara Hills.',
    phone: '9849012345',
    email: 'priya.vistara@serva.demo',
    featuredTestimonial: {
      client: 'Dr. Srinivas Rao',
      project: '3 BHK Luxury Apartment in My Home Bhooja',
      comment: 'Priya and her team delivered an exceptional modern luxury home on day 38! Flawless veneer panelling and smart ambient lighting.',
      rating: 5,
    },
    portfolio: [
      {
        id: 'port-101',
        title: '3BHK Premium Living Room & Ambient Foyer',
        roomType: 'Living Room',
        style: 'Modern Luxury',
        mediaType: 'VIDEO',
        mediaUrl: '/media/interior_showcase.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&auto=format&fit=crop&q=80',
        videoDuration: '1:45 min',
        sqft: '2,400 sq.ft',
        budgetEst: '₹14.5 Lakhs',
        description: 'Complete walkthrough of bespoke fluted wall panels, imported Italian marble media unit, and concealed warm LED illumination.',
      },
      {
        id: 'port-102',
        title: 'High-Gloss Acrylic Modular Kitchen & Breakfast Counter',
        roomType: 'Modular Kitchen',
        style: 'Modern Luxury',
        mediaType: 'IMAGE',
        mediaUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=900&auto=format&fit=crop&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&auto=format&fit=crop&q=80',
        sqft: '180 sq.ft',
        budgetEst: '₹4.8 Lakhs',
        description: 'German Blum soft-close fittings, anti-scratch quartz countertop, integrated pantry pull-outs and profile backlights.',
      },
      {
        id: 'port-103',
        title: 'Master Suite with Custom Headboard & Walk-in Wardrobe',
        roomType: 'Master Bedroom',
        style: 'Contemporary Italian',
        mediaType: 'IMAGE',
        mediaUrl: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=900&auto=format&fit=crop&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=600&auto=format&fit=crop&q=80',
        sqft: '320 sq.ft',
        budgetEst: '₹6.2 Lakhs',
        description: 'Suede upholstered acoustic headboard, tinted glass sliding wardrobe with automatic sensor lighting, and wooden vinyl flooring.',
      },
      {
        id: 'port-104',
        title: 'Green Oasis Balcony Lounge & Vertical Garden',
        roomType: 'Balcony & Garden',
        style: 'Warm Bohemian',
        mediaType: 'IMAGE',
        mediaUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=900&auto=format&fit=crop&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&auto=format&fit=crop&q=80',
        sqft: '140 sq.ft',
        budgetEst: '₹2.1 Lakhs',
        description: 'Weather-resistant teak seating, artificial grass turf with drainage grid, and automated drip-irrigated vertical succulent wall.',
      },
    ],
  },
  {
    id: 'dsg-2',
    partnerId: 'PTR-501',
    name: 'Arjun Reddy',
    businessName: 'Deccan Luxe Living Design Studio',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1000&auto=format&fit=crop&q=80',
    city: 'Hyderabad',
    locality: 'Financial District, Gachibowli',
    distanceKm: 2.4,
    experienceYears: 12,
    rating: 4.92,
    reviewCount: 118,
    completedProjects: 114,
    onTimeRate: '98.8%',
    avgTurnaroundDays: 45,
    pricePerSqFt: '₹1,800 – ₹2,800 / sq.ft',
    specialties: ['Villa Interiors', 'Contemporary Minimalist', 'German Profile Kitchen', 'Ambient Smart Lighting'],
    badges: ['Luxury Villa Specialist', 'Zero Snags Award', 'SERVA Verified'],
    bio: 'Pioneering clean lines, smart automated mood lighting, and natural wood craftsmanship for independent villas and high-rise penthouses.',
    phone: '9848099887',
    email: 'arjun.deccan@serva.demo',
    featuredTestimonial: {
      client: 'K. Vikram Reddy',
      project: '4BHK Triplex Villa in Boulder Hills',
      comment: 'Arjun turned our bare shell villa into an architectural masterpiece. The smart lighting scenes and double-height living room are stunning.',
      rating: 5,
    },
    portfolio: [
      {
        id: 'port-201',
        title: 'Triplex Villa Double-Height Living Room',
        roomType: 'Living Room',
        style: 'Modern Luxury',
        mediaType: 'VIDEO',
        mediaUrl: '/media/construction_showcase.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&auto=format&fit=crop&q=80',
        videoDuration: '2:15 min',
        sqft: '4,800 sq.ft',
        budgetEst: '₹32.0 Lakhs',
        description: 'Double height glass facade, bespoke brass chandelier, travertine stone cladding and motorized curtain automation.',
      },
      {
        id: 'port-202',
        title: 'Handleless Matte Charcoal Modular Kitchen',
        roomType: 'Modular Kitchen',
        style: 'Minimalist',
        mediaType: 'IMAGE',
        mediaUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&auto=format&fit=crop&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop&q=80',
        sqft: '220 sq.ft',
        budgetEst: '₹7.5 Lakhs',
        description: 'Gola profile handleless German cabinetry, built-in Bosch appliances, waterfall nano-white island counter with bar stools.',
      },
      {
        id: 'port-203',
        title: 'Zen Master Bedroom with Floating Platform Bed',
        roomType: 'Master Bedroom',
        style: 'Minimalist',
        mediaType: 'IMAGE',
        mediaUrl: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=900&auto=format&fit=crop&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=600&auto=format&fit=crop&q=80',
        sqft: '360 sq.ft',
        budgetEst: '₹5.8 Lakhs',
        description: 'Under-bed ambient illumination, microcement feature wall, frameless floor-to-ceiling smoked mirrors.',
      },
      {
        id: 'port-204',
        title: 'Acoustic Home Theater & Soundproof Media Den',
        roomType: 'Office & Commercial',
        style: 'Modern Luxury',
        mediaType: 'IMAGE',
        mediaUrl: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=900&auto=format&fit=crop&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=600&auto=format&fit=crop&q=80',
        sqft: '260 sq.ft',
        budgetEst: '₹9.4 Lakhs',
        description: 'Dolby Atmos 7.1.4 acoustic fabric wall treatment, tiered recliner seating, 4K laser projector alcove.',
      },
    ],
  },
  {
    id: 'dsg-3',
    partnerId: 'PTR-8840',
    name: 'Meera Kulkarni',
    businessName: 'UrbanCraft Modular & Living Studio',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1000&auto=format&fit=crop&q=80',
    city: 'Hyderabad',
    locality: 'Road No. 10, Banjara Hills',
    distanceKm: 3.1,
    experienceYears: 8,
    rating: 4.88,
    reviewCount: 94,
    completedProjects: 78,
    onTimeRate: '97.5%',
    avgTurnaroundDays: 30,
    pricePerSqFt: '₹1,200 – ₹1,800 / sq.ft',
    specialties: ['Acrylic Modular Kitchens', 'Space-Saving Furniture', 'Scandinavian 2BHK/3BHK', 'Smart Storage'],
    badges: ['Fast 30-Day Delivery', 'Direct Factory Price', 'SERVA Verified'],
    bio: 'Dedicated to smart, space-optimized 2BHK & 3BHK urban apartments with factory-calibrated modular units and moisture-resistant HDHMR boards.',
    phone: '9988771122',
    email: 'meera.urbancraft@serva.demo',
    featuredTestimonial: {
      client: 'Sneha & Rahul Kapoor',
      project: '3 BHK Flat in Aparna Sarovar, Nallagandla',
      comment: 'Finished within 28 days flat! Every corner has smart storage. Exceptional value without cutting corners on laminate quality.',
      rating: 5,
    },
    portfolio: [
      {
        id: 'port-301',
        title: 'Scandinavian Minimalist Open Living & Dining',
        roomType: 'Living Room',
        style: 'Scandinavian',
        mediaType: 'IMAGE',
        mediaUrl: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=900&auto=format&fit=crop&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600&auto=format&fit=crop&q=80',
        sqft: '1,800 sq.ft',
        budgetEst: '₹9.2 Lakhs',
        description: 'Light oak wood textures, pastel sage green accents, multipurpose partition credenza and ergonomic dining nook.',
      },
      {
        id: 'port-302',
        title: 'Compact L-Shaped Modular Kitchen with Magic Corner',
        roomType: 'Modular Kitchen',
        style: 'Scandinavian',
        mediaType: 'IMAGE',
        mediaUrl: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=900&auto=format&fit=crop&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=600&auto=format&fit=crop&q=80',
        sqft: '140 sq.ft',
        budgetEst: '₹3.6 Lakhs',
        description: 'Maximizing corner space with Hafele carousel units, under-cabinet puck lights and hydraulic lift-up shutters.',
      },
      {
        id: 'port-303',
        title: 'Multi-Functional Kids Bedroom with Study Bunk',
        roomType: 'Master Bedroom',
        style: 'Warm Bohemian',
        mediaType: 'VIDEO',
        mediaUrl: '/media/interior_showcase.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&auto=format&fit=crop&q=80',
        videoDuration: '1:10 min',
        sqft: '190 sq.ft',
        budgetEst: '₹3.9 Lakhs',
        description: 'Video tour of dual-purpose study desk, pull-out trundle bed, chalkboard wall and rounded edge safety carpentry.',
      },
    ],
  },
  {
    id: 'dsg-4',
    partnerId: 'PTR-8821',
    name: 'Vikram Varma',
    businessName: 'Sahasra Architectural Interiors',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1000&auto=format&fit=crop&q=80',
    city: 'Hyderabad',
    locality: 'Inorbit Mall Road, Madhapur',
    distanceKm: 3.8,
    experienceYears: 14,
    rating: 4.90,
    reviewCount: 165,
    completedProjects: 142,
    onTimeRate: '99.4%',
    avgTurnaroundDays: 42,
    pricePerSqFt: '₹1,500 – ₹2,600 / sq.ft',
    specialties: ['Classical & Fusion', 'Solid Teakwood Detailing', 'Penthouse & Villa Turnkey', 'Pooja Room Carving'],
    badges: ['14+ Years Legacy', 'Woodcraft Master', 'SERVA Verified'],
    bio: 'Blending traditional Indian woodcraft with contemporary silhouettes. Renowned for custom CNC-carved pooja mandirs and solid teakwood dining centerpieces.',
    phone: '9876543210',
    email: 'vikram.sahasra@serva.demo',
    featuredTestimonial: {
      client: 'N. Radhakrishna Murthy',
      project: 'G+2 Independent House in Dilsukhnagar',
      comment: 'The traditional hand-carved teakwood pooja unit combined with modern false ceilings is the talk of all our relatives. Outstanding craftsmanship.',
      rating: 5,
    },
    portfolio: [
      {
        id: 'port-401',
        title: 'Contemporary Fusion Grand Foyer & Pooja Mandap',
        roomType: 'Living Room',
        style: 'Neo-Classical',
        mediaType: 'IMAGE',
        mediaUrl: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=900&auto=format&fit=crop&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&auto=format&fit=crop&q=80',
        sqft: '3,200 sq.ft',
        budgetEst: '₹21.5 Lakhs',
        description: 'Burma teakwood brass inlay columns, backlit onyx marble backdrop, brass bells and jali carved archways.',
      },
      {
        id: 'port-402',
        title: 'Royal Master Bedroom with Tufted Velvet Panels',
        roomType: 'Master Bedroom',
        style: 'Neo-Classical',
        mediaType: 'IMAGE',
        mediaUrl: 'https://images.unsplash.com/photo-1540518614846-7ede433c4ef4?w=900&auto=format&fit=crop&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1540518614846-7ede433c4ef4?w=600&auto=format&fit=crop&q=80',
        sqft: '380 sq.ft',
        budgetEst: '₹7.2 Lakhs',
        description: 'Champagne gold metallic trim moldings, deep tufted headboard, and fluted dressing console.',
      },
    ],
  },
  {
    id: 'dsg-5',
    partnerId: 'PTR-503',
    name: 'Farhan Sheikh',
    businessName: 'Opus Minimalist Living Studio',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1000&auto=format&fit=crop&q=80',
    city: 'Hyderabad',
    locality: 'Botanical Garden Road, Kondapur',
    distanceKm: 4.5,
    experienceYears: 7,
    rating: 4.85,
    reviewCount: 72,
    completedProjects: 56,
    onTimeRate: '98.0%',
    avgTurnaroundDays: 35,
    pricePerSqFt: '₹1,300 – ₹1,950 / sq.ft',
    specialties: ['Japandi Interiors', 'Microcement Finishes', 'Concealed Lighting', 'Compact Urban Flats'],
    badges: ['Modern Trendsetter', 'Eco-Design', 'SERVA Verified'],
    bio: 'Masters of the Japanese-Scandinavian (Japandi) philosophy: unadorned surfaces, earthy raw clay textures, and serene clutter-free living sanctuaries.',
    phone: '9900112244',
    email: 'farhan.opus@serva.demo',
    featuredTestimonial: {
      client: 'Aditya & Neha Varma',
      project: '2.5 BHK Flat in Kondapur',
      comment: 'Minimal, calming, and so airy! Farhan eliminated all heavy visual clutter and gave us a Japanese-inspired sanctuary.',
      rating: 5,
    },
    portfolio: [
      {
        id: 'port-501',
        title: 'Japandi Living Room with Curved Plaster Alcove',
        roomType: 'Living Room',
        style: 'Minimalist',
        mediaType: 'IMAGE',
        mediaUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=900&auto=format&fit=crop&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&auto=format&fit=crop&q=80',
        sqft: '1,500 sq.ft',
        budgetEst: '₹8.4 Lakhs',
        description: 'Seamless microcement floors, soft linen drapery, curved plaster display niches, and paper lantern pendant fixtures.',
      },
      {
        id: 'port-502',
        title: 'Minimalist Chef Kitchen with Quartz Backsplash',
        roomType: 'Modular Kitchen',
        style: 'Minimalist',
        mediaType: 'IMAGE',
        mediaUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=900&auto=format&fit=crop&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&auto=format&fit=crop&q=80',
        sqft: '160 sq.ft',
        budgetEst: '₹4.2 Lakhs',
        description: 'Monochromatic concrete look cabinets, push-to-open hardware, and integrated induction hob with downdraft exhaust.',
      },
    ],
  },
  {
    id: 'dsg-6',
    partnerId: 'PTR-504',
    name: 'Ananya Rao',
    businessName: 'Earth & Wood Sustainable Living',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1615873968403-89e068629265?w=1000&auto=format&fit=crop&q=80',
    city: 'Hyderabad',
    locality: 'Hitec City Phase 2, Madhapur',
    distanceKm: 5.1,
    experienceYears: 9,
    rating: 4.91,
    reviewCount: 86,
    completedProjects: 68,
    onTimeRate: '98.5%',
    avgTurnaroundDays: 38,
    pricePerSqFt: '₹1,450 – ₹2,100 / sq.ft',
    specialties: ['Biophilic Green Living', 'Terracotta & Cane Accents', 'VOC-Free Finishes', 'Balcony Oasis'],
    badges: ['Green Building Certified', 'Artisanal Craft', 'SERVA Verified'],
    bio: 'Creating sustainable, breathable interior sanctuaries using reclaimed woods, cane woven wardrobe shutters, and indoor lush biophilic planter walls.',
    phone: '9888771122',
    email: 'ananya.earth@serva.demo',
    featuredTestimonial: {
      client: 'Pooja Sundaram',
      project: '3BHK Eco Home in Jayabheri Silicon County',
      comment: 'The cane wardrobes, natural lime wash walls, and indoor plant courtyards bring so much serenity to our daily life. Love their eco-conscious philosophy.',
      rating: 5,
    },
    portfolio: [
      {
        id: 'port-601',
        title: 'Biophilic Living Lounge with Cane Shutters & Live Plants',
        roomType: 'Living Room',
        style: 'Warm Bohemian',
        mediaType: 'IMAGE',
        mediaUrl: 'https://images.unsplash.com/photo-1615873968403-89e068629265?w=900&auto=format&fit=crop&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1615873968403-89e068629265?w=600&auto=format&fit=crop&q=80',
        sqft: '2,100 sq.ft',
        budgetEst: '₹11.8 Lakhs',
        description: 'Handwoven rattan cane console, terracotta wall pots, natural jute area rug and lime-plaster breathable coating.',
      },
    ],
  },
];

export const INITIAL_DESIGNER_INQUIRIES: DesignerInquiry[] = [
  {
    id: 'DSG-REQ-4819',
    designerId: 'dsg-1',
    designerName: 'Ar. Priya Sharma',
    designerBusiness: 'Studio Vistara Luxury Interiors',
    customerName: 'Sanjay Reddy',
    customerMobile: '9876543210',
    customerCity: 'Hyderabad',
    customerAddress: 'Flat 1204, DSR Fortune Prime, Madhapur, Hyderabad',
    scope: 'Full 3 BHK Home',
    estimatedBudget: '₹15 Lakhs – ₹25 Lakhs',
    preferredDate: '26 Nov 2026, 11:00 AM',
    notes: 'Require turnkey execution including Italian modular kitchen, false ceiling with magnetic track lights, and living room acoustic wall.',
    status: 'SITE_VISIT_SCHEDULED',
    createdAt: 'Today, 02:45 PM',
  },
  {
    id: 'DSG-REQ-4820',
    designerId: 'dsg-2',
    designerName: 'Arjun Reddy',
    designerBusiness: 'Deccan Luxe Living Design Studio',
    customerName: 'Deepika Rao',
    customerMobile: '9848011223',
    customerCity: 'Hyderabad',
    customerAddress: 'Villa 44, Palm Meadows, Gachibowli, Hyderabad',
    scope: 'Villa / Penthouse',
    estimatedBudget: '₹25 Lakhs – ₹40 Lakhs',
    preferredDate: '28 Nov 2026, 03:30 PM',
    notes: 'Double height living room design, home automation integration, and luxury master suite walk-in wardrobe.',
    status: 'NEW',
    createdAt: 'Today, 04:10 PM',
  },
];

export const INTERIOR_DESIGNERS_DATA = INITIAL_INTERIOR_DESIGNERS;
