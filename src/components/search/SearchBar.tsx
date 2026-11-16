import React, { useEffect, useState } from 'react';
import { ArrowRight, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useRouter } from '../../lib/router.tsx';

interface Suggestion {
  label: string;
  category_slug: string;
  slug: string;
  category_name?: string;
}

export function getServicePath(categorySlug: string, slug: string): string {
  if (categorySlug === 'home-services') {
    if (slug === 'home-cleaning' || slug === 'washing-service') return '/home-services/cleaning';
    if (slug === 'home-cooking') return '/home-services/cooking';
    if (slug === 'wall-painting') return '/home-services/painting';
    return '/home-services/repairing';
  }
  if (categorySlug === 'contractors') {
    if (slug === 'interior-design') return '/contractors/interior-design';
    if (slug === 'furniture-design') return '/contractors/furniture';
    if (slug === 'site-workers') return '/contractors/workers';
    if (slug === 'home-construction') return '/contractors/home-construction';
    return '/contractors/vehicles';
  }
  if (categorySlug === 'events') {
    return `/events/${slug}`;
  }
  if (categorySlug === 'agriculture') {
    if (slug === 'agricultural-workers') return '/agriculture/workers';
    if (slug === 'tractor-rental') return '/agriculture/machinery';
    return '/agriculture/services';
  }
  if (categorySlug === 'moving') {
    return `/moving/${slug}`;
  }
  return `/${categorySlug}`;
}

export function SearchBar({ initialQuery = '' }: { initialQuery?: string }) {
  const { t } = useAuth();
  const { navigate } = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}`)
        .then((r) => r.json())
        .then((d) => setSuggestions(d.suggestions ?? []))
        .catch(() => {});
    }, 150);
    return () => clearTimeout(timer);
  }, [query]);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setOpen(false);
    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <div className="relative w-full">
      <form onSubmit={submitSearch} className="flex items-center gap-2 bg-white rounded-full p-1.5 shadow-md border border-[#DCE7F9]">
        <Search className="w-5 h-5 text-[#5B6B8C] ml-3 shrink-0" />
        <label htmlFor="serva-global-search" className="sr-only">
          Search SERVA services
        </label>
        <input
          id="serva-global-search"
          type="search"
          value={query}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 180)}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          placeholder={t('searchPlaceholder')}
          className="flex-1 min-w-0 py-2 px-2 text-sm text-[#0A1F5C] placeholder:text-[#5B6B8C] bg-transparent focus:outline-none"
        />
        <button type="submit" className="serva-pill-btn text-sm px-5">
          <span>{t('searchButton')}</span>
        </button>
      </form>

      {open && suggestions.length > 0 && (
        <ul
          role="listbox"
          aria-label="Service suggestions"
          className="absolute left-0 right-0 mt-2 serva-card p-2 z-30 divide-y divide-[#EAF2FF]"
        >
          {suggestions.map((s) => (
            <li key={`${s.category_slug}-${s.slug}`}>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  setOpen(false);
                  navigate(getServicePath(s.category_slug, s.slug));
                }}
                className="w-full min-h-[44px] px-3 py-2 rounded-xl hover:bg-[#F1F6FF] flex items-center justify-between text-left cursor-pointer"
              >
                <div>
                  <p className="text-sm font-semibold text-[#0A1F5C]">{s.label}</p>
                  {s.category_name && (
                    <p className="text-xs text-[#5B6B8C]">{s.category_name}</p>
                  )}
                </div>
                <ArrowRight className="w-4 h-4 text-[#0B5FD9] shrink-0" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
