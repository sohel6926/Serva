import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Calendar,
  Car,
  ChefHat,
  HardHat,
  Info,
  Paintbrush,
  Sparkles,
  Sprout,
  Truck,
  Users,
  Wrench,
  MessageSquare,
} from 'lucide-react';
import { PortfolioGallery } from '../components/gallery/PortfolioGallery.tsx';
import { getServicePath } from '../components/search/SearchBar.tsx';
import { Link } from '../lib/router.tsx';
import { EnquiryModal } from '../components/common/EnquiryModal.tsx';
import { EventPlannersDirectory } from '../components/events/EventPlannersDirectory.tsx';

interface ServiceRecord {
  id: string;
  category_slug: string;
  slug: string;
  name: string;
  sub_category: string | null;
  description: string;
  base_price_paise: number;
  unit_label: string;
  image_url: string;
  online_payment_only: number;
  is_free_enquiry: number;
}

function useCategoryServices(categorySlug: string) {
  const [services, setServices] = useState<ServiceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    fetch(`/api/services?category=${encodeURIComponent(categorySlug)}`)
      .then((r) => r.json())
      .then((d) => setServices(d.services ?? []))
      .catch(() => setServices([]))
      .finally(() => setLoading(false));
  }, [categorySlug]);
  return { services, loading };
}

