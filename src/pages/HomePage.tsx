import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  Calendar,
  ChevronLeft,
  ChevronRight,
  HardHat,
  Headphones,
  Home,
  LayoutGrid,
  ShieldCheck,
  Sprout,
  Tag,
  Truck,
  Wallet,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { Link } from '../lib/router.tsx';
import { getServicePath, SearchBar } from '../components/search/SearchBar.tsx';

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
    title: 'One Platform for All Your Service Needs',
    subtitle: 'Trusted Home Services, Contractors, Events, Agriculture & Moving teams.',
    image: '/src/assets/images/hero_home_services_1794821794674.jpg',
    to: '/home-services',
    cta: 'Explore Home Services',
  },
  {
    title: 'Weddings, Birthdays & Live DJ Events',
    subtitle: 'Book individual specialists or a complete multi-vendor event package.',
    image: '/src/assets/images/hero_events_1794821796128.jpg',
    to: '/events',
    cta: 'Plan an Event',
  },
  {
    title: 'Agricultural Workers & Tractor Rentals',
    subtitle: 'Book farm labour teams, drone spraying, harvesting, and machinery.',
    image: '/src/assets/images/hero_agriculture_1794821795928.jpg',
    to: '/agriculture',
    cta: 'Explore Agriculture',
  },
];

const SAMPLE_TESTIMONIALS = [
  {
    name: 'Srinivas Rao',
    city: 'Madhapur, Hyderabad',
    service: 'Home Services · Electrical',
    quote:
      'Booked an electrician for switchboard repair. Upfront estimated price matched the final receipt with zero surprises.',
  },
  {
    name: 'Divya & Karthik',
    city: 'Jubilee Hills, Hyderabad',
    service: 'Events · Decoration & DJ',
    quote:
      'Booked our Sangeet decorator and standalone DJ on one quotation. Paying the 30% advance locked both teams immediately.',
  },
  {
    name: 'Venkatesh Reddy',
    city: 'Miryalaguda, Nalgonda',
    service: 'Agriculture · Paddy Harvesting',
    quote:
      'Requested a combine harvester and 10 farm workers for 5 acres. Tracking arrival and completion photos was effortless.',
  },
];

