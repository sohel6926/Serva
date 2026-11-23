export interface EventPortfolioMedia {
  id: string;
  title: string;
  eventType: string; // e.g. 'Marriage / Wedding', 'Haldi', 'Birthday Parties', 'Corporate Events', 'Engagement', 'Wedding Reception'
  mediaType: 'IMAGE' | 'VIDEO';
  mediaUrl: string;
  thumbnailUrl: string;
  videoDuration?: string;
  description: string;
  venueName?: string;
  guestCapacity?: number;
}

export interface EventPreDecidedPackage {
  eventType: string;
  packageName: string;
  startingPricePaise: number;
  priceDisplay: string;
  highlights: string[];
  setupTimeHours: number;
}

export interface EventPlanner {
  id: string;
  partnerId: string;
  name: string;
  businessName: string;
  firmName?: string;
  avatar: string;
  coverImage: string;
  city: string;
  locality: string;
  distanceKm: number;
  experienceYears: number;
  rating: number;
  reviewCount: number;
  completedEvents: number;
  onTimeRate: string;
  specialties: string[];
  phone: string;
  email: string;
  packages: Record<string, EventPreDecidedPackage>;
  portfolio: EventPortfolioMedia[];
}

export interface EventInquiry {
  id: string;
  plannerId: string;
  plannerName: string;
  plannerBusiness?: string;
  customerName: string;
  customerMobile: string;
  customerEmail?: string;
  eventType: string;
  eventDate: string;
  guestCount: number;
  venueLocation: string;
  preDecidedPricePaise: number;
  preDecidedPriceDisplay: string;
  budgetRange: string;
  notes?: string;
  status: 'NEW' | 'CONTACTED' | 'QUOTED' | 'CONFIRMED' | 'REJECTED';
  createdAt: string;
}

