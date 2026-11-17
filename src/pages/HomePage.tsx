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
  Mic,
  Search,
  ShieldCheck,
  Sprout,
  Tag,
  Truck,
  Users,
  Wallet,
  Wrench,
  Zap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { Link, useRouter } from '../lib/router.tsx';
import { getServicePath } from '../components/search/SearchBar.tsx';

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

/* Mobile service grid tiles — 4 × 2 layout matching design mockup */
const MOBILE_SERVICE_TILES = [
  {
    to: '/home-services',
    label: 'Home\nServices',
    image: '/src/assets/images/tile_home_services.png',
  },
  {
    to: '/contractors',
    label: 'Construction\nServices',
    image: '/src/assets/images/tile_construction.png',
  },
  {
    to: '/agriculture',
    label: 'Agriculture\nServices',
    image: '/src/assets/images/tile_agriculture.png',
  },
  {
    to: '/events',
    label: 'Event\nServices',
    image: '/src/assets/images/tile_events.png',
  },
  {
    to: '/moving',
    label: 'Moving &\nShifting',
    image: '/src/assets/images/tile_moving.png',
  },
  {
    to: '/home-services/repairing',
    label: 'Repair &\nMaintenance',
    image: '/src/assets/images/tile_repair.png',
  },
  {
    to: '/contractors',
    label: 'Manpower\nServices',
    image: '/src/assets/images/tile_manpower.png',
  },
  {
    to: '/services',
    label: 'More\nServices',
    image: '/src/assets/images/tile_more.png',
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
  const [popular, setPopular] = useState<PopularService[]>([]);
  const [offers, setOffers] = useState<OfferItem[]>([]);

  useEffect(() => {
    fetch('/api/home-data')
      .then((r) => r.json())
      .then((d) => {
        setPopular(d.popularServices ?? []);
        setOffers(d.offers ?? []);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIdx((i) => (i + 1) % BANNER_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const currentSlide = BANNER_SLIDES[slideIdx];

  return (
    <div className="space-y-0 md:space-y-10">

      {/* ═══════════════════════════════════════════════
       *  MOBILE LAYOUT  (hidden on md+)
       * ═══════════════════════════════════════════════ */}
      <div className="md:hidden -mx-3 space-y-3.5 pb-4">

        {/* ── Hero Card matching mockup ── */}
        <section className="relative overflow-hidden bg-gradient-to-b from-[#EBF3FE] via-[#F4F8FE] to-white mx-3 rounded-3xl min-h-[195px] flex flex-col justify-between p-4.5 border border-[#E2EEFE]">
          {/* Badge & Text */}
          <div className="z-10">
            <span className="inline-flex items-center gap-1.5 bg-white/90 border border-[#DCE7F9] shadow-[0_2px_8px_rgba(11,95,217,0.06)] text-[#0B5FD9] text-[11px] font-semibold px-3 py-1 rounded-full mb-2.5">
              <span className="text-[#0B5FD9]">✦</span> Multiple Services Provider
            </span>
            {/* Headline */}
            <h1 className="text-[21px] font-extrabold text-[#0A1F5C] leading-tight max-w-[62%]">
              All Your Service Needs <br />
              in <span className="text-[#0B5FD9]">One Platform</span>
            </h1>
            {/* Subtext */}
            <p className="text-[11px] text-[#5B6B8C] mt-2 max-w-[58%] leading-relaxed">
              Book trusted services for your Home, Construction, Events, Agriculture, Moving & Shifting and more.
            </p>
          </div>

          {/* Serviceman with blue swoosh & verified badge — right side */}
          <div className="absolute right-0 bottom-0 top-1 h-full w-[46%] pointer-events-none flex items-end justify-end">
            <img
              src="/src/assets/images/mobile_hero_serviceman.png"
              alt="SERVA Verified Professional"
              className="h-[195px] w-auto object-contain object-bottom"
            />
          </div>
        </section>

        {/* ── Search Bar ── */}
        <div className="mx-3">
          <form
            onSubmit={(e) => { e.preventDefault(); if (searchQuery.trim()) navigate(`/search?q=${encodeURIComponent(searchQuery)}`); }}
            className="flex items-center gap-3 bg-white border border-[#DCE7F9] rounded-full px-4 py-2.5 shadow-[0_2px_12px_rgba(11,95,217,0.06)]"
          >
            <Search className="w-4 h-4 text-[#64748B] shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for services, e.g. Tractor Rental"
              className="flex-1 text-xs sm:text-sm text-[#0A1F5C] placeholder-[#94A3B8] bg-transparent outline-none font-medium"
            />
            <button type="button" aria-label="Voice search" className="w-8 h-8 rounded-full bg-[#F0F6FF] flex items-center justify-center text-[#0B5FD9] shrink-0 cursor-pointer">
              <Mic className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* ── CTA Buttons ── */}
        <div className="mx-3 grid grid-cols-2 gap-3">
          <Link
            to="/services"
            className="flex items-center justify-center gap-2 min-h-[46px] rounded-full bg-[#0B5FD9] hover:bg-[#094FB6] text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-500/25 active:scale-95 transition-transform"
          >
            <Calendar className="w-4 h-4" />
            <span>Book a Service</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            to="/partner/register"
            className="flex items-center justify-center gap-2 min-h-[46px] rounded-full border border-[#DCE7F9] bg-white text-[#0A1F5C] text-xs sm:text-sm font-bold shadow-sm active:scale-95 transition-transform"
          >
            {/* Handshake icon */}
            <svg className="w-4 h-4 text-[#0B5FD9]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.5 14.5L19 16l-1.5-1.5M4 10l5 5 3-3 4 4" /><path d="M9.5 7.5L12 5l4.5 4.5-3 3" /><path d="M5 14l1.5 1.5L8 14" />
            </svg>
            <span>Become a Partner</span>
          </Link>
        </div>

        {/* ── Trust Strip ── */}
        <div className="mx-3 bg-white rounded-2xl border border-[#EBF2FE] shadow-[0_2px_10px_rgba(11,95,217,0.04)] p-3">
          <div className="grid grid-cols-4 gap-1 text-center divide-x divide-slate-100">
            {/* 1. Verified Providers */}
            <div className="flex flex-col items-center gap-1.5 py-0.5 px-0.5">
              <div className="w-7 h-7 rounded-full bg-[#EBF4FE] flex items-center justify-center text-[#0B5FD9]">
                <ShieldCheck className="w-4 h-4 text-[#0B5FD9] fill-[#0B5FD9]/20" />
              </div>
              <p className="text-[9.5px] font-semibold text-[#0A1F5C] leading-tight">Verified<br/>Providers</p>
            </div>
            {/* 2. Fast & Easy Booking */}
            <div className="flex flex-col items-center gap-1.5 py-0.5 px-0.5">
              <div className="w-7 h-7 rounded-full bg-[#EBF4FE] flex items-center justify-center text-[#0B5FD9]">
                <Zap className="w-4 h-4 text-[#0B5FD9] fill-current" />
              </div>
              <p className="text-[9.5px] font-semibold text-[#0A1F5C] leading-tight">Fast &<br/>Easy Booking</p>
            </div>
            {/* 3. Transparent Pricing */}
            <div className="flex flex-col items-center gap-1.5 py-0.5 px-0.5">
              <div className="w-7 h-7 rounded-full bg-[#0B5FD9] flex items-center justify-center text-white">
                <span className="text-xs font-bold leading-none">₹</span>
              </div>
              <p className="text-[9.5px] font-semibold text-[#0A1F5C] leading-tight">Transparent<br/>Pricing</p>
            </div>
            {/* 4. Dedicated Support */}
            <div className="flex flex-col items-center gap-1.5 py-0.5 px-0.5">
              <div className="w-7 h-7 rounded-full bg-[#EBF4FE] flex items-center justify-center text-[#0B5FD9]">
                <Headphones className="w-4 h-4 text-[#0B5FD9]" />
              </div>
              <p className="text-[9.5px] font-semibold text-[#0A1F5C] leading-tight">Dedicated<br/>Support</p>
            </div>
          </div>
        </div>

        {/* ── Explore Our Services (4 × 2 grid matching mockup) ── */}
        <section className="mx-3">
          <div className="flex items-center justify-between mb-2.5">
            <h2 className="text-base font-bold text-[#0A1F5C]">Explore Our Services</h2>
            <Link to="/services" className="text-xs font-semibold text-[#0B5FD9] inline-flex items-center gap-0.5">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid grid-cols-4 gap-2.5">
            {MOBILE_SERVICE_TILES.map((tile) => (
              <Link
                key={tile.label}
                to={tile.to}
                className="flex flex-col items-center group active:scale-95 transition-transform"
              >
                {/* Illustration card matching mockup */}
                <div className="w-full aspect-[1/0.8] rounded-2xl overflow-hidden shadow-[0_2px_8px_rgba(11,95,217,0.05)] border border-slate-100">
                  <img
                    src={tile.image}
                    alt={tile.label}
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Label */}
                <p className="text-[10px] font-semibold text-[#0A1F5C] text-center leading-tight whitespace-pre-line mt-1.5">
                  {tile.label}
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Promotional Banner Carousel matching mockup ── */}
        <section className="mx-3">
          <div className="relative rounded-2xl overflow-hidden min-h-[160px] shadow-sm border border-slate-100">
            <img
              src="/src/assets/images/hero_agriculture_1794821795928.jpg"
              alt={currentSlide.title}
              className="absolute inset-0 w-full h-full object-cover object-right"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white via-white/85 to-transparent max-w-[75%]" />
            <div className="relative z-10 p-4 h-full flex flex-col justify-between min-h-[160px] max-w-[68%]">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-[#0A1F5C] leading-snug">
                  {currentSlide.title}
                </h3>
                <p className="text-[10px] sm:text-[11px] text-[#5B6B8C] mt-1 line-clamp-2 leading-relaxed">
                  {currentSlide.subtitle}
                </p>
              </div>
              <div className="pt-3">
                <Link
                  to={currentSlide.to}
                  className="inline-flex items-center gap-1.5 bg-white border border-[#DCE7F9] text-[#0A1F5C] text-xs font-bold px-3.5 py-1.5 rounded-full shadow-sm hover:bg-slate-50"
                >
                  <span>{currentSlide.cta}</span>
                  <ArrowRight className="w-3 h-3 text-[#0A1F5C]" />
                </Link>
              </div>
            </div>
          </div>

          {/* Dots Indicator matching mockup */}
          <div className="flex items-center justify-center gap-1.5 mt-3">
            {BANNER_SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setSlideIdx(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`rounded-full transition-all ${
                  i === slideIdx
                    ? 'w-5 h-1.5 bg-[#0B5FD9]'
                    : 'w-1.5 h-1.5 bg-slate-300'
                }`}
              />
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
    </div>
  );
}
