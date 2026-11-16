import React, { useEffect, useState } from 'react';
import { ArrowRight, CheckCircle2, Search } from 'lucide-react';
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
        <div className="serva-card p-8 text-center space-y-3">
          <h2 className="text-lg font-bold text-[#0A1F5C]">No matching services found</h2>
          <p className="text-sm text-[#5B6B8C]">
            Try searching for electrician, DJ, tractor, cleaning, catering, or shifting.
          </p>
          <Link to="/services" className="serva-pill-btn">
            Explore All Categories <ArrowRight className="w-4 h-4" />
          </Link>
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
        </div>
      )}
    </div>
  );
}
