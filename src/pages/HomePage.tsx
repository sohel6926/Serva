import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  Calendar,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  HardHat,
  Headphones,
  Home,
  LayoutGrid,
  Search,
  ShieldCheck,
  Sprout,
  Tag,
  Truck,
  Users,
  Wallet,
  Wrench,
  Zap,
  MessageSquare,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { Link, useRouter } from '../lib/router.tsx';
import { getServicePath } from '../components/search/SearchBar.tsx';
import { EnquiryModal } from '../components/common/EnquiryModal.tsx';
import {
  HomeServicesIllustration,
  ConstructionIllustration,
  AgricultureIllustration,
  EventIllustration,
  MovingIllustration,
} from '../components/home/ServiceIllustrations.tsx';

interface HomeCategory {
  id: string;
  slug: string;
  name: string;
  name_te: string;
  tagline: string;
  hero_image: string;
  service_count: number;
}

interface PopularService {
  id: string;
  category_slug: string;
  category_name: string;
  slug: string;
  name: string;
  description: string;
  base_price_paise: number;
  unit_label: string;
  image_url: string;
}

interface OfferItem {
  id: string;
  code: string;
  title: string;
  description: string;
  category_slug: string;
}

const BANNER_SLIDES = [
  {
    title: 'Agricultural Workers & Tractor Rentals',
    subtitle: 'Book farm labour teams, drone spraying, harvesting, and machinery.',
    image: '/src/assets/images/hero_agriculture_1794821795928.jpg',
    to: '/agriculture',
    cta: 'Book Now',
  },
  {
    title: 'Weddings, Birthdays & Live DJ Events',
    subtitle: 'Book individual specialists or a complete multi-vendor event package.',
    image: '/src/assets/images/hero_events_1794821796128.jpg',
    to: '/events',
    cta: 'Plan an Event',
  },
  {
    title: 'Home Services at Your Doorstep',
    subtitle: 'Trusted cleaning, electrical, plumbing, cooking and more.',
    image: '/src/assets/images/hero_home_services_1794821794674.jpg',
    to: '/home-services',
    cta: 'Explore',
  },
];

/* Mobile service grid tiles — 5 core categories */
const MOBILE_SERVICE_TILES = [
  {
    to: '/home-services',
    label: 'Home\nServices',
    Illustration: HomeServicesIllustration,
    bg: 'bg-[#E1F4FF]',
  },
  {
    to: '/contractors',
    label: 'Construction\nServices',
    Illustration: ConstructionIllustration,
    bg: 'bg-[#EEF4FF]',
  },
  {
    to: '/agriculture',
    label: 'Agriculture\nServices',
    Illustration: AgricultureIllustration,
    bg: 'bg-[#EAF9F1]',
  },
  {
    to: '/events',
    label: 'Event\nServices',
    Illustration: EventIllustration,
    bg: 'bg-[#F6EFFF]',
  },
  {
    to: '/moving',
    label: 'Moving &\nShifting',
    Illustration: MovingIllustration,
    bg: 'bg-[#EDF5FF]',
  },
];

/* Desktop big category tiles */
const DESKTOP_TILES = [
  {
    to: '/home-services',
    label: 'Home Services',
    sub: 'Cleaning · Electrical · Plumbing · Cooking · Painting',
    icon: Home,
    bg: 'bg-blue-50',
    fg: 'text-[#0B5FD9]',
    image: '/src/assets/images/hero_home_services_1794821794674.jpg',
  },
  {
    to: '/contractors',
    label: 'Contractors',
    sub: 'Interior Design · Construction · Heavy Machinery · Skilled Labour',
    icon: HardHat,
    bg: 'bg-amber-50',
    fg: 'text-amber-600',
    image: '/src/assets/images/hero_contractors_1794821794462.jpg',
  },
  {
    to: '/events',
    label: 'Events',
    sub: 'Weddings · DJ & Sound · Catering · Photography · Decoration',
    icon: Calendar,
    bg: 'bg-purple-50',
    fg: 'text-purple-600',
    image: '/src/assets/images/hero_events_1794821796128.jpg',
  },
  {
    to: '/agriculture',
    label: 'Agriculture',
    sub: 'Farm Labour · Drone Spraying · Tractor Rentals · Harvesting',
    icon: Sprout,
    bg: 'bg-green-50',
    fg: 'text-green-600',
    image: '/src/assets/images/hero_agriculture_1794821795928.jpg',
  },
  {
    to: '/moving',
    label: 'Moving & Shifting',
    sub: 'Home Shifting · Office Relocation · Packing · Loading & Unloading',
    icon: Truck,
    bg: 'bg-orange-50',
    fg: 'text-orange-600',
    image: '/src/assets/images/hero_moving_1794821795552.jpg',
  },
  {
    to: '/services',
    label: 'More Services',
    sub: 'Browse all categories · Special packages · Verified professionals',
    icon: LayoutGrid,
    bg: 'bg-slate-100',
    fg: 'text-slate-700',
    image: '/src/assets/images/svc_wall_painting_1794825494920.jpg',
  },
];