export const EVENT_PLANNERS_DATA: EventPlanner[] = [
  {
    id: 'planner-1',
    partnerId: 'PTR-EVT-101',
    name: 'Sandeep Varma',
    businessName: 'Grand Royal Events & Luxury Weddings',
    firmName: 'Grand Royal Events',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    coverImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
    city: 'Hyderabad',
    locality: 'Jubilee Hills',
    distanceKm: 2.1,
    experienceYears: 12,
    rating: 4.95,
    reviewCount: 310,
    completedEvents: 460,
    onTimeRate: '99.4%',
    specialties: ['Grand Wedding Mandaps', 'Royal Reception Stages', 'Luxury Floral Installations', 'Live Concert AV'],
    phone: '9848012345',
    email: 'sandeep@grandroyalevents.com',
    packages: {
      'Marriage / Wedding': {
        eventType: 'Marriage / Wedding',
        packageName: 'Royal Nizam Wedding & Mandap Package',
        startingPricePaise: 18000000, // ₹1,80,000
        priceDisplay: '₹1,80,000',
        highlights: ['Fresh Orchid & Marigold Mandap (30x30 ft)', 'Curved Floral Entry Archway', 'Bridal Walkway Carpet', 'Truss Ambient Spotlights'],
        setupTimeHours: 14,
      },
      'Birthday Parties': {
        eventType: 'Birthday Parties',
        packageName: 'Luxury Themed Birthday Extravaganza',
        startingPricePaise: 2800000, // ₹28,000
        priceDisplay: '₹28,000',
        highlights: ['Pastel & Chrome Balloon Arch', 'Neon Name Board', 'Cartoon/LED Cutouts', 'DJ Sound Box & Fog'],
        setupTimeHours: 4,
      },
      'Haldi': {
        eventType: 'Haldi',
        packageName: 'Sunny Yellow Floral Haldi Canopy',
        startingPricePaise: 3800000, // ₹38,000
        priceDisplay: '₹38,000',
        highlights: ['Brass Urli Seating Tub', 'Marigold Genda Waterfall Backdrop', 'Floral Jewelry Booth', 'Yellow Draped Cabana'],
        setupTimeHours: 6,
      },
      'Engagement': {
        eventType: 'Engagement',
        packageName: 'Romantic Ring Ceremony Setup',
        startingPricePaise: 6500000, // ₹65,000
        priceDisplay: '₹65,000',
        highlights: ['Infinity Ring Floral Backdrop', 'Fairy Light Tunnel Entrance', 'Cake Table Floral Cascade', 'Soft Wash Lighting'],
        setupTimeHours: 8,
      },
      'Anniversary': {
        eventType: 'Anniversary',
        packageName: 'Silver & Golden Jubilee Celebration',
        startingPricePaise: 4200000, // ₹42,000
        priceDisplay: '₹42,000',
        highlights: ['Memory Photo Wall Display', 'Rose Canopy Dining Stage', 'Acoustic Sound Rigging', 'Ambient Warm Lanterns'],
        setupTimeHours: 5,
      },
      'Wedding Reception': {
        eventType: 'Wedding Reception',
        packageName: 'Grand Ballroom LED Stage & Truss',
        startingPricePaise: 13500000, // ₹1,35,000
        priceDisplay: '₹1,35,000',
        highlights: ['36x12 ft P3 HD LED Curved Wall', 'Cold Pyros & Low Fog Entrance', 'Sofa Royal Seating Set', 'Moving Head Beam Lights'],
        setupTimeHours: 10,
      },
      'Pooja & Religious Functions': {
        eventType: 'Pooja & Religious Functions',
        packageName: 'Traditional Temple Vedic Mandap',
        startingPricePaise: 2200000, // ₹22,000
        priceDisplay: '₹22,000',
        highlights: ['Banana Tree & Mango Leaf Entrance', 'Traditional Brass Kuthuvilakku', 'Homam Vedic Altar Decor', 'Natural Flower Garlands'],
        setupTimeHours: 4,
      },
      'Baby Shower / Seemantham': {
        eventType: 'Baby Shower / Seemantham',
        packageName: 'Traditional Lotus Cradle Seemantham',
        startingPricePaise: 3200000, // ₹32,000
        priceDisplay: '₹32,000',
        highlights: ['Carved Lotus Cradle with Flowers', 'Jasmine & Lotus Flower Hangings', 'Bangle Ceremony Display Table', 'Traditional Swing Decor'],
        setupTimeHours: 5,
      },
      'Naming Ceremony': {
        eventType: 'Naming Ceremony',
        packageName: 'Pastel Floral Cloud Cradle Setup',
        startingPricePaise: 2400000, // ₹24,000
        priceDisplay: '₹24,000',
        highlights: ['White Satin Cradle with Roses', 'Acrylic Gold Letter Name Monogram', 'Balloon & Floral Cloud Arch', 'Photo Backdrop'],
        setupTimeHours: 4,
      },
      'Housewarming': {
        eventType: 'Housewarming',
        packageName: 'Gruhapravesam Auspicious Welcome',
        startingPricePaise: 2800000, // ₹28,000
        priceDisplay: '₹28,000',
        highlights: ['Main Door Floral Toran', 'Kolam & Rangoli Flower Carpets', 'Pooja Room Marigold Frame', 'Entry Brass Urli with Floating Tea Lights'],
        setupTimeHours: 4,
      },
      'Corporate Events': {
        eventType: 'Corporate Events',
        packageName: 'Corporate Summit & Gala Stage',
        startingPricePaise: 8500000, // ₹85,000
        priceDisplay: '₹85,000',
        highlights: ['Stage Backdrop with Company Branding', 'Truss Lighting & Audio Console', 'Podium with Goose-neck Mic', 'Lobby Registration Kiosk'],
        setupTimeHours: 8,
      },
      'Family Gatherings': {
        eventType: 'Family Gatherings',
        packageName: 'Open Garden Canopy & Dinner Lounge',
        startingPricePaise: 3000000, // ₹30,000
        priceDisplay: '₹30,000',
        highlights: ['Fairy Light Canopies over Dining', 'Cocktail High Tables & Linens', 'Acoustic Bluetooth Sound Setup', 'Photo Memory Tree'],
        setupTimeHours: 4,
      },
      'Cultural Programmes': {
        eventType: 'Cultural Programmes',
        packageName: 'Natya & Classical Music Stage',
        startingPricePaise: 5500000, // ₹55,000
        priceDisplay: '₹55,000',
        highlights: ['Carved Pillar Stage Proscenium', 'Surround Sound Monitor Setup', 'Overhead Par Can Colored Washes', 'Green Room Partitions'],
        setupTimeHours: 6,
      },
    },
    portfolio: [
      {
        id: 'port-101',
        title: 'Grand Nizam Mandap & Floral Chandelier',
        eventType: 'Marriage / Wedding',
        mediaType: 'IMAGE',
        mediaUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=400&q=80',
        description: 'Complete 30-ft royal dome mandap crafted with fresh Bangalore roses, imported orchids, and brass kalash accents.',
        venueName: 'Taj Falaknuma Palace, Hyderabad',
        guestCapacity: 600,
      },
      {
        id: 'port-102',
        title: 'Gachibowli Open-Air Wedding Walkthrough',
        eventType: 'Marriage / Wedding',
        mediaType: 'VIDEO',
        mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=400&q=80',
        videoDuration: '1:45',
        description: 'Cinematic 4K walkthrough of royal bridal aisle with 120-meter floral carpet and synchronous pyrotechnic cold sparks.',
        venueName: 'Boulder Hills Golf & Country Club',
        guestCapacity: 850,
      },
      {
        id: 'port-103',
        title: 'Yellow Floral Urli & Canopy Setup',
        eventType: 'Haldi',
        mediaType: 'IMAGE',
        mediaUrl: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=900&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=400&q=80',
        description: 'Vibrant marigold drapes with brass urli tub, sunflower backdrop, and floral umbrella photobooth.',
        venueName: 'Private Farmhouse, Moinabad',
        guestCapacity: 150,
      },
      {
        id: 'port-104',
        title: 'Curved LED Wall Reception Stage',
        eventType: 'Wedding Reception',
        mediaType: 'IMAGE',
        mediaUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=400&q=80',
        description: 'Modern 3D curved LED screen with ambient truss lighting, stage carpeting, and custom couple monogram visuals.',
        venueName: 'JRC Convention Hall, Jubilee Hills',
        guestCapacity: 1200,
      },
    ],
  },
  {
    id: 'planner-2',
    partnerId: 'PTR-EVT-102',
    name: 'Swathi Reddy',
    businessName: 'Vibha Occasions & Eco-Floral Planners',
    firmName: 'Vibha Occasions',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    coverImage: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1200&q=80',
    city: 'Hyderabad',
    locality: 'Banjara Hills',
    distanceKm: 3.4,
    experienceYears: 9,
    rating: 4.88,
    reviewCount: 220,
    completedEvents: 310,
    onTimeRate: '98.9%',
    specialties: ['Sustainable Floral Decor', 'Haldi & Mehendi Thematics', 'Seemantham Cradles', 'Intimate Weddings'],
    phone: '9848123456',
    email: 'swathi@vibhaoccasions.in',
    packages: {
      'Marriage / Wedding': {
        eventType: 'Marriage / Wedding',
        packageName: 'Eco-Chic Handcrafted Wedding Package',
        startingPricePaise: 16000000,
        priceDisplay: '₹1,60,000',
        highlights: ['Handwoven Floral Mandap with Tuberose Strings', 'Eco-Brass Diyas Entrance', 'Pooja Canopy with Banana Pillars', 'Live Nadaswaram Seating Setup'],
        setupTimeHours: 12,
      },
      'Haldi': {
        eventType: 'Haldi',
        packageName: 'Marigold Sunshine Village Haldi',
        startingPricePaise: 3500000,
        priceDisplay: '₹35,000',
        highlights: ['Sunburst Genda Phool Arch', 'Custom Wooden Swing with Florals', 'Traditional Brass Thali Display', 'Dholak & Folk Seating Diwans'],
        setupTimeHours: 5,
      },
      'Birthday Parties': {
        eventType: 'Birthday Parties',
        packageName: 'Boho Garden Fairy Birthday',
        startingPricePaise: 250000,
        priceDisplay: '₹25,000',
        highlights: ['Teepee Tents with Fairy Lights', 'Organic Pastel Balloons', 'Wooden Welcome Easel Stand', 'Kids Play & Snack Zone'],
        setupTimeHours: 4,
      },
      'Baby Shower / Seemantham': {
        eventType: 'Baby Shower / Seemantham',
        packageName: 'Traditional South Indian Seemantham Canopy',
        startingPricePaise: 2900000,
        priceDisplay: '₹29,000',
        highlights: ['Brass Urli with Fresh Lotuses', 'Carved Wood Swing Decor', 'Malli Poo Backdrop with Kolam', 'Return Gifts Display Table'],
        setupTimeHours: 4,
      },
      'Engagement': {
        eventType: 'Engagement',
        packageName: 'Whimsical Floral Ring Backdrop',
        startingPricePaise: 5800000,
        priceDisplay: '₹58,000',
        highlights: ['Circular Floral Archway', 'Concealed LED Warm Wash Lights', 'Bridal Sofa & Footstools', 'Entrance Welcome Mirror'],
        setupTimeHours: 6,
      },
    },
    portfolio: [
      {
        id: 'port-201',
        title: 'Authentic South Indian Lotus Seemantham',
        eventType: 'Baby Shower / Seemantham',
        mediaType: 'IMAGE',
        mediaUrl: 'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&w=900&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&w=400&q=80',
        description: 'Traditional lotus cradle with jasmine strings and carved brass lamps for a serene traditional blessing.',
        venueName: 'Park Hyatt, Banjara Hills',
        guestCapacity: 180,
      },
      {
        id: 'port-202',
        title: 'Banjara Hills Garden Wedding Walkthrough',
        eventType: 'Marriage / Wedding',
        mediaType: 'VIDEO',
        mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=400&q=80',
        videoDuration: '2:15',
        description: 'Complete walkthrough of organic bamboo mandap with fresh rajnigandha hangings and candle-lit pool edge.',
        venueName: 'Hyderabad Golf Club, Golconda',
        guestCapacity: 450,
      },
      {
        id: 'port-203',
        title: 'Sunshine Village Haldi Setup',
        eventType: 'Haldi',
        mediaType: 'IMAGE',
        mediaUrl: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=900&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=400&q=80',
        description: 'Rustic wooden diwans with bright yellow marigold curtains and artisanal terracotta pots.',
        venueName: 'Private Lawn, Jubilee Hills',
        guestCapacity: 120,
      },
    ],
  },
  {
    id: 'planner-3',
    partnerId: 'PTR-EVT-103',
    name: 'Karthik Naidu',
    businessName: 'CelebrateNow Mega Events & AV Productions',
    firmName: 'CelebrateNow Events',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    coverImage: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
    city: 'Hyderabad',
    locality: 'Gachibowli',
    distanceKm: 4.2,
    experienceYears: 14,
    rating: 4.92,
    reviewCount: 380,
    completedEvents: 520,
    onTimeRate: '99.7%',
    specialties: ['Corporate Tech Conferences', 'Concert Stage & DJ Rigs', 'Mega Receptions', 'Celebrity Galas'],
    phone: '9848234567',
    email: 'karthik@celebratenow.com',
    packages: {
      'Corporate Events': {
        eventType: 'Corporate Events',
        packageName: 'Tech Summit & Global Keynote Package',
        startingPricePaise: 9500000,
        priceDisplay: '₹95,000',
        highlights: ['Ultra-HD 40-ft LED Wall', 'Line Array Concert Audio System', 'Digital Registration Touchpoints', 'Dynamic Stage Lighting Truss'],
        setupTimeHours: 10,
      },
      'Marriage / Wedding': {
        eventType: 'Marriage / Wedding',
        packageName: 'Cinematic Grand Wedding & Sangeet Package',
        startingPricePaise: 21000000,
        priceDisplay: '₹2,10,000',
        highlights: ['Dual Sangeet Stage with LED Floor', 'Hydraulic Couple Entry Platform', '40 Moving Head Beam Lights', 'Cold Pyro & Confetti Blasters'],
        setupTimeHours: 16,
      },
      'Birthday Parties': {
        eventType: 'Birthday Parties',
        packageName: 'Neon Glow & Gamer Birthday Setup',
        startingPricePaise: 3200000,
        priceDisplay: '₹32,000',
        highlights: ['UV Blacklight Neon Backdrop', 'Interactive LED Dance Floor (12x12)', 'Laser DJ Sound System', 'Custom Digital Photobooth'],
        setupTimeHours: 5,
      },
      'Wedding Reception': {
        eventType: 'Wedding Reception',
        packageName: 'Ultra-Modern Crystal Chandelier Stage',
        startingPricePaise: 15000000,
        priceDisplay: '₹1,50,000',
        highlights: ['Crystal Chandelier Hanging Canopy', 'White Gloss Acrylic Stage Floor', 'Curved Floral Wings', 'Follow-spot Intelligent Lights'],
        setupTimeHours: 12,
      },
    },
    portfolio: [
      {
        id: 'port-301',
        title: 'Tech Horizon Global Summit Stage',
        eventType: 'Corporate Events',
        mediaType: 'IMAGE',
        mediaUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=900&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=400&q=80',
        description: 'Complete AV production with 4K projection, simultaneous audio interpretation, and modular speaker podiums.',
        venueName: 'HICC Novotel, Madhapur',
        guestCapacity: 1500,
      },
      {
        id: 'port-302',
        title: 'Mega Sangeet LED Stage Walkthrough',
        eventType: 'Marriage / Wedding',
        mediaType: 'VIDEO',
        mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=400&q=80',
        videoDuration: '2:40',
        description: 'Full concert stage with interactive pixel LED dance floor and computerized beam lighting show for high-energy Sangeet night.',
        venueName: 'GMR Arena, Shamshabad',
        guestCapacity: 1800,
      },
    ],
  },
  {
    id: 'planner-4',
    partnerId: 'PTR-EVT-104',
    name: 'Zeeshan Khan',
    businessName: 'Nizamiah Royal Weddings & Gourmet Catering',
    firmName: 'Nizamiah Royal Planners',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    coverImage: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80',
    city: 'Hyderabad',
    locality: 'Secunderabad',
    distanceKm: 5.5,
    experienceYears: 16,
    rating: 4.89,
    reviewCount: 260,
    completedEvents: 410,
    onTimeRate: '99.1%',
    specialties: ['Hyderabadi Shahi Nikah', 'Live Mughlai Dum Biryani Counters', 'Mughal Dastarkhwan', 'Walima Receptions'],
    phone: '9848345678',
    email: 'zeeshan@nizamiahweddings.com',
    packages: {
      'Marriage / Wedding': {
        eventType: 'Marriage / Wedding',
        packageName: 'Shahi Mughal Nikah & Stage Package',
        startingPricePaise: 17500000,
        priceDisplay: '₹1,75,000',
        highlights: ['Arch carved Mughal Stage in Gold & Ivory', 'Chandelier Aisle Walkway with Velvet Carpets', 'Separate Gents & Ladies Partition Decor', 'Dastarkhwan Dining Setup'],
        setupTimeHours: 14,
      },
      'Wedding Reception': {
        eventType: 'Wedding Reception',
        packageName: 'Royal Walima Floral Palace Setup',
        startingPricePaise: 14000000,
        priceDisplay: '₹1,40,000',
        highlights: ['Crystal Chandelier Royal Palace Stage', 'Fresh White Lily & Hydrangea Floral Beds', 'VIP Sofa Set with Gilt Tables', 'Entrance Floral Tunnels'],
        setupTimeHours: 12,
      },
      'Engagement': {
        eventType: 'Engagement',
        packageName: 'Emerald & Gold Mangni Setup',
        startingPricePaise: 6200000,
        priceDisplay: '₹62,000',
        highlights: ['Emerald Green Velvet Backdrop with Gold Filigree', 'Warm Candlelight Pathway', 'Mirror Welcome Signboard', 'Sweet & Dry Fruit Counter Decor'],
        setupTimeHours: 6,
      },
    },
    portfolio: [
      {
        id: 'port-401',
        title: 'Shahi Mughal Palace Nikah Stage',
        eventType: 'Marriage / Wedding',
        mediaType: 'IMAGE',
        mediaUrl: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=900&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=400&q=80',
        description: 'Authentic carved Mughal archways with ivory satin drapes, gold jali screens, and opulent crystal chandeliers.',
        venueName: 'Classic Convention Three, Shamshabad',
        guestCapacity: 1400,
      },
      {
        id: 'port-402',
        title: 'Grand Royal Walima Reception Reel',
        eventType: 'Wedding Reception',
        mediaType: 'VIDEO',
        mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=400&q=80',
        videoDuration: '3:10',
        description: 'Spectacular walkthrough of 2000-guest royal banquet and dining hall with continuous floral runner tables.',
        venueName: 'Imperial Garden, Secunderabad',
        guestCapacity: 2000,
      },
    ],
  },
  {
    id: 'planner-5',
    partnerId: 'PTR-EVT-105',
    name: 'Meenakshi Iyer',
    businessName: 'Utsav Event Masters & Traditional Decor',
    firmName: 'Utsav Event Masters',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
    coverImage: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80',
    city: 'Hyderabad',
    locality: 'Madhapur',
    distanceKm: 6.8,
    experienceYears: 10,
    rating: 4.86,
    reviewCount: 190,
    completedEvents: 275,
    onTimeRate: '98.8%',
    specialties: ['Traditional South Indian Weddings', 'Kalyanam Mandaps', 'Pooja & Homam Rituals', 'Catering Coordination'],
    phone: '9848456789',
    email: 'meenakshi@utsavevents.in',
    packages: {
      'Marriage / Wedding': {
        eventType: 'Marriage / Wedding',
        packageName: 'Traditional South Kalyanam Mandap',
        startingPricePaise: 15500000,
        priceDisplay: '₹1,55,000',
        highlights: ['Thirupathi Style Wooden Carved Mandap', 'Fresh Jasmine Strings & Lotus Garlands', 'Brass Kuthuvilakku Pathway', 'Traditional Homam Altar'],
        setupTimeHours: 12,
      },
      'Pooja & Religious Functions': {
        eventType: 'Pooja & Religious Functions',
        packageName: 'Shathachandi & Satyanarayana Vratam Setup',
        startingPricePaise: 2000000,
        priceDisplay: '₹20,000',
        highlights: ['Fresh Mango Leaves & Marigold Arch', 'Traditional Peetam Decor', 'Brass Aarti Stand Set', 'Rangoli Floral Carpet'],
        setupTimeHours: 3,
      },
      'Housewarming': {
        eventType: 'Housewarming',
        packageName: 'Shubham Gruhapravesam Mandap',
        startingPricePaise: 2600000,
        priceDisplay: '₹26,000',
        highlights: ['Cow & Calf Auspicious Entry Welcome', 'Kitchen Milk Boiling Altar Flower Frame', 'Main Entrance Toran', 'Living Room Floral Centerpiece'],
        setupTimeHours: 4,
      },
      'Naming Ceremony': {
        eventType: 'Naming Ceremony',
        packageName: 'Traditional Brass Cradle Namakaranam',
        startingPricePaise: 2300000,
        priceDisplay: '₹23,000',
        highlights: ['Engraved Brass Cradle with Silk Linings', 'Flower Canopy Above Cradle', 'Malli Poo Welcome Arch', 'Bhojanam Dining Decor'],
        setupTimeHours: 4,
      },
    },
    portfolio: [
      {
        id: 'port-501',
        title: 'Traditional Temple Mandap Kalyanam',
        eventType: 'Marriage / Wedding',
        mediaType: 'IMAGE',
        mediaUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=400&q=80',
        description: 'Vedic mandap decorated with fresh Madurai malli and lotuses for a serene wedding ceremony.',
        venueName: 'Kalyana Mandapam, Madhapur',
        guestCapacity: 500,
      },
    ],
  },
  {
    id: 'planner-6',
    partnerId: 'PTR-EVT-106',
    name: 'Rajeshwari Rao',
    businessName: 'Aura Luxury Celebrations & Floral Studio',
    firmName: 'Aura Luxury Celebrations',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80',
    coverImage: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1200&q=80',
    city: 'Hyderabad',
    locality: 'Kukatpally',
    distanceKm: 8.5,
    experienceYears: 8,
    rating: 4.82,
    reviewCount: 145,
    completedEvents: 190,
    onTimeRate: '98.5%',
    specialties: ['Trendy Theme Birthdays', 'Anniversary Dinners', 'Pastel Engagements', 'Farewell & Graduation Parties'],
    phone: '9848567890',
    email: 'rajeshwari@auracelebrations.com',
    packages: {
      'Birthday Parties': {
        eventType: 'Birthday Parties',
        packageName: 'Pastel Dreamland Themed Birthday',
        startingPricePaise: 2400000,
        priceDisplay: '₹24,000',
        highlights: ['Pastel Organic Balloon Arch with Floral Sprigs', 'Custom 3D Acrylic Name Monogram', 'Sweet Treats Display Plinths', 'Children Activity Area Matting'],
        setupTimeHours: 4,
      },
      'Anniversary': {
        eventType: 'Anniversary',
        packageName: 'Enchanted Candlelight Garden Anniversary',
        startingPricePaise: 3800000,
        priceDisplay: '₹38,000',
        highlights: ['Glow-in-the-Dark Fairy Canopy', 'Rose Heart Centerpiece', 'Ambient Table Chandeliers', 'Live Violinist Platform'],
        setupTimeHours: 5,
      },
      'Engagement': {
        eventType: 'Engagement',
        packageName: 'Blush Pink & Gold Engagement Aisle',
        startingPricePaise: 5500000,
        priceDisplay: '₹55,000',
        highlights: ['Blush Pink Hydrangea Arch', 'Warm Edison Bulb Rigging', 'Mirrored Welcome Easel', 'Couple Settee with Silk Cushions'],
        setupTimeHours: 6,
      },
      'Farewell': {
        eventType: 'Farewell',
        packageName: 'Class of 2026 Retro Farewell Party',
        startingPricePaise: 2800000,
        priceDisplay: '₹28,000',
        highlights: ['Vintage Polaroids Photo Wall', 'Retro Balloon Arch & Banner', 'DJ Sound Box & Party Strobe', 'Signature Book & Memory Table'],
        setupTimeHours: 4,
      },
      'Graduation': {
        eventType: 'Graduation',
        packageName: 'Golden Honors Graduation Bash',
        startingPricePaise: 2600000,
        priceDisplay: '₹26,000',
        highlights: ['Mortarboard & Diploma Backdrop', 'Gold & Black Balloon Garland', 'Speech Podium & Mic System', 'Celebration Sparklers & Confetti'],
        setupTimeHours: 4,
      },
    },
    portfolio: [
      {
        id: 'port-601',
        title: 'Pastel Dreamland 1st Birthday Setup',
        eventType: 'Birthday Parties',
        mediaType: 'IMAGE',
        mediaUrl: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=900&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=400&q=80',
        description: 'Pastel rainbow balloon installation with customized acrylic baby name sign and cake pedestal cylinders.',
        venueName: 'ITC Kohenur, Hitec City',
        guestCapacity: 100,
      },
    ],
  },
];

