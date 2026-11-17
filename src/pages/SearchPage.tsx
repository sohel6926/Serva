import React, { useEffect, useState } from 'react';
import { ArrowRight, CheckCircle2, Flame, Search } from 'lucide-react';
import { Link, useRouter } from '../lib/router.tsx';
import { getServicePath, SearchBar } from '../components/search/SearchBar.tsx';

interface SearchService {
  id: string;
  category_slug: string;
  category_name: string;
  slug: string;
  name: string;
  description: string;
  base_price_paise: number;
  unit_label: string;
  image_url: string;
  is_free_enquiry: number;
}

interface SearchPartner {
  id: string;
  business_name: string;
  service_area: string;
  experience_years: number;
  rating_avg: number;
  bio: string;
}

interface PopularWork {
  id: string;
  name: string;
  category: string;
  price: string;
  badge: string;
  to: string;
  image: string;
}

const POPULAR_SEARCHED_WORKS: PopularWork[] = [
  {
    id: 'pop-1',
    name: 'Electrician & Switchboard Repair',
    category: 'Home Services',
    price: '₹250 per visit',
    badge: '⚡ Urgent / Same Day',
    to: '/home-services/repairing',
    image: '/src/assets/images/svc_electrician_1794825491346.jpg',
  },
  {
    id: 'pop-2',
    name: 'Kitchen & Bathroom Plumbing',
    category: 'Home Services',
    price: '₹200 per visit',
    badge: '🔧 Tap & Leakage Repair',
    to: '/home-services/repairing',
    image: '/src/assets/images/svc_plumbing_1794825491603.jpg',
  },
  {
    id: 'pop-3',
    name: 'Tractor & Land Leveller Rental',
    category: 'Agriculture',
    price: '₹1,200 / hr',
    badge: '🚜 With Experienced Operator',
    to: '/agriculture/machinery',
    image: '/src/assets/images/svc_agri_tractor_harvest_1794825499106.jpg',
  },
  {
    id: 'pop-4',
    name: 'JCB & Excavator Hire',
    category: 'Contractors',
    price: '₹1,800 / hr',
    badge: '🏗️ Earthmoving & Levelling',
    to: '/contractors/vehicles',
    image: '/src/assets/images/svc_jcb_machinery_1794825496052.jpg',
  },
  {
    id: 'pop-5',
    name: 'DJ & Sound System Setup',
    category: 'Events',
    price: '₹12,000 / event',
    badge: '🎉 Sound + Lighting Rig',
    to: '/events/dj',
    image: '/src/assets/images/svc_event_dj_1794825498947.jpg',
  },
  {
    id: 'pop-6',
    name: 'Home Shifting (1 & 2 BHK)',
    category: 'Moving & Shifting',
    price: '₹3,500 base',
    badge: '📦 Skilled Shifting Helpers',
    to: '/moving/home-shifting',
    image: '/src/assets/images/svc_moving_shifting_1794825499341.jpg',
  },
];

