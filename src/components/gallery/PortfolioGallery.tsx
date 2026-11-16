import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Film, Image as ImageIcon, Play, Star, X } from 'lucide-react';

export interface PortfolioItem {
  id: string;
  partner_id: string;
  category_slug: string;
  sub_category: string | null;
  style_tag: string | null;
  title: string;
  description: string | null;
  media_type: 'IMAGE' | 'VIDEO';
  media_url: string;
  thumbnail_url: string | null;
  price_paise: number | null;
  partner_name?: string;
  rating_avg?: number;
  verification_status?: string;
}

interface PortfolioGalleryProps {
  category?: string;
  subCategory?: string;
  heading?: string;
  subtitle?: string;
  onSelectItem?: (item: PortfolioItem) => void;
  selectLabel?: string;
}

export function PortfolioGallery({
  category,
  subCategory,
  heading = 'Work Portfolio & Sample Showcase',
  subtitle = 'Photos and videos uploaded by verified SERVA professionals (Sample Data)',
  onSelectItem,
  selectLabel = 'Choose This Design',
}: PortfolioGalleryProps) {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [mediaFilter, setMediaFilter] = useState<'ALL' | 'IMAGE' | 'VIDEO'>('ALL');
  const [styleFilter, setStyleFilter] = useState<string>('All');
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (subCategory) params.set('subCategory', subCategory);
    fetch(`/api/portfolio?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => setItems(d.items ?? []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [category, subCategory]);

  const styles = ['All', ...Array.from(new Set(items.map((i) => i.style_tag).filter(Boolean) as string[]))];

  const filtered = items.filter((item) => {
    if (mediaFilter !== 'ALL' && item.media_type !== mediaFilter) return false;
    if (styleFilter !== 'All' && item.style_tag !== styleFilter) return false;
    return true;
  });

  useEffect(() => {
    if (activeIndex === null) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveIndex(null);
      if (e.key === 'ArrowRight') setActiveIndex((idx) => (idx === null ? null : (idx + 1) % filtered.length));
      if (e.key === 'ArrowLeft')
        setActiveIndex((idx) => (idx === null ? null : (idx - 1 + filtered.length) % filtered.length));
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [activeIndex, filtered.length]);

  const activeItem = activeIndex !== null ? filtered[activeIndex] ?? null : null;

  return (
    <section className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#0A1F5C]">{heading}</h2>
          <p className="text-sm text-[#5B6B8C] mt-0.5">{subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex p-1 rounded-xl bg-[#EAF2FF]">
            {(['ALL', 'IMAGE', 'VIDEO'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMediaFilter(m)}
                className={`min-h-[36px] px-3 rounded-lg text-xs font-semibold cursor-pointer ${
                  mediaFilter === m ? 'bg-white text-[#0A1F5C] shadow-sm' : 'text-[#5B6B8C]'
                }`}
              >
                {m === 'ALL' ? 'All Media' : m === 'IMAGE' ? 'Photos' : 'Videos'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {styles.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {styles.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setStyleFilter(tag)}
              className={`min-h-[36px] px-3.5 rounded-full text-xs font-semibold border cursor-pointer ${
                styleFilter === tag
                  ? 'bg-[#0B5FD9] text-white border-[#0B5FD9]'
                  : 'bg-white text-[#0A1F5C] border-[#DCE7F9] hover:bg-[#F5F9FF]'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((k) => (
            <div key={k} className="serva-card h-64 animate-pulse bg-[#F5F9FF]" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="serva-card p-8 text-center text-sm text-[#5B6B8C]">
          No portfolio photos or videos match this filter yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item, idx) => (
            <article key={item.id} className="serva-card serva-card-press overflow-hidden flex flex-col">
              <button
                type="button"
                onClick={() => setActiveIndex(idx)}
                className="relative aspect-[16/10] w-full bg-[#EAF2FF] overflow-hidden text-left group cursor-pointer"
                aria-label={`Open ${item.title} (${item.media_type.toLowerCase()})`}
              >
                <img
                  src={item.thumbnail_url || item.media_url}
                  alt={item.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-200"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 text-xs font-semibold text-white">
                  {item.media_type === 'VIDEO' ? (
                    <>
                      <Play className="w-4 h-4 fill-white" /> Play Video
                    </>
                  ) : (
                    <>
                      <ImageIcon className="w-4 h-4" /> View Photo
                    </>
                  )}
                </span>
                {item.media_type === 'VIDEO' && (
                  <span className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 text-[#0B5FD9] flex items-center justify-center shadow">
                    <Film className="w-4 h-4" />
                  </span>
                )}
              </button>

              <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                <div>
                  <div className="text-xs text-[#5B6B8C] flex items-center gap-1.5">
                    <span>{item.style_tag || item.sub_category || 'Showcase'}</span>
                    <span aria-hidden="true">·</span>
                    <span>{item.media_type === 'VIDEO' ? 'Video' : 'Photo'}</span>
                  </div>
                  <h3 className="text-base font-bold text-[#0A1F5C] mt-1">{item.title}</h3>
                  {item.description && (
                    <p className="text-xs text-[#5B6B8C] mt-1 line-clamp-2">{item.description}</p>
                  )}
                </div>

                <div className="pt-2 border-t border-[#EAF2FF] flex items-center justify-between gap-2 text-xs">
                  <div className="min-w-0">
                    <p className="font-semibold text-[#0A1F5C] truncate">
                      {item.partner_name || 'Verified SERVA Partner'}
                    </p>
                    {typeof item.rating_avg === 'number' && item.rating_avg > 0 && (
                      <p className="text-[#5B6B8C] inline-flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        <span>{item.rating_avg.toFixed(1)}</span>
                      </p>
                    )}
                  </div>
                  {onSelectItem ? (
                    <button
                      type="button"
                      onClick={() => onSelectItem(item)}
                      className="min-h-[38px] px-3.5 rounded-full bg-[#0B5FD9] text-white font-semibold hover:bg-[#094FB6] shrink-0 cursor-pointer"
                    >
                      {selectLabel}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setActiveIndex(idx)}
                      className="min-h-[38px] px-3.5 rounded-full border border-[#DCE7F9] text-[#0B5FD9] font-semibold hover:bg-[#F5F9FF] shrink-0 cursor-pointer"
                    >
                      Inspect
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Lightbox Modal (Photo + Video Playback) */}
      {activeItem && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={activeItem.title}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#EAF2FF]">
              <div className="min-w-0">
                <h3 className="text-base font-bold text-[#0A1F5C] truncate">{activeItem.title}</h3>
                <p className="text-xs text-[#5B6B8C]">
                  {activeItem.partner_name || 'Verified SERVA Partner'} · {activeItem.style_tag || 'Portfolio'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveIndex(null)}
                aria-label="Close lightbox"
                className="min-w-[44px] min-h-[44px] rounded-full hover:bg-[#F1F6FF] flex items-center justify-center text-[#0A1F5C] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-black flex items-center justify-center max-h-[65vh]">
              {activeItem.media_type === 'VIDEO' ? (
                <video
                  key={activeItem.id}
                  src={activeItem.media_url}
                  poster={activeItem.thumbnail_url || undefined}
                  controls
                  autoPlay
                  playsInline
                  className="w-full max-h-[65vh]"
                />
              ) : (
                <img
                  src={activeItem.media_url}
                  alt={activeItem.title}
                  referrerPolicy="no-referrer"
                  className="w-full max-h-[65vh] object-contain"
                />
              )}
            </div>

            <div className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 bg-white">
              <p className="text-sm text-[#5B6B8C] flex-1 min-w-[200px]">
                {activeItem.description}
              </p>
              <div className="flex items-center gap-2 shrink-0">
                {filtered.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        setActiveIndex((idx) =>
                          idx === null ? 0 : (idx - 1 + filtered.length) % filtered.length
                        )
                      }
                      aria-label="Previous item"
                      className="min-w-[44px] min-h-[44px] rounded-full border border-[#DCE7F9] flex items-center justify-center text-[#0A1F5C] hover:bg-[#F5F9FF] cursor-pointer"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setActiveIndex((idx) => (idx === null ? 0 : (idx + 1) % filtered.length))
                      }
                      aria-label="Next item"
                      className="min-w-[44px] min-h-[44px] rounded-full border border-[#DCE7F9] flex items-center justify-center text-[#0A1F5C] hover:bg-[#F5F9FF] cursor-pointer"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
                {onSelectItem && (
                  <button
                    type="button"
                    onClick={() => {
                      onSelectItem(activeItem);
                      setActiveIndex(null);
                    }}
                    className="serva-pill-btn text-sm"
                  >
                    {selectLabel}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
