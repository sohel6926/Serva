import React, { useEffect, useState } from 'react';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { Link } from '../lib/router.tsx';
import { SearchBar } from '../components/search/SearchBar.tsx';

interface CategoryRow {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  hero_image: string;
  service_count: number;
}

export function ServicesDirectoryPage() {
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((d) => setCategories(d.categories ?? []))
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="serva-card p-6 sm:p-8 space-y-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#0A1F5C]">Our Services</h1>
        <p className="text-sm sm:text-base text-[#5B6B8C] max-w-2xl">
          Choose from five specialized verticals built for households, builders, event hosts,
          farmers, and families moving across town.
        </p>
        <div className="max-w-xl">
          <SearchBar />
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="serva-card h-36 animate-pulse bg-[#F5F9FF]" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/${cat.slug}`}
              className="serva-card overflow-hidden grid grid-cols-1 sm:grid-cols-12 items-stretch hover:border-[#0B5FD9] transition-colors group"
            >
              <div className="sm:col-span-4 aspect-[16/10] sm:aspect-auto bg-[#EAF2FF] overflow-hidden">
                <img
                  src={cat.hero_image}
                  alt={cat.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-200"
                />
              </div>
              <div className="sm:col-span-8 p-5 sm:p-6 flex items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <p className="text-xs font-medium text-[#5B6B8C]">
                    {cat.service_count} services · {cat.tagline}
                  </p>
                  <h2 className="text-xl font-bold text-[#0A1F5C]">{cat.name}</h2>
                  <p className="text-sm text-[#5B6B8C] leading-relaxed">{cat.description}</p>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-[#0B5FD9] pt-1">
                    Open {cat.name} <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
                <ChevronRight className="w-6 h-6 text-[#5B6B8C] group-hover:text-[#0B5FD9] shrink-0" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