function PopularSearchedSection() {
  return (
    <section className="space-y-3.5 pt-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 shadow-sm">
            <Flame className="w-4 h-4 fill-orange-500" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#0A1F5C]">Most Popularly Searched</h2>
            <p className="text-xs text-[#5B6B8C]">Frequently booked works across SERVA</p>
          </div>
        </div>
        <Link
          to="/services"
          className="text-xs font-semibold text-[#0B5FD9] inline-flex items-center gap-0.5 hover:underline"
        >
          View All <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="grid grid-cols-1 min-[420px]:grid-cols-2 sm:grid-cols-3 gap-3">
        {POPULAR_SEARCHED_WORKS.map((work) => (
          <Link
            key={work.id}
            to={work.to}
            className="group bg-white rounded-2xl border border-[#EBF2FE] shadow-[0_2px_8px_rgba(11,95,217,0.05)] hover:border-[#0B5FD9] hover:shadow-[0_4px_16px_rgba(11,95,217,0.12)] overflow-hidden flex flex-col transition-all active:scale-[0.98]"
          >
            <div className="relative aspect-[16/10] bg-[#F1F6FF] overflow-hidden">
              <img
                src={work.image}
                alt={work.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <span className="absolute top-2 left-2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-sm text-[#0A1F5C] shadow-sm">
                {work.category}
              </span>
            </div>
            <div className="p-3.5 flex-1 flex flex-col justify-between gap-2.5">
              <div>
                <h3 className="text-sm font-bold text-[#0A1F5C] group-hover:text-[#0B5FD9] transition-colors line-clamp-1">
                  {work.name}
                </h3>
                <p className="text-[11px] text-[#5B6B8C] mt-0.5 font-medium line-clamp-1">
                  {work.badge}
                </p>
              </div>
              <div className="pt-2 border-t border-[#F1F6FF] flex items-center justify-between text-xs">
                <span className="font-bold text-[#0B5FD9] text-xs">
                  {work.price}
                </span>
                <span className="text-[11px] font-semibold text-[#0B5FD9] group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-0.5">
                  Book <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function SearchPage() {
  const { search } = useRouter();
  const q = new URLSearchParams(search).get('q') ?? '';
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<SearchService[]>([]);
  const [partners, setPartners] = useState<SearchPartner[]>([]);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/search?q=${encodeURIComponent(q)}`)
      .then((r) => r.json())
      .then((d) => {
        setServices(d.services ?? []);
        setPartners(d.partners ?? []);
      })
      .catch(() => {
        setServices([]);
        setPartners([]);
      })
      .finally(() => setLoading(false));
  }, [q]);

  const formatPrice = (paise: number, free: number) => {
    if (free) return 'Free Enquiry';
    if (paise <= 0) return 'Custom Quote';
    return `Est. ₹${Math.round(paise / 100).toLocaleString('en-IN')}`;
  };

  return (
    <div className="space-y-6">
      <div className="serva-card p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2 text-sm text-[#5B6B8C]">
          <Search className="w-4 h-4 text-[#0B5FD9]" />
          <span>{q ? `Search results for "${q}"` : 'Browse SERVA Services'}</span>
        </div>
        <SearchBar initialQuery={q} />
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="text-[#5B6B8C] py-1">Quick searches:</span>
          {['electrician', 'DJ', 'tractor', 'painting', 'shifting'].map((term) => (
            <Link
              key={term}
              to={`/search?q=${encodeURIComponent(term)}`}
              className="px-3 py-1 rounded-full bg-[#EAF2FF] text-[#0B5FD9] font-semibold hover:bg-[#DCE7F9]"
            >
              {term}
            </Link>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((k) => (
            <div key={k} className="serva-card h-56 animate-pulse bg-[#F5F9FF]" />
          ))}
        </div>
      ) : services.length === 0 && partners.length === 0 ? (
        <div className="space-y-6">
          <div className="serva-card p-6 sm:p-8 text-center space-y-3">
            <h2 className="text-lg font-bold text-[#0A1F5C]">
              {q ? `No matching services found for "${q}"` : 'Browse Services by Popular Demand'}
            </h2>
            <p className="text-sm text-[#5B6B8C] max-w-md mx-auto">
              {q
                ? 'Try searching with common terms like electrician, DJ, tractor, cleaning, or shifting.'
                : 'Select from our most frequently booked works below or explore all service categories.'}
            </p>
            <Link to="/services" className="serva-pill-btn inline-flex">
              Explore All Categories <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <PopularSearchedSection />
        </div>
      ) : (
        <div className="space-y-8">
          {services.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-[#0A1F5C]">
                Matching Services ({services.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {services.map((s) => (
                  <Link
                    key={s.id}
                    to={getServicePath(s.category_slug, s.slug)}
                    className="serva-card overflow-hidden flex flex-col hover:border-[#0B5FD9] transition-colors"
                  >
                    <div className="aspect-[16/9] bg-[#EAF2FF] overflow-hidden">
                      <img
                        src={s.image_url}
                        alt={s.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                      <div>
                        <p className="text-xs font-medium text-[#5B6B8C]">
                          {s.category_name} · Sample Listing
                        </p>
                        <h3 className="text-base font-bold text-[#0A1F5C] mt-1">{s.name}</h3>
                        <p className="text-xs text-[#5B6B8C] mt-1 line-clamp-2">{s.description}</p>
                      </div>
                      <div className="pt-2 border-t border-[#EAF2FF] flex items-center justify-between text-xs">
                        <span className="font-semibold text-[#0B5FD9] font-mono-num">
                          {formatPrice(s.base_price_paise, s.is_free_enquiry)} · {s.unit_label}
                        </span>
                        <span className="font-semibold text-[#0A1F5C] inline-flex items-center gap-1">
                          Open <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {partners.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-[#0A1F5C]">
                Verified Partners ({partners.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {partners.map((p) => (
                  <div key={p.id} className="serva-card p-5 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-base font-bold text-[#0A1F5C]">{p.business_name}</h3>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#16A34A]">
                        <CheckCircle2 className="w-4 h-4" /> Verified
                      </span>
                    </div>
                    <p className="text-xs text-[#5B6B8C]">
                      {p.service_area} · {p.experience_years} yrs exp · ★ {p.rating_avg.toFixed(1)}
                    </p>
                    <p className="text-sm text-[#5B6B8C]">{p.bio}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          <PopularSearchedSection />
        </div>
      )}
    </div>
  );
}
