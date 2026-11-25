export interface BannerItem {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  to: string;
  cta: string;
  placement: 'HERO_CAROUSEL' | 'PROMO_STRIP' | 'TOP_BANNER';
  active: boolean;
  createdAt?: string;
}

export const DEFAULT_BANNERS: BannerItem[] = [
  {
    id: 'banner-agri-1',
    title: 'Agricultural Workers & Tractor Rentals',
    subtitle: 'Book farm labour teams, drone spraying, harvesting, and machinery.',
    image: '/src/assets/images/hero_agriculture_1794821795928.jpg',
    to: '/agriculture',
    cta: 'Book Now',
    placement: 'HERO_CAROUSEL',
    active: true,
    createdAt: '2026-11-20',
  },
  {
    id: 'banner-events-2',
    title: 'Weddings, Birthdays & Live DJ Events',
    subtitle: 'Book individual specialists or a complete multi-vendor event package.',
    image: '/src/assets/images/hero_events_1794821796128.jpg',
    to: '/events',
    cta: 'Plan an Event',
    placement: 'HERO_CAROUSEL',
    active: true,
    createdAt: '2026-11-21',
  },
  {
    id: 'banner-home-3',
    title: 'Home Services at Your Doorstep',
    subtitle: 'Trusted cleaning, electrical, plumbing, cooking and more.',
    image: '/src/assets/images/hero_home_services_1794821794674.jpg',
    to: '/home-services',
    cta: 'Explore',
    placement: 'HERO_CAROUSEL',
    active: true,
    createdAt: '2026-11-22',
  },
  {
    id: 'banner-moving-4',
    title: 'Packers & Movers - Instant Quotes',
    subtitle: 'Verified Tata Ace, 8ft pickups, loading staff and safe household shifting.',
    image: '/src/assets/images/hero_moving_1794821795552.jpg',
    to: '/moving',
    cta: 'Get Estimate',
    placement: 'HERO_CAROUSEL',
    active: true,
    createdAt: '2026-11-23',
  },
  {
    id: 'banner-contractors-5',
    title: 'Turnkey Civil Construction & Interior Design',
    subtitle: 'Hire verified architects, structural engineers, false ceiling and luxury fitout teams.',
    image: '/src/assets/images/hero_contractors_1794821794939.jpg',
    to: '/contractors',
    cta: 'Consult Experts',
    placement: 'HERO_CAROUSEL',
    active: true,
    createdAt: '2026-11-24',
  },
];

const BANNERS_STORAGE_KEY = 'serva_platform_banners';

export function getStoredBanners(): BannerItem[] {
  if (typeof window === 'undefined') return DEFAULT_BANNERS;
  try {
    const raw = localStorage.getItem(BANNERS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(BANNERS_STORAGE_KEY, JSON.stringify(DEFAULT_BANNERS));
      return DEFAULT_BANNERS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch {}
  return DEFAULT_BANNERS;
}

export function saveStoredBanners(banners: BannerItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(BANNERS_STORAGE_KEY, JSON.stringify(banners));
    window.dispatchEvent(new CustomEvent('serva:banners-updated', { detail: banners }));
  } catch (err) {
    console.error('Failed to save banners:', err);
  }
}

export function addBanner(banner: Omit<BannerItem, 'id'> & { id?: string }): BannerItem[] {
  const current = getStoredBanners();
  const newBanner: BannerItem = {
    ...banner,
    id: banner.id || `banner-${Date.now()}`,
    createdAt: banner.createdAt || new Date().toISOString().slice(0, 10),
  };
  const updated = [newBanner, ...current];
  saveStoredBanners(updated);
  return updated;
}

export function removeBanner(bannerId: string): BannerItem[] {
  const current = getStoredBanners();
  const updated = current.filter((b) => b.id !== bannerId);
  saveStoredBanners(updated);
  return updated;
}

export function toggleBannerStatus(bannerId: string): BannerItem[] {
  const current = getStoredBanners();
  const updated = current.map((b) => (b.id === bannerId ? { ...b, active: !b.active } : b));
  saveStoredBanners(updated);
  return updated;
}

export function resetBannersToDefault(): BannerItem[] {
  saveStoredBanners(DEFAULT_BANNERS);
  return DEFAULT_BANNERS;
}