export const INITIAL_EVENT_INQUIRIES: EventInquiry[] = [
  {
    id: 'EVT-INQ-1001',
    plannerId: 'planner-1',
    plannerName: 'Sandeep Varma',
    plannerBusiness: 'Grand Royal Events & Luxury Weddings',
    customerName: 'Raghavendra Rao',
    customerMobile: '9849011223',
    customerEmail: 'raghavendra.rao@gmail.com',
    eventType: 'Marriage / Wedding',
    eventDate: '2026-12-18',
    guestCount: 650,
    venueLocation: 'Taj Falaknuma Palace, Hyderabad',
    preDecidedPricePaise: 18000000,
    preDecidedPriceDisplay: '₹1,80,000',
    budgetRange: '₹2,50,000 - ₹3,50,000',
    notes: 'Looking for royal mandap setup with red and gold orchids, plus grand entryway.',
    status: 'NEW',
    createdAt: 'Today, 02:40 PM',
  },
  {
    id: 'EVT-INQ-1002',
    plannerId: 'planner-2',
    plannerName: 'Swathi Reddy',
    plannerBusiness: 'Vibha Occasions & Eco-Floral Planners',
    customerName: 'Priyanka Sharma',
    customerMobile: '9876501234',
    customerEmail: 'priyanka.sharma@yahoo.com',
    eventType: 'Haldi',
    eventDate: '2026-12-05',
    guestCount: 150,
    venueLocation: 'Private Farmhouse, Moinabad',
    preDecidedPricePaise: 3500000,
    preDecidedPriceDisplay: '₹35,000',
    budgetRange: '₹35,000 - ₹50,000',
    notes: 'Require yellow floral urli for bride and groom with dholak and folk seating setup.',
    status: 'CONTACTED',
    createdAt: 'Yesterday, 11:15 AM',
  },
  {
    id: 'EVT-INQ-1003',
    plannerId: 'planner-3',
    plannerName: 'Karthik Naidu',
    plannerBusiness: 'CelebrateNow Mega Events & AV Productions',
    customerName: 'Deepak Varma (Novartis Tech)',
    customerMobile: '9900123456',
    customerEmail: 'deepak.v@novartis.corp',
    eventType: 'Corporate Events',
    eventDate: '2026-12-22',
    guestCount: 800,
    venueLocation: 'HICC Novotel, Madhapur',
    preDecidedPricePaise: 9500000,
    preDecidedPriceDisplay: '₹95,000',
    budgetRange: '₹1,00,000 - ₹1,50,000',
    notes: 'Annual tech summit keynote stage with 40-ft LED screen and live hybrid streaming setup.',
    status: 'QUOTED',
    createdAt: '21 Nov 2026',
  },
  {
    id: 'EVT-INQ-1004',
    plannerId: 'planner-1',
    plannerName: 'Sandeep Varma',
    plannerBusiness: 'Grand Royal Events & Luxury Weddings',
    customerName: 'Kiran Kumar',
    customerMobile: '9701123456',
    customerEmail: 'kiran.k@gmail.com',
    eventType: 'Wedding Reception',
    eventDate: '2026-12-20',
    guestCount: 900,
    venueLocation: 'JRC Convention, Jubilee Hills',
    preDecidedPricePaise: 13500000,
    preDecidedPriceDisplay: '₹1,35,000',
    budgetRange: '₹1,50,000 - ₹2,00,000',
    notes: 'Curved 3D LED stage wall with low fog entrance and sofa set.',
    status: 'CONFIRMED',
    createdAt: '19 Nov 2026',
  },
];