function CategoryHero({
  title,
  subtitle,
  image,
  ctaLabel,
  ctaTo,
  enquireLabel = 'Enquire Now',
}: {
  title: string;
  subtitle: string;
  image: string;
  ctaLabel?: string;
  ctaTo?: string;
  enquireLabel?: string;
}) {
  const [showEnquiry, setShowEnquiry] = useState(false);

  return (
    <>
      <section className="serva-card overflow-hidden relative min-h-[220px] flex items-end">
        <img
          src={image}
          alt={title}
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A1F5C]/90 via-[#0A1F5C]/55 to-black/20" />
        <div className="relative z-10 p-5 sm:p-8 text-white w-full flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <h1 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-sm">{title}</h1>
            <p className="text-sm sm:text-base text-blue-100 drop-shadow-sm">{subtitle}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {ctaLabel && ctaTo && (
              <Link
                to={ctaTo}
                className="min-h-[42px] px-5 py-2.5 rounded-full bg-white text-[#0B5FD9] font-bold text-sm inline-flex items-center gap-2 hover:bg-blue-50 shadow-md active:scale-95 transition-all"
              >
                <span>{ctaLabel}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
            <button
              type="button"
              onClick={() => setShowEnquiry(true)}
              className="min-h-[42px] px-5 py-2.5 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white border border-white/40 font-bold text-sm inline-flex items-center gap-2 shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>{enquireLabel}</span>
            </button>
          </div>
        </div>
      </section>

      <EnquiryModal
        isOpen={showEnquiry}
        onClose={() => setShowEnquiry(false)}
        initialCategory={title}
      />
    </>
  );
}

function ServiceCardMedia({
  src,
  alt,
  aspectClass = 'aspect-[16/9]',
  FallbackIcon = Wrench,
}: {
  src?: string;
  alt: string;
  aspectClass?: string;
  FallbackIcon?: React.ComponentType<{ className?: string }>;
}) {
  const [failed, setFailed] = useState(false);

  return (
    <div
      className={`${aspectClass} w-full bg-gradient-to-br from-[#EAF2FF] to-[#DCE7F9] overflow-hidden relative shrink-0`}
    >
      {src && !failed ? (
        <img
          src={src}
          alt={alt}
          referrerPolicy="no-referrer"
          loading="lazy"
          onError={() => setFailed(true)}
          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-200"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center gap-1.5 text-[#0B5FD9] p-3 text-center">
          <FallbackIcon className="w-7 h-7" />
          <span className="text-xs font-semibold text-[#0A1F5C] line-clamp-1">{alt}</span>
        </div>
      )}
    </div>
  );
}

function SeededServicesGrid({
  services,
  loading,
  hidePrice,
}: {
  services: ServiceRecord[];
  loading: boolean;
  hidePrice?: boolean;
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((k) => (
          <div key={k} className="serva-card h-64 animate-pulse bg-[#F5F9FF]" />
        ))}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {services.map((s) => (
        <Link
          key={s.id}
          to={getServicePath(s.category_slug, s.slug)}
          className="serva-card serva-card-press overflow-hidden flex flex-col hover:border-[#0B5FD9] transition-colors group"
        >
          <ServiceCardMedia src={s.image_url} alt={s.name} />
          <div className="p-5 flex-1 flex flex-col justify-between gap-3">
            <div className="space-y-1.5">
              <p className="text-xs text-[#5B6B8C]">
                {s.sub_category || s.category_slug} · Sample Listing
              </p>
              <h3 className="text-base font-bold text-[#0A1F5C]">{s.name}</h3>
              <p className="text-xs text-[#5B6B8C] leading-relaxed">{s.description}</p>
            </div>
            <div className="pt-3 border-t border-[#EAF2FF] flex items-center justify-between text-xs">
              {hidePrice || s.is_free_enquiry ? (
                <span className="font-semibold text-[#16A34A]">
                  {s.is_free_enquiry ? 'Free Enquiry · No Payment' : 'Request Quote'}
                </span>
              ) : (
                <span className="font-semibold text-[#0B5FD9] font-mono-num">
                  {s.base_price_paise > 0
                    ? `Est. ₹${Math.round(s.base_price_paise / 100).toLocaleString('en-IN')}`
                    : 'Custom Quote'}{' '}
                  · {s.unit_label}
                </span>
              )}
              <span className="font-semibold text-[#0A1F5C] inline-flex items-center gap-1">
                Open <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

/* 1. HOME SERVICES */
export function HomeServicesLandingPage() {
  const { services, loading } = useCategoryServices('home-services');

  const tiles = [
    {
      label: 'Plumbing',
      to: '/home-services/repairing',
      icon: Wrench,
      image: '/src/assets/images/svc_plumbing_1794825491603.jpg',
    },
    {
      label: 'Electrical',
      to: '/home-services/repairing',
      icon: Wrench,
      image: '/src/assets/images/svc_electrician_1794825491346.jpg',
    },
    {
      label: 'Cleaning',
      to: '/home-services/cleaning',
      icon: Sparkles,
      image: '/src/assets/images/svc_home_cleaning_1794825493004.jpg',
    },
    {
      label: 'Painting & 3D Art',
      to: '/home-services/painting',
      icon: Paintbrush,
      image: '/src/assets/images/svc_wall_painting_1794825494920.jpg',
    },
    {
      label: 'Cooking',
      to: '/home-services/cooking',
      icon: ChefHat,
      image: '/src/assets/images/svc_cooking_1794825494618.jpg',
    },
    {
      label: 'AC Service',
      to: '/home-services/repairing',
      icon: Wrench,
      image: '/src/assets/images/svc_ac_appliance_1794825492024.jpg',
    },
    {
      label: 'Appliance Repair',
      to: '/home-services/repairing',
      icon: Wrench,
      image: '/src/assets/images/svc_washing_1794825492995.jpg',
    },
    {
      label: 'Vehicle Repair',
      to: '/home-services/repairing',
      icon: Car,
      image: '/src/assets/images/svc_vehicle_repair_1794825492574.jpg',
    },
  ];

  return (
    <div className="space-y-8 pb-16">
      <CategoryHero
        title="Home Services"
        subtitle="All essential home services at your doorstep"
        image="/src/assets/images/hero_home_services_1794821794674.jpg"
        ctaLabel="Book a Service"
        ctaTo="/home-services/repairing"
      />

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-[#0A1F5C]">Choose a Home Service</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {tiles.map((tile) => (
            <Link
              key={tile.label}
              to={tile.to}
              className="serva-card serva-card-press overflow-hidden flex flex-col hover:border-[#0B5FD9] transition-colors group"
            >
              <ServiceCardMedia
                src={tile.image}
                alt={tile.label}
                aspectClass="aspect-[16/10]"
                FallbackIcon={tile.icon}
              />
              <div className="p-3.5 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#EAF2FF] text-[#0B5FD9] flex items-center justify-center shrink-0">
                  <tile.icon className="w-4 h-4" />
                </div>
                <span className="text-sm font-bold text-[#0A1F5C] leading-tight">{tile.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-[#0A1F5C]">Available Services ({services.length})</h2>
        <SeededServicesGrid services={services} loading={loading} />
      </section>

      <PortfolioGallery
        category="home-services"
        subCategory="painting"
        heading="Wall Painting & 3D Art Portfolio"
        subtitle="Browse completed painting and 3D wall art work by verified partners"
      />

      {/* Sticky Book a Service CTA */}
      <div className="fixed bottom-16 md:bottom-6 right-4 sm:right-8 z-30">
        <Link to="/home-services/repairing" className="serva-pill-btn shadow-xl">
          <span>Book a Service</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

/* 2. CONTRACTORS */
export function ContractorsLandingPage() {
  const { services, loading } = useCategoryServices('contractors');

  const sections = [
    {
      title: 'Interior Design',
      desc: 'Photos and videos of residential and commercial interiors uploaded by designers.',
      to: '/contractors/interior-design',
      image: '/src/assets/images/svc_interior_design_1794825494857.jpg',
    },
    {
      title: 'Furniture Design',
      desc: 'Chairs, Sofas, Beds, Tables, Wardrobes, and TV Units with custom build quotes.',
      to: '/contractors/furniture',
      image: '/src/assets/images/svc_furniture_design_1794825495056.jpg',
    },
    {
      title: 'Workers',
      desc: 'Book painters, masons, general labour, electricians, and carpenters by count & days.',
      to: '/contractors/workers',
      image: '/src/assets/images/svc_site_workers_1794825495047.jpg',
    },
    {
      title: 'Vehicles & Machinery',
      desc: 'Earth-moving, material transport, concrete, and road construction vehicles.',
      to: '/contractors/vehicles',
      image: '/src/assets/images/svc_jcb_machinery_1794825496052.jpg',
    },
    {
      title: 'Home Construction (Free Promotion)',
      desc: 'Explore past residential & apartment builds and send a free project enquiry.',
      to: '/contractors/home-construction',
      image: '/src/assets/images/svc_home_construction_1794825495507.jpg',
    },
  ];

  return (
    <div className="space-y-8">
      <CategoryHero
        title="Contractors"
        subtitle="Interior design, furniture, skilled site workers, heavy machinery & free home construction enquiries."
        image="/src/assets/images/hero_contractors_1794821794462.jpg"
        ctaLabel="Explore Interiors"
        ctaTo="/contractors/interior-design"
      />

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sections.map((sec) => (
          <Link
            key={sec.to}
            to={sec.to}
            className="serva-card serva-card-press overflow-hidden flex flex-col justify-between hover:border-[#0B5FD9] group"
          >
            <ServiceCardMedia src={sec.image} alt={sec.title} FallbackIcon={HardHat} />
            <div className="p-5 flex-1 flex flex-col justify-between gap-3">
              <div className="space-y-1.5">
                <h2 className="text-base font-bold text-[#0A1F5C]">{sec.title}</h2>
                <p className="text-xs text-[#5B6B8C] leading-relaxed">{sec.desc}</p>
              </div>
              <span className="text-xs font-semibold text-[#0B5FD9] inline-flex items-center gap-1">
                Open Section <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </Link>
        ))}
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-[#0A1F5C]">Contractors Directory ({services.length})</h2>
        <SeededServicesGrid services={services} loading={loading} />
      </section>

      <PortfolioGallery
        category="contractors"
        heading="Interior, Furniture & Construction Gallery"
        subtitle="Inspect designer and contractor photos & project walkthrough videos"
      />
    </div>
  );
}

/* 3. EVENTS */
const EVENT_TYPES = [
  'Marriage / Wedding',
  'Birthday Parties',
  'Haldi',
  'Engagement',
  'Anniversary',
  'Wedding Reception',
  'Pooja & Religious Functions',
  'Baby Shower / Seemantham',
  'Naming Ceremony',
  'Housewarming',
  'Farewell',
  'Graduation',
  'Retirement',
  'Corporate Events',
  'Family Gatherings',
  'Cultural Programmes',
];

const OTHER_EVENT_SERVICES = [
  'Anchors & Emcees',
  'Invitation Cards',
  'Event Planning',
  'Stage & Tent',
  'Generator',
  'Security',
  'Registration',
  'Valet Parking',
  'Return Gifts',
  'LED Screens & Live Streaming',
  'Fireworks (subject to permissions)',
  'Photo Booths',
  'Makeup Artists',
  'Mehndi Artists',
  'Content Creators',
  'Guest Accommodation',
];

export function EventsLandingPage() {
  const { services, loading } = useCategoryServices('events');
  const [selectedEventType, setSelectedEventType] = useState(EVENT_TYPES[0]);

  return (
    <div className="space-y-8">
      <CategoryHero
        title="Events"
        subtitle="Book one individual specialist or combine multiple launch services into one event quotation."
        image="/src/assets/images/hero_events_1794821796128.jpg"
        ctaLabel="Multi-Service Event Planner"
        ctaTo="/events/plan"
      />

      {/* Event Type Picker */}
      <section className="serva-card p-5 sm:p-6 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="text-lg font-bold text-[#0A1F5C]">1. Select Your Event Type</h2>
          <span className="text-xs font-semibold text-[#0B5FD9]">Selected: {selectedEventType}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {EVENT_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setSelectedEventType(type)}
              className={`min-h-[38px] px-3.5 rounded-full text-xs font-semibold border cursor-pointer ${
                selectedEventType === type
                  ? 'bg-[#0B5FD9] text-white border-[#0B5FD9]'
                  : 'bg-white text-[#0A1F5C] border-[#DCE7F9] hover:bg-[#F5F9FF]'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </section>

      {/* Verified Nearby Event Planners, Portfolios & Pre-Decided Event Packages */}
      <EventPlannersDirectory selectedEventType={selectedEventType} />

      {/* Six Launch Services (DJ is standalone with no subcategories) */}
      <section className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-xl font-bold text-[#0A1F5C]">2. Six Launch Event Services</h2>
          <Link to="/events/plan" className="text-sm font-semibold text-[#0B5FD9] hover:underline">
            Combine multiple services in one quote →
          </Link>
        </div>
        <SeededServicesGrid services={services} loading={loading} />
      </section>

      {/* Secondary More Event Services */}
      <section className="serva-card p-5 sm:p-6 space-y-3">
        <h2 className="text-base font-bold text-[#0A1F5C]">More Event Services (Add-ons)</h2>
        <p className="text-xs text-[#5B6B8C]">
          Available as add-ons alongside our six main launch services:
        </p>
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-[#0A1F5C]">
          {OTHER_EVENT_SERVICES.map((item, i) => (
            <span key={item}>
              {i > 0 && <span className="text-[#DCE7F9] mr-4">·</span>}
              {item}
            </span>
          ))}
        </div>
      </section>

      {/* Advance Payment Notice */}
      <div className="serva-card p-5 bg-[#EAF2FF]/60 flex items-start gap-3">
        <Calendar className="w-5 h-5 text-[#0B5FD9] shrink-0 mt-0.5" />
        <div className="text-xs text-[#0A1F5C] space-y-1">
          <p className="font-bold">Advance Payment Policy</p>
          <p className="text-[#5B6B8C]">
            No advance payment = No confirmed booking. Default schedule: 30% advance at booking,
            40% before the event milestone, and 30% after completion.
          </p>
        </div>
      </div>

      <PortfolioGallery
        category="events"
        heading="Event Decoration & Live DJ Reels"
        subtitle="Watch live DJ performance reels and mandap setup showcases"
      />
    </div>
  );
}

/* 4. AGRICULTURE */
export function AgricultureLandingPage() {
  const { services, loading } = useCategoryServices('agriculture');

  const entryPaths = [
    {
      num: '01',
      title: 'Book Agricultural Workers',
      desc: 'Hire individual farm workers or teams of 5, 10, 20, or custom counts.',
      to: '/agriculture/workers',
      icon: Users,
      image: '/src/assets/images/svc_agri_workers_1794825499110.jpg',
    },
    {
      num: '02',
      title: 'Book Agricultural Services',
      desc: 'Land preparation, harvesting, drone spraying, weeding, irrigation, dairy & sorting.',
      to: '/agriculture/services',
      icon: Sprout,
      image: '/src/assets/images/svc_agri_drone_irrigation_1794825499973.jpg',
    },
    {
      num: '03',
      title: 'Rent Agricultural Machinery',
      desc: 'Tractors, land levellers, combine harvesters, agricultural drones & sprayers.',
      to: '/agriculture/machinery',
      icon: TractorIcon,
      image: '/src/assets/images/svc_agri_tractor_harvest_1794825499106.jpg',
    },
  ];

  return (
    <div className="space-y-8">
      <CategoryHero
        title="Agriculture"
        subtitle="Connect with verified agricultural worker teams, farm service specialists, and machinery owners."
        image="/src/assets/images/hero_agriculture_1794821795928.jpg"
        ctaLabel="Book Farm Services"
        ctaTo="/agriculture/services"
      />

      {/* Three Main Entry Options */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-[#0A1F5C]">Three Ways to Book</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {entryPaths.map((path) => (
            <Link
              key={path.to}
              to={path.to}
              className="serva-card serva-card-press overflow-hidden flex flex-col justify-between hover:border-[#16A34A] group"
            >
              <ServiceCardMedia src={path.image} alt={path.title} FallbackIcon={path.icon} />
              <div className="p-5 flex-1 flex flex-col justify-between gap-3">
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-[#16A34A]">{path.num}</span>
                  <h3 className="text-lg font-bold text-[#0A1F5C]">{path.title}</h3>
                  <p className="text-xs text-[#5B6B8C] leading-relaxed">{path.desc}</p>
                </div>
                <span className="text-sm font-semibold text-[#16A34A] inline-flex items-center gap-1">
                  Continue <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-[#0A1F5C]">
          Agriculture Services & Machinery ({services.length})
        </h2>
        <SeededServicesGrid services={services} loading={loading} />
      </section>
    </div>
  );
}

function TractorIcon({ className }: { className?: string }) {
  return <Sprout className={className} />;
}

/* 5. MOVING AND SHIFTING */
export function MovingLandingPage() {
  const { services, loading } = useCategoryServices('moving');

  // Strictly 7 main services + Individual Item add-on
  const mainSeven = services.filter((s) => s.sub_category === 'main').slice(0, 7);
  const individualAddon = services.find((s) => s.slug === 'individual-item');

  return (
    <div className="space-y-8">
      <CategoryHero
        title="Moving and Shifting"
        subtitle="Verified moving workers, packing teams, and combined loading & unloading."
        image="/src/assets/images/hero_moving_1794821795552.jpg"
        ctaLabel="Start Shifting Quote"
        ctaTo="/moving/home-shifting"
      />

      {/* Critical No-Vehicle Notice */}
      <div
        role="note"
        className="serva-card p-5 bg-amber-50 border-amber-200 flex items-start gap-3"
      >
        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-sm text-[#0A1F5C] space-y-1">
          <p className="font-bold">Important Notice: SERVA Does Not Provide Vehicles</p>
          <p className="text-xs text-[#5B6B8C] leading-relaxed">
            SERVA connects you with verified packing, loading, and shifting teams only. Customers
            arrange their own transport vehicle independently. There are zero vehicle rentals or
            vehicle charges on SERVA.
          </p>
        </div>
      </div>

      {/* Exactly Seven Main Services */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-[#0A1F5C]">Seven Moving & Shifting Services</h2>
        <SeededServicesGrid services={mainSeven} loading={loading} />
      </section>

      {/* Individual Item Shifting Add-on */}
      {individualAddon && (
        <section className="serva-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-[#0B5FD9]">Add-on Service</p>
            <h3 className="text-lg font-bold text-[#0A1F5C]">{individualAddon.name}</h3>
            <p className="text-sm text-[#5B6B8C]">{individualAddon.description}</p>
          </div>
          <Link to="/moving/individual-item" className="serva-pill-btn shrink-0">
            <span>Book Individual Item</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </section>
      )}
    </div>
  );
}

/* Sub-route Detail Page for Phase 2 (every tile opens a real page with portfolio / details) */
export function SubServiceDetailPage({
  categoryTitle,
  categoryPath,
  subTitle,
  description,
  portfolioCategory,
  portfolioSubCategory,
  notice,
  bookTo,
}: {
  categoryTitle: string;
  categoryPath: string;
  subTitle: string;
  description: string;
  portfolioCategory?: string;
  portfolioSubCategory?: string;
  notice?: string;
  bookTo?: string;
}) {
  return (
    <div className="space-y-6">
      <div className="serva-card p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2 text-xs text-[#5B6B8C]">
          <Link to={categoryPath} className="text-[#0B5FD9] font-semibold hover:underline">
            {categoryTitle}
          </Link>
          <span>/</span>
          <span>{subTitle}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#0A1F5C]">{subTitle}</h1>
        <p className="text-sm sm:text-base text-[#5B6B8C] max-w-2xl">{description}</p>
        {notice && (
          <div className="p-4 rounded-xl bg-[#EAF2FF] border border-[#C7DCFF] flex items-start gap-2.5 text-xs text-[#0A1F5C]">
            <Info className="w-4 h-4 text-[#0B5FD9] shrink-0 mt-0.5" />
            <span>{notice}</span>
          </div>
        )}
        <div className="pt-2 flex flex-wrap gap-3">
          {bookTo && (
            <Link to={bookTo} className="serva-pill-btn">
              <span>Book Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
          <Link to={categoryPath} className="min-h-[44px] px-5 py-2.5 rounded-full border border-[#DCE7F9] text-sm font-semibold text-[#0A1F5C] hover:bg-[#F5F9FF] inline-flex items-center gap-2">
            Back to {categoryTitle}
          </Link>
        </div>
      </div>

      {portfolioCategory && (
        <PortfolioGallery
          category={portfolioCategory}
          subCategory={portfolioSubCategory}
          heading={`${subTitle} — Verified Portfolio`}
        />
      )}
    </div>
  );
}