export function HomePage() {
  const { user, language, t } = useAuth();
  const [slideIdx, setSlideIdx] = useState(0);
  const [categories, setCategories] = useState<HomeCategory[]>([]);
  const [popular, setPopular] = useState<PopularService[]>([]);
  const [offers, setOffers] = useState<OfferItem[]>([]);

  useEffect(() => {
    fetch('/api/home-data')
      .then((r) => r.json())
      .then((d) => {
        setCategories(d.categories ?? []);
        setPopular(d.popularServices ?? []);
        setOffers(d.offers ?? []);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIdx((i) => (i + 1) % BANNER_SLIDES.length);
    }, 6500);
    return () => clearInterval(timer);
  }, []);

  const currentSlide = BANNER_SLIDES[slideIdx];

  const categoryTiles = [
    {
      to: '/home-services',
      label: t('homeServices'),
      sub: 'Cleaning · Electrical · Plumbing · Cooking · Painting · Repairing',
      icon: Home,
      bg: 'bg-blue-50',
      fg: 'text-[#0B5FD9]',
      image: '/src/assets/images/hero_home_services_1794821794674.jpg',
    },
    {
      to: '/contractors',
      label: t('contractors'),
      sub: 'Interior Design · Construction · Heavy Machinery · Skilled Labour',
      icon: HardHat,
      bg: 'bg-amber-50',
      fg: 'text-amber-600',
      image: '/src/assets/images/hero_contractors_1794821794462.jpg',
    },
    {
      to: '/events',
      label: t('events'),
      sub: 'Weddings · DJ & Sound · Catering · Photography · Decoration',
      icon: Calendar,
      bg: 'bg-purple-50',
      fg: 'text-purple-600',
      image: '/src/assets/images/hero_events_1794821796128.jpg',
    },
    {
      to: '/agriculture',
      label: t('agriculture'),
      sub: 'Farm Labour · Drone Spraying · Tractor Rentals · Harvesting',
      icon: Sprout,
      bg: 'bg-green-50',
      fg: 'text-green-600',
      image: '/src/assets/images/hero_agriculture_1794821795928.jpg',
    },
    {
      to: '/moving',
      label: t('moving'),
      sub: 'Home Shifting · Office Relocation · Packing · Loading & Unloading',
      icon: Truck,
      bg: 'bg-orange-50',
      fg: 'text-orange-600',
      image: '/src/assets/images/hero_moving_1794821795552.jpg',
    },
    {
      to: '/services',
      label: t('moreServices'),
      sub: 'Browse all categories · Special packages · Verified professionals',
      icon: LayoutGrid,
      bg: 'bg-slate-100',
      fg: 'text-slate-700',
      image: '/src/assets/images/svc_wall_painting_1794825494920.jpg',
    },
  ];

  return (
    <div className="space-y-10">
      {/* Greeting + Search + Rotating Banner */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-6 serva-card p-6 sm:p-8 flex flex-col justify-between gap-6">
          <div className="space-y-3">
            <p className="text-xs font-semibold text-[#0B5FD9]">
              SERVA: Multiple Services Provider · {t('brandTagline')}
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#0A1F5C] leading-tight">
              {user
                ? `Hi, ${user.name} 👋 ${t('heroGreetingUserSuffix')}`
                : t('heroGreetingGuest')}
            </h1>
            <p className="text-sm sm:text-base text-[#5B6B8C] leading-relaxed">
              {t('heroSubcopy')}
            </p>
          </div>

          <SearchBar />

          <div className="flex flex-wrap items-center gap-3">
            <Link to="/services" className="serva-pill-btn">
              <span>{t('bookService')}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/partner/register"
              className="min-h-[44px] px-5 py-2.5 rounded-full border border-[#DCE7F9] text-sm font-semibold text-[#0A1F5C] hover:bg-[#F5F9FF] inline-flex items-center gap-1.5"
            >
              <span>{t('becomePartnerTitle')}</span>
            </Link>
          </div>
        </div>

        {/* Rotating Visual Banner */}
        <div className="lg:col-span-6 serva-card overflow-hidden relative min-h-[280px] flex flex-col justify-end">
          <img
            src={currentSlide.image}
            alt={currentSlide.title}
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A1F5C]/90 via-[#0A1F5C]/45 to-transparent" />
          <div className="relative z-10 p-6 sm:p-8 text-white space-y-3">
            <p className="text-xs font-semibold text-blue-200">{t('heroBannerTitle')}</p>
            <h2 className="text-2xl font-bold text-white leading-snug">{currentSlide.title}</h2>
            <p className="text-sm text-blue-100 max-w-lg">{currentSlide.subtitle}</p>
            <div className="flex items-center justify-between pt-2">
              <Link
                to={currentSlide.to}
                className="min-h-[42px] px-5 py-2 rounded-full bg-white text-[#0B5FD9] text-sm font-semibold inline-flex items-center gap-1.5 hover:bg-blue-50"
              >
                <span>{currentSlide.cta}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label="Previous slide"
                  onClick={() =>
                    setSlideIdx((i) => (i - 1 + BANNER_SLIDES.length) % BANNER_SLIDES.length)
                  }
                  className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  aria-label="Next slide"
                  onClick={() => setSlideIdx((i) => (i + 1) % BANNER_SLIDES.length)}
                  className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* All 6 Category Big Cards — always visible, full detail */}
      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-bold text-[#0A1F5C]">{t('categoriesTitle')}</h2>
          <Link to="/services" className="text-sm font-semibold text-[#0B5FD9] hover:underline inline-flex items-center gap-1">
            {t('ourServicesLink')} <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {categoryTiles.map((tile) => (
            <Link
              key={tile.to}
              to={tile.to}
              className="serva-card serva-card-press overflow-hidden flex flex-col hover:border-[#0B5FD9] transition-colors group"
            >
              {/* Big image */}
              <div className="aspect-[16/9] bg-[#EAF2FF] overflow-hidden relative">
                <img
                  src={tile.image}
                  alt={tile.label}
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500"
                />
                {/* Category icon badge */}
                <div className={`absolute top-3 left-3 w-9 h-9 rounded-xl ${tile.bg} ${tile.fg} flex items-center justify-center shadow-sm`}>
                  <tile.icon className="w-5 h-5" />
                </div>
              </div>
              {/* Card body */}
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
            <Link to="/search" className="text-sm font-semibold text-[#0B5FD9] hover:underline">
              {t('browseAllLink')}
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {popular.map((svc) => (
              <Link
                key={svc.id}
                to={getServicePath(svc.category_slug, svc.slug)}
                className="serva-card serva-card-press overflow-hidden flex flex-col hover:border-[#0B5FD9] transition-colors group"
              >
                <div className="aspect-[16/9] bg-[#EAF2FF] overflow-hidden">
                  <img
                    src={svc.image_url}
                    alt={svc.name}
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-200"
                  />
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between gap-3">
                  <div>
                    <p className="text-xs text-[#5B6B8C]">{svc.category_name} · Sample</p>
                    <h3 className="text-base font-bold text-[#0A1F5C] mt-1">{svc.name}</h3>
                    <p className="text-xs text-[#5B6B8C] mt-1 line-clamp-2">{svc.description}</p>
                  </div>
                  <div className="pt-3 border-t border-[#EAF2FF] flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#0B5FD9] font-mono-num">
                      {svc.base_price_paise > 0
                        ? `Est. ₹${Math.round(svc.base_price_paise / 100).toLocaleString('en-IN')}`
                        : 'Free / Custom'}{' '}
                      · {svc.unit_label}
                    </span>
                    <ArrowRight className="w-4 h-4 text-[#0A1F5C]" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Offers Strip */}
      {offers.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold text-[#0A1F5C]">{t('offersTitle')}</h2>
            <Link to="/offers" className="text-sm font-semibold text-[#0B5FD9] hover:underline">
              {t('allOffersLink')}
            </Link>
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

      {/* Trust Badges + Sample Testimonials */}
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
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#0A1F5C]">{t('customerStoriesTitle')}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {SAMPLE_TESTIMONIALS.map((item) => (
              <div key={item.name} className="serva-card p-5 flex flex-col justify-between gap-3">
                <p className="text-xs text-[#0A1F5C] leading-relaxed">"{item.quote}"</p>
                <div className="pt-2 border-t border-[#EAF2FF]">
                  <p className="text-xs font-bold text-[#0A1F5C]">{item.name}</p>
                  <p className="text-[11px] text-[#5B6B8C]">
                    {item.city} · {item.service}
                  </p>
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
        <Link
          to="/partner/register"
          className="min-h-[48px] px-7 py-3 rounded-full bg-white text-[#0B5FD9] font-bold text-sm inline-flex items-center gap-2 hover:bg-blue-50 shrink-0"
        >
          <span>{t('registerNow')}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
}