const ALL_SERVICE_CARDS = [
  {
    id: 'hs-cleaning',
    name: 'Home Deep Cleaning',
    category: 'Home Services',
    categorySlug: 'home-services',
    to: '/home-services/cleaning',
    image: '/src/assets/images/svc_home_cleaning_1794825493004.jpg',
    price: '₹1,499',
    unit: 'starts at',
    tagline: 'Deep cleaning for rooms, kitchen & bathroom',
  },
  {
    id: 'hs-electrician',
    name: 'Electrician & Wiring',
    category: 'Home Services',
    categorySlug: 'home-services',
    to: '/home-services/repairing',
    image: '/src/assets/images/svc_electrician_1794825491346.jpg',
    price: '₹250',
    unit: 'per visit',
    tagline: 'Switchboards, fans, lights & appliances',
  },
  {
    id: 'hs-plumbing',
    name: 'Plumbing & Pipe Repair',
    category: 'Home Services',
    categorySlug: 'home-services',
    to: '/home-services/repairing',
    image: '/src/assets/images/svc_plumbing_1794825491603.jpg',
    price: '₹299',
    unit: 'per visit',
    tagline: 'Tap repair, leak fixes & motor installation',
  },
  {
    id: 'hs-ac',
    name: 'AC Cleaning & Service',
    category: 'Home Services',
    categorySlug: 'home-services',
    to: '/home-services/repairing',
    image: '/src/assets/images/svc_ac_appliance_1794825492024.jpg',
    price: '₹499',
    unit: 'starts at',
    tagline: 'Filter wash, gas check & cooling inspection',
  },
  {
    id: 'con-construction',
    name: 'Civil & Home Construction',
    category: 'Construction',
    categorySlug: 'contractors',
    to: '/contractors',
    image: '/src/assets/images/svc_home_construction_1794825495507.jpg',
    price: 'Free Enquiry',
    unit: 'consultation',
    tagline: 'Site inspection, blueprinting & turnkey builds',
  },
  {
    id: 'con-machinery',
    name: 'JCB & Earth Excavators',
    category: 'Construction',
    categorySlug: 'contractors',
    to: '/contractors',
    image: '/src/assets/images/svc_jcb_machinery_1794825496052.jpg',
    price: '₹1,500',
    unit: 'per hour',
    tagline: 'Earth digging, debris clearing & ground leveling',
  },
  {
    id: 'con-interior',
    name: 'Interior Design & Modular',
    category: 'Construction',
    categorySlug: 'contractors',
    to: '/contractors',
    image: '/src/assets/images/svc_interior_design_1794825494857.jpg',
    price: 'Custom Quote',
    unit: 'per room',
    tagline: 'False ceiling, modular kitchen & wardrobe 3D designs',
  },
  {
    id: 'agri-tractor',
    name: 'Tractor Rental & Rotavator',
    category: 'Agriculture',
    categorySlug: 'agriculture',
    to: '/agriculture',
    image: '/src/assets/images/svc_agri_tractor_harvest_1794825499106.jpg',
    price: '₹1,200',
    unit: 'per hour',
    tagline: 'Ploughing, tilling & harvesting machinery',
  },
  {
    id: 'agri-drone',
    name: 'Drone Crop Spraying',
    category: 'Agriculture',
    categorySlug: 'agriculture',
    to: '/agriculture',
    image: '/src/assets/images/svc_agri_drone_irrigation_1794825499973.jpg',
    price: '₹450',
    unit: 'per acre',
    tagline: 'Fast, uniform pesticide & fertilizer spray',
  },
  {
    id: 'agri-workers',
    name: 'Farm Labour Teams',
    category: 'Agriculture',
    categorySlug: 'agriculture',
    to: '/agriculture',
    image: '/src/assets/images/svc_agri_workers_1794825499110.jpg',
    price: '₹500',
    unit: 'per worker/day',
    tagline: 'Weeding, transplanting, harvesting & loading',
  },
  {
    id: 'evt-decor',
    name: 'Wedding & Event Decoration',
    category: 'Events',
    categorySlug: 'events',
    to: '/events',
    image: '/src/assets/images/svc_event_decor_1794825496811.jpg',
    price: 'Custom Quote',
    unit: 'full setup',
    tagline: 'Stage backdrop, flower decor & lighting',
  },
  {
    id: 'evt-dj',
    name: 'Live DJ & Sound System',
    category: 'Events',
    categorySlug: 'events',
    to: '/events',
    image: '/src/assets/images/svc_event_dj_1794825498947.jpg',
    price: '₹12,000',
    unit: 'per event',
    tagline: 'Concert speakers, bass subwoofers & DJ setup',
  },
  {
    id: 'evt-catering',
    name: 'Party & Function Catering',
    category: 'Events',
    categorySlug: 'events',
    to: '/events',
    image: '/src/assets/images/svc_event_catering_1794825497630.jpg',
    price: '₹250',
    unit: 'per plate',
    tagline: 'Veg & non-veg buffet menu with live counters',
  },
  {
    id: 'mov-home',
    name: 'Home Shifting & Packers',
    category: 'Moving & Shifting',
    categorySlug: 'moving',
    to: '/moving',
    image: '/src/assets/images/svc_moving_shifting_1794825499341.jpg',
    price: 'Est. ₹3,500',
    unit: 'base quote',
    tagline: 'Safe wrapping, loading, transport & unboxing',
  },
  {
    id: 'rep-vehicle',
    name: 'Vehicle Repair & Towing',
    category: 'Repair',
    categorySlug: 'home-services',
    to: '/home-services/repairing',
    image: '/src/assets/images/svc_vehicle_repair_1794825492574.jpg',
    price: '₹450',
    unit: 'starts at',
    tagline: 'Two-wheeler & car doorstep mechanic support',
  },
  {
    id: 'man-workers',
    name: 'Skilled Manpower Labour',
    category: 'Manpower',
    categorySlug: 'contractors',
    to: '/contractors',
    image: '/src/assets/images/svc_site_workers_1794825495047.jpg',
    price: '₹750',
    unit: 'per day',
    tagline: 'Helpers, masons, carpenters & painters',
  },
];

const SAMPLE_TESTIMONIALS = [
  {
    name: 'Srinivas Rao',
    city: 'Madhapur, Hyderabad',
    service: 'Home Services · Electrical',
    quote: 'Booked an electrician for switchboard repair. Upfront estimated price matched the final receipt with zero surprises.',
  },
  {
    name: 'Divya & Karthik',
    city: 'Jubilee Hills, Hyderabad',
    service: 'Events · Decoration & DJ',
    quote: 'Booked our Sangeet decorator and standalone DJ on one quotation. Paying the 30% advance locked both teams immediately.',
  },
  {
    name: 'Venkatesh Reddy',
    city: 'Miryalaguda, Nalgonda',
    service: 'Agriculture · Paddy Harvesting',
    quote: 'Requested a combine harvester and 10 farm workers for 5 acres. Tracking arrival and completion photos was effortless.',
  },
];

export function HomePage() {
  const { user, language, t } = useAuth();
  const { navigate } = useRouter();
  const [slideIdx, setSlideIdx] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [popular, setPopular] = useState<PopularService[]>([]);
  const [offers, setOffers] = useState<OfferItem[]>([]);
  const [showBannerEnquiry, setShowBannerEnquiry] = useState(false);

  useEffect(() => {
    fetch('/api/home-data')
      .then((r) => r.json())
      .then((d) => {
        setPopular(d.popularServices ?? []);
        setOffers(d.offers ?? []);
      })
      .catch(() => { });
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIdx((i) => (i + 1) % BANNER_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const currentSlide = BANNER_SLIDES[slideIdx];

  const displayedServices = selectedCategory === 'ALL'
    ? ALL_SERVICE_CARDS
    : ALL_SERVICE_CARDS.filter((s) => s.categorySlug === selectedCategory);

  return (
    <div className="space-y-0 md:space-y-10">

      {/* ═══════════════════════════════════════════════
       *  MOBILE LAYOUT  (hidden on md+)
       * ═══════════════════════════════════════════════ */}
      <div className="md:hidden -mx-3 space-y-4 pb-6">

        {/* ── Search Bar (directly below header) ── */}
        <div className="mx-3">
          <form
            onSubmit={(e) => { e.preventDefault(); if (searchQuery.trim()) navigate(`/search?q=${encodeURIComponent(searchQuery)}`); }}
            className="flex items-center gap-2.5 bg-white/95 backdrop-blur-md border border-[#D5E3FA] hover:border-[#0B5FD9]/50 transition-colors rounded-full pl-3.5 pr-1.5 py-1.5 shadow-[0_4px_18px_rgba(11,95,217,0.08)]"
          >
            <div className="w-8 h-8 rounded-full bg-[#EBF4FE] flex items-center justify-center text-[#0B5FD9] shrink-0 shadow-inner">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for services, e.g. Tractor, Electrician..."
              className="flex-1 text-xs sm:text-sm text-[#0A1F5C] placeholder-[#8A9BB8] bg-transparent outline-none font-medium"
            />
            <button
              type="submit"
              className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#0B5FD9] to-[#1E6FE8] text-white text-xs font-bold shadow-sm shadow-blue-500/25 active:scale-95 transition-all cursor-pointer"
            >
              Search
            </button>
          </form>
        </div>

        {/* ── Hero Card matching mockup ── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#E6F0FE] via-[#F2F7FE] to-[#DDEBFD] mx-3 rounded-3xl min-h-[205px] flex flex-col justify-between p-4.5 border border-white/80 shadow-[0_10px_30px_rgba(11,95,217,0.08)]">
          {/* Subtle Ambient Decorative Glow Orbs */}
          <div className="absolute -top-12 -left-12 w-40 h-40 bg-blue-400/15 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-8 left-1/3 w-32 h-32 bg-indigo-300/15 rounded-full blur-2xl pointer-events-none" />

          {/* Badge & Text */}
          <div className="z-10 relative">
            <span className="inline-flex items-center gap-1.5 bg-white/95 backdrop-blur-sm border border-[#D5E3FA] shadow-[0_2px_10px_rgba(11,95,217,0.06)] text-[#0B5FD9] text-[10.5px] font-bold px-3 py-1 rounded-full mb-2">
              <span className="text-[#0B5FD9] text-xs">✦</span> Multiple Services Platform
            </span>

            {/* Headline */}
            <h1 className="text-[21px] min-[375px]:text-[23px] font-extrabold text-[#0A1F5C] leading-[1.18] max-w-[62%] tracking-tight">
              All Your Service Needs <br />
              in <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0B5FD9] to-[#084299]">One Platform</span>
            </h1>

            {/* Subtext */}
            <p className="text-[11px] text-[#55698C] mt-2 max-w-[58%] leading-relaxed font-medium">
              Book verified experts for Home, Construction, Events, Agriculture & Shifting.
            </p>

            {/* Micro Social-Proof / Trust Capsule */}
            <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/85 backdrop-blur-md border border-white/80 shadow-sm text-[10px] font-bold text-[#0A1F5C]">
              <span className="text-amber-500 text-xs">★</span>
              <span>4.9</span>
              <span className="text-[#94A3B8]">·</span>
              <span className="text-[#55698C] font-semibold">10,000+ Happy Bookings</span>
            </div>
          </div>

          {/* Serviceman with blue swoosh & verified badge — right side */}
          <div className="absolute right-0 bottom-0 top-0 h-full w-[46%] pointer-events-none flex items-end justify-end">
            <img
              src="/src/assets/images/mobile_hero_serviceman.png"
              alt="SERVA Verified Professional"
              className="h-[205px] w-auto object-contain object-bottom drop-shadow-[0_8px_16px_rgba(11,95,217,0.15)]"
            />
          </div>
        </section>

        {/* ── Explore Our Services (5 core categories) ── */}
        <section className="mx-3">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-1.5">
              <h2 className="text-base font-extrabold text-[#0A1F5C]">Explore Our Services</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EBF4FE] text-[#0B5FD9]">
                5 Core
              </span>
            </div>
            <Link to="/services" className="text-xs font-semibold text-[#0B5FD9] inline-flex items-center gap-0.5 hover:underline">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
            {MOBILE_SERVICE_TILES.map((tile) => (
              <Link
                key={tile.label}
                to={tile.to}
                className="flex flex-col items-center group active:scale-95 transition-all"
              >
                {/* Ultra-crisp vector illustration card with subtle sheen and shadow */}
                <div className={`w-full aspect-[1/0.88] rounded-2xl ${tile.bg} overflow-hidden shadow-[0_4px_12px_rgba(11,95,217,0.06)] border border-white p-1 flex items-center justify-center relative group-hover:shadow-[0_6px_18px_rgba(11,95,217,0.14)] group-hover:-translate-y-0.5 transition-all duration-200`}>
                  <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-black/[0.02] pointer-events-none" />
                  <tile.Illustration />
                </div>
                {/* Label */}
                <p className="text-[9.5px] min-[375px]:text-[10px] font-bold text-[#0A1F5C] text-center leading-[1.15] whitespace-pre-line mt-1.5 group-hover:text-[#0B5FD9] transition-colors">
                  {tile.label}
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Promotional Banner Carousel ── */}
        <section className="mx-3">
          <div className="relative rounded-3xl overflow-hidden min-h-[190px] shadow-[0_8px_26px_rgba(11,95,217,0.12)] border border-white bg-slate-950">
            <img
              src={currentSlide.image}
              alt={currentSlide.title}
              className="absolute inset-0 w-full h-full object-cover object-center transition-all duration-700 ease-out"
            />
            {/* Elegant dark scrim for text clarity without masking the image */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/35 to-transparent" />

            {/* On-Banner Stories-Style Progress Line in frosted capsule */}
            <div className="absolute top-2.5 left-3.5 right-3.5 z-20 flex gap-1.5 p-1 rounded-full bg-black/25 backdrop-blur-md border border-white/10">
              {BANNER_SLIDES.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSlideIdx(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className="flex-1 h-1 rounded-full overflow-hidden bg-white/30 cursor-pointer relative"
                >
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      i === slideIdx
                        ? 'w-full bg-white shadow-sm'
                        : i < slideIdx
                        ? 'w-full bg-white/60'
                        : 'w-0 bg-white'
                    }`}
                  />
                </button>
              ))}
            </div>

            <div className="relative z-10 p-4 sm:p-5 pt-7 h-full flex flex-col justify-end min-h-[190px]">
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-white text-[10px] font-bold border border-white/25 mb-1.5 shadow-sm">
                  ★ Featured Special
                </span>
                <h3 className="text-base sm:text-lg font-extrabold text-white leading-tight drop-shadow-md">
                  {currentSlide.title}
                </h3>
                <p className="text-white/90 text-[11px] sm:text-xs mt-1 line-clamp-2 leading-relaxed drop-shadow-sm max-w-[95%] font-medium">
                  {currentSlide.subtitle}
                </p>
              </div>
              <div className="pt-3 flex flex-wrap items-center gap-2">
                <Link
                  to={currentSlide.to}
                  className="inline-flex items-center gap-1.5 bg-white text-[#0A1F5C] text-xs font-extrabold px-4 py-2 rounded-full shadow-lg shadow-black/20 hover:bg-slate-50 active:scale-95 transition-all"
                >
                  <span>{currentSlide.cta}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#0A1F5C]" />
                </Link>
                <button
                  type="button"
                  onClick={() => setShowBannerEnquiry(true)}
                  className="inline-flex items-center gap-1.5 bg-gradient-to-r from-[#0B5FD9] to-[#1E6FE8] text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg shadow-blue-600/30 border border-white/25 hover:from-blue-700 hover:to-blue-600 active:scale-95 transition-all cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Enquire Now</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ── Services Cards of Each Service (below banner) ── */}
        <section className="mx-3 space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-[#0A1F5C]">All Doorstep Services</h2>
              <p className="text-[11px] text-[#55698C] font-medium">Verified professionals with upfront transparent pricing</p>
            </div>
            <Link to="/services" className="text-xs font-semibold text-[#0B5FD9] inline-flex items-center gap-0.5 hover:underline">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Category Filter Pills */}
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-3 px-3 scrollbar-hide snap-x">
            {[
              { id: 'ALL', label: 'All Services' },
              { id: 'home-services', label: 'Home Services' },
              { id: 'contractors', label: 'Construction' },
              { id: 'agriculture', label: 'Agriculture' },
              { id: 'events', label: 'Events' },
              { id: 'moving', label: 'Moving' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`snap-start shrink-0 min-h-[34px] px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-gradient-to-r from-[#0B5FD9] to-[#1A6DE5] text-white shadow-md shadow-blue-500/25 scale-[1.02]'
                    : 'bg-white border border-[#DCE7F9] text-[#475569] hover:bg-[#F1F6FF] shadow-sm'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* 2-Column Grid of Service Cards */}
          <div className="grid grid-cols-2 gap-3">
            {displayedServices.map((svc) => (
              <Link
                key={svc.id}
                to={svc.to}
                className="bg-white rounded-2xl border border-[#E4EEFC] overflow-hidden shadow-[0_4px_14px_rgba(11,95,217,0.05)] hover:shadow-[0_8px_24px_rgba(11,95,217,0.12)] hover:border-[#0B5FD9]/30 flex flex-col justify-between group active:scale-[0.98] transition-all"
              >
                {/* Image with category badge */}
                <div className="relative aspect-[16/11] bg-[#F1F6FF] overflow-hidden">
                  <img
                    src={svc.image}
                    alt={svc.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <span className="absolute top-2 left-2 bg-white/95 backdrop-blur-md text-[#0A1F5C] text-[9px] font-extrabold px-2 py-0.5 rounded-full shadow-sm border border-white/60">
                    {svc.category}
                  </span>
                  <div className="absolute bottom-1.5 left-2 bg-black/60 backdrop-blur-md text-white text-[8.5px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                    <span className="text-amber-400">★</span> 4.9 · Verified
                  </div>
                </div>

                {/* Details */}
                <div className="p-3 flex-1 flex flex-col justify-between gap-2.5">
                  <div>
                    <h3 className="text-xs font-bold text-[#0A1F5C] leading-snug line-clamp-1 group-hover:text-[#0B5FD9] transition-colors">
                      {svc.name}
                    </h3>
                    <p className="text-[10px] text-[#55698C] leading-tight line-clamp-2 mt-1">
                      {svc.tagline}
                    </p>
                  </div>

                  {/* Price & Action Button */}
                  <div className="pt-2 border-t border-[#F1F6FF] flex items-center justify-between gap-1">
                    <div className="min-w-0">
                      <p className="text-[9px] text-[#8A9BB8] leading-none truncate font-medium">{svc.unit}</p>
                      <p className="text-xs font-extrabold text-[#0B5FD9] leading-tight mt-0.5">{svc.price}</p>
                    </div>
                    <span className="shrink-0 min-h-[26px] px-2.5 rounded-full bg-gradient-to-r from-[#0B5FD9] to-[#1A6DE5] text-white text-[10px] font-bold inline-flex items-center gap-1 shadow-sm shadow-blue-500/20 group-hover:shadow-md transition-all">
                      Book <ArrowRight className="w-2.5 h-2.5" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>

      {/* ═══════════════════════════════════════════════
       *  DESKTOP LAYOUT  (hidden on mobile)
       * ═══════════════════════════════════════════════ */}
      <div className="hidden md:block space-y-10">

        {/* Hero */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-6 serva-card p-6 sm:p-8 flex flex-col justify-between gap-6">
            <div className="space-y-3">
              <p className="text-xs font-semibold text-[#0B5FD9]">
                SERVA: Multiple Services Provider · {t('brandTagline')}
              </p>
              <h1 className="text-3xl sm:text-4xl font-bold text-[#0A1F5C] leading-tight">
                {user ? `Hi, ${user.name} 👋 ${t('heroGreetingUserSuffix')}` : t('heroGreetingGuest')}
              </h1>
              <p className="text-sm sm:text-base text-[#5B6B8C] leading-relaxed">{t('heroSubcopy')}</p>
            </div>

            {/* Desktop search */}
            <form
              onSubmit={(e) => { e.preventDefault(); if (searchQuery.trim()) navigate(`/search?q=${encodeURIComponent(searchQuery)}`); }}
              className="flex items-center gap-3 bg-[#F5F9FF] border border-[#DCE7F9] rounded-full px-4 py-3"
            >
              <Search className="w-4 h-4 text-[#94A3B8] shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for services..."
                className="flex-1 text-sm bg-transparent outline-none text-[#0A1F5C] placeholder-[#94A3B8]"
              />
            </form>

            <div className="flex flex-wrap items-center gap-3">
              <Link to="/services" className="serva-pill-btn">
                <span>{t('bookService')}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/partner/register"
                className="min-h-[44px] px-5 py-2.5 rounded-full border border-[#DCE7F9] text-sm font-semibold text-[#0A1F5C] hover:bg-[#F5F9FF] inline-flex items-center gap-1.5"
              >
                {t('becomePartnerTitle')}
              </Link>
            </div>
          </div>

          {/* Rotating Banner */}
          <div className="lg:col-span-6 serva-card overflow-hidden relative min-h-[280px] flex flex-col justify-end">
            <img src={currentSlide.image} alt={currentSlide.title} referrerPolicy="no-referrer" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A1F5C]/90 via-[#0A1F5C]/45 to-transparent" />
            <div className="relative z-10 p-6 sm:p-8 text-white space-y-3">
              <h2 className="text-2xl font-bold text-white leading-snug">{currentSlide.title}</h2>
              <p className="text-sm text-blue-100 max-w-lg">{currentSlide.subtitle}</p>
              <div className="flex items-center justify-between pt-2">
                <Link to={currentSlide.to} className="min-h-[42px] px-5 py-2 rounded-full bg-white text-[#0B5FD9] text-sm font-semibold inline-flex items-center gap-1.5 hover:bg-blue-50">
                  <span>{currentSlide.cta}</span> <ArrowRight className="w-4 h-4" />
                </Link>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setSlideIdx((i) => (i - 1 + BANNER_SLIDES.length) % BANNER_SLIDES.length)} className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center cursor-pointer">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button type="button" onClick={() => setSlideIdx((i) => (i + 1) % BANNER_SLIDES.length)} className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center cursor-pointer">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold text-[#0A1F5C]">{t('categoriesTitle')}</h2>
            <Link to="/services" className="text-sm font-semibold text-[#0B5FD9] hover:underline inline-flex items-center gap-1">
              {t('ourServicesLink')} <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {DESKTOP_TILES.map((tile) => (
              <Link key={tile.to} to={tile.to} className="serva-card serva-card-press overflow-hidden flex flex-col hover:border-[#0B5FD9] transition-colors group">
                <div className="aspect-[16/9] bg-[#EAF2FF] overflow-hidden relative">
                  <img src={tile.image} alt={tile.label} referrerPolicy="no-referrer" loading="lazy" className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500" />
                  <div className={`absolute top-3 left-3 w-9 h-9 rounded-xl ${tile.bg} ${tile.fg} flex items-center justify-center shadow-sm`}>
                    <tile.icon className="w-5 h-5" />
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-[#0A1F5C] leading-snug">{tile.label}</h3>
                    <p className="text-sm text-[#5B6B8C] mt-1">{tile.sub}</p>
                  </div>
                  <span className="text-sm font-semibold text-[#0B5FD9] inline-flex items-center gap-1 pt-2 border-t border-[#EAF2FF]">
                    {t('exploreLabel')} <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Popular Services */}
        {popular.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-bold text-[#0A1F5C]">{t('popularTitle')}</h2>
              <Link to="/search" className="text-sm font-semibold text-[#0B5FD9] hover:underline">{t('browseAllLink')}</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {popular.map((svc) => (
                <Link key={svc.id} to={getServicePath(svc.category_slug, svc.slug)} className="serva-card serva-card-press overflow-hidden flex flex-col hover:border-[#0B5FD9] transition-colors group">
                  <div className="aspect-[16/9] bg-[#EAF2FF] overflow-hidden">
                    <img src={svc.image_url} alt={svc.name} referrerPolicy="no-referrer" loading="lazy" className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-200" />
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between gap-3">
                    <div>
                      <p className="text-xs text-[#5B6B8C]">{svc.category_name}</p>
                      <h3 className="text-base font-bold text-[#0A1F5C] mt-1">{svc.name}</h3>
                      <p className="text-xs text-[#5B6B8C] mt-1 line-clamp-2">{svc.description}</p>
                    </div>
                    <div className="pt-3 border-t border-[#EAF2FF] flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#0B5FD9] font-mono-num">
                        {svc.base_price_paise > 0 ? `Est. ₹${Math.round(svc.base_price_paise / 100).toLocaleString('en-IN')}` : 'Free / Custom'} · {svc.unit_label}
                      </span>
                      <ArrowRight className="w-4 h-4 text-[#0A1F5C]" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Offers */}
        {offers.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-bold text-[#0A1F5C]">{t('offersTitle')}</h2>
              <Link to="/offers" className="text-sm font-semibold text-[#0B5FD9] hover:underline">{t('allOffersLink')}</Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {offers.map((offer) => (
                <div key={offer.id} className="serva-card p-5 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#EAF2FF] text-[#0B5FD9] flex items-center justify-center shrink-0">
                    <Tag className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-mono-num font-bold text-[#0B5FD9]">{offer.code}</p>
                    <h3 className="text-sm font-bold text-[#0A1F5C] mt-0.5">{offer.title}</h3>
                    <p className="text-xs text-[#5B6B8C] mt-1">{offer.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* How It Works */}
        <section className="serva-card p-6 sm:p-8 space-y-6">
          <h2 className="text-xl sm:text-2xl font-bold text-[#0A1F5C]">{t('howItWorksTitle')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: t('step1Title'), desc: t('step1Desc') },
              { title: t('step2Title'), desc: t('step2Desc') },
              { title: t('step3Title'), desc: t('step3Desc') },
              { title: t('step4Title'), desc: t('step4Desc') },
            ].map((step) => (
              <div key={step.title} className="space-y-1.5">
                <h3 className="text-base font-bold text-[#0B5FD9]">{step.title}</h3>
                <p className="text-sm text-[#5B6B8C] leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Trust + Testimonials */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 serva-card p-6 space-y-4">
            <h2 className="text-xl font-bold text-[#0A1F5C]">{t('trustTitle')}</h2>
            <div className="space-y-4 pt-1">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-[#16A34A] shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-[#0A1F5C]">{t('verifiedPartnersTitle')}</h3>
                  <p className="text-xs text-[#5B6B8C]">{t('verifiedPartnersDesc')}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Wallet className="w-5 h-5 text-[#0B5FD9] shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-[#0A1F5C]">{t('transparentPricingTitle')}</h3>
                  <p className="text-xs text-[#5B6B8C]">{t('transparentPricingDesc')}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Headphones className="w-5 h-5 text-[#0B5FD9] shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-[#0A1F5C]">{t('dedicatedSupportTitle')}</h3>
                  <p className="text-xs text-[#5B6B8C]">{t('dedicatedSupportDesc')}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-7 space-y-4">
            <h2 className="text-xl font-bold text-[#0A1F5C]">{t('customerStoriesTitle')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {SAMPLE_TESTIMONIALS.map((item) => (
                <div key={item.name} className="serva-card p-5 flex flex-col justify-between gap-3">
                  <p className="text-xs text-[#0A1F5C] leading-relaxed">"{item.quote}"</p>
                  <div className="pt-2 border-t border-[#EAF2FF]">
                    <p className="text-xs font-bold text-[#0A1F5C]">{item.name}</p>
                    <p className="text-[11px] text-[#5B6B8C]">{item.city} · {item.service}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Partner CTA */}
        <section className="rounded-3xl bg-gradient-to-r from-[#0A1F5C] via-[#0B5FD9] to-[#1E88FF] text-white p-6 sm:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <p className="text-xs font-semibold text-blue-200">{t('becomePartnerTitle')}</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">{t('partnerCtaHeading')}</h2>
            <p className="text-sm text-blue-100">{t('partnerCtaDesc')}</p>
          </div>
          <Link to="/partner/register" className="min-h-[48px] px-7 py-3 rounded-full bg-white text-[#0B5FD9] font-bold text-sm inline-flex items-center gap-2 hover:bg-blue-50 shrink-0">
            <span>{t('registerNow')}</span> <ArrowRight className="w-4 h-4" />
          </Link>
        </section>
      </div>

      <EnquiryModal
        isOpen={showBannerEnquiry}
        onClose={() => setShowBannerEnquiry(false)}
        initialCategory={currentSlide.title}
      />
    </div>
  );
}
