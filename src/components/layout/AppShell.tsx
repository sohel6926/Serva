import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  Bell,
  Calendar,
  ChevronDown,
  Globe,
  HardHat,
  Home,
  LayoutGrid,
  LogOut,
  MapPin,
  Menu,
  Search,
  ShieldCheck,
  Sprout,
  Tag,
  Truck,
  User as UserIcon,
  Wallet,
  Wrench,
  X,
  Zap,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { Link, useRouter } from '../../lib/router.tsx';
import { BrandLogo } from '../common/BrandLogo.tsx';
import { ScrollRevealObserver } from '../common/ScrollRevealObserver.tsx';
import { ScrollToTopButton } from '../common/ScrollToTopButton.tsx';

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  link: string | null;
  is_read: number;
  created_at: string;
}

const CITIES = [
  'Hyderabad, TG',
  'Warangal, TG',
  'Nalgonda, TG',
  'Vijayawada, AP',
  'Visakhapatnam, AP',
  'Bengaluru, KA',
];

interface AppShellProps {
  children: React.ReactNode;
  showServiceSidebar?: boolean;
}

export function AppShell({ children, showServiceSidebar = false }: AppShellProps) {
  const { user, refreshUser, loginAsDemo, language, setLanguage, city, setCity, t, logout } = useAuth();
  const { pathname, navigate } = useRouter();
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);

  // Automatically close any open menus or popups on page navigation
  useEffect(() => {
    setProfileOpen(false);
    setNotifOpen(false);
    setMobileMenuOpen(false);
  }, [pathname]);

  // Automatically close dropdowns/menus when clicking or tapping outside, or on pressing Escape
  useEffect(() => {
    if (!profileOpen && !notifOpen && !mobileMenuOpen) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (profileOpen && profileRef.current && !profileRef.current.contains(target)) {
        setProfileOpen(false);
      }
      if (notifOpen && notifRef.current && !notifRef.current.contains(target)) {
        setNotifOpen(false);
      }
      if (
        mobileMenuOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(target) &&
        (!mobileMenuButtonRef.current || !mobileMenuButtonRef.current.contains(target))
      ) {
        setMobileMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setProfileOpen(false);
        setNotifOpen(false);
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [profileOpen, notifOpen, mobileMenuOpen]);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }
    fetch('/api/notifications', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : { notifications: [] }))
      .then((d) => setNotifications(d.notifications ?? []))
      .catch(() => {});
  }, [user, pathname]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const markAllRead = async () => {
    await fetch('/api/notifications/read-all', { method: 'POST', credentials: 'include' });
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
  };

  const navLinks = [
    { to: '/', label: t('navHome') },
    { to: '/services', label: t('navServices') },
    { to: '/bookings', label: t('navBookings') },
    { to: '/wallet', label: t('navWallet') },
    { to: '/support', label: t('navSupport') },
  ];

  const sidebarItems = [
    { to: '/', label: t('navHome'), icon: Home },
    { to: '/home-services', label: t('homeServices'), icon: Wrench },
    { to: '/contractors', label: t('contractors'), icon: HardHat },
    { to: '/events', label: t('events'), icon: Calendar },
    { to: '/agriculture', label: t('agriculture'), icon: Sprout },
    { to: '/moving', label: t('moving'), icon: Truck },
  ];

  return (
    <div className="min-h-screen flex flex-col relative">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:rounded-full focus:bg-[#0B5FD9] focus:text-white focus:text-xs focus:font-bold"
      >
        Skip to main content
      </a>
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 h-14 md:h-16 bg-white/95 backdrop-blur-md border-b border-[#DCE7F9]">
        <div className="max-w-7xl mx-auto h-full px-3 sm:px-6 flex items-center justify-between gap-4">
          {/* Zone 1: Brand */}
          <div className="flex items-center gap-2 shrink-0">
            <Link
              to="/"
              onClick={() => {
                setProfileOpen(false);
                setNotifOpen(false);
                setMobileMenuOpen(false);
              }}
              aria-label="SERVA Home"
              className="shrink-0"
            >
              <BrandLogo variant="horizontal" />
            </Link>
          </div>

          {/* Zone 2: Desktop Primary Links */}
          <nav aria-label="Main navigation" className="hidden md:flex items-center gap-6">
            {navLinks.map((item) => {
              const active =
                item.to === '/' ? pathname === '/' : pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => {
                    setProfileOpen(false);
                    setNotifOpen(false);
                    setMobileMenuOpen(false);
                  }}
                  className={`text-sm font-medium whitespace-nowrap shrink-0 py-2 border-b-2 transition-colors ${
                    active
                      ? 'text-[#0B5FD9] border-[#0B5FD9]'
                      : 'text-[#0A1F5C] border-transparent hover:text-[#0B5FD9]'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Zone 3: Utilities & Action */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Location selector (desktop/tablet) */}
            <div className="hidden lg:flex items-center gap-1.5 text-xs font-medium text-[#0A1F5C] bg-[#F1F6FF] border border-[#DCE7F9] rounded-full px-3 min-h-[38px]">
              <MapPin className="w-3.5 h-3.5 text-[#0B5FD9] shrink-0" />
              <label htmlFor="serva-city-select" className="sr-only">
                Select City
              </label>
              <select
                id="serva-city-select"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="bg-transparent text-[#0A1F5C] font-medium focus:outline-none cursor-pointer pr-1"
              >
                {CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Language Switcher EN / TE */}
            <button
              type="button"
              onClick={() => {
                setProfileOpen(false);
                setNotifOpen(false);
                setMobileMenuOpen(false);
                setLanguage(language === 'en' ? 'te' : 'en');
              }}
              aria-label="Toggle language between English and Telugu"
              className="min-h-[36px] px-3 rounded-full border border-[#DCE7F9] bg-white hover:bg-[#F1F6FF] text-xs font-semibold text-[#0A1F5C] inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer shadow-sm"
            >
              <Globe className="w-3.5 h-3.5 text-[#0B5FD9]" />
              <span>{language === 'en' ? 'తెలుగు' : 'EN'}</span>
              <ChevronDown className="w-3 h-3 text-[#5B6B8C]" />
            </button>

            {/* Notifications (when logged in) */}
            {user && (
              <div ref={notifRef} className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setNotifOpen((v) => !v);
                    setProfileOpen(false);
                    setMobileMenuOpen(false);
                  }}
                  aria-label="Notifications"
                  className="relative min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center text-[#0A1F5C] hover:bg-[#F1F6FF] cursor-pointer"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#DC2626] text-white text-[10px] font-bold flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>
                {notifOpen && (
                  <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-24px)] serva-card p-4 z-50">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-bold text-[#0A1F5C]">Notifications</h3>
                      {unreadCount > 0 && (
                        <button
                          type="button"
                          onClick={markAllRead}
                          className="text-xs font-medium text-[#0B5FD9] hover:underline cursor-pointer"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    {notifications.length === 0 ? (
                      <p className="text-xs text-[#5B6B8C] py-4 text-center">
                        No notifications yet.
                      </p>
                    ) : (
                      <ul className="space-y-2 max-h-64 overflow-y-auto">
                        {notifications.map((n) => (
                          <li
                            key={n.id}
                            className={`p-2.5 rounded-xl border text-xs ${
                              n.is_read
                                ? 'bg-white border-[#EAF2FF]'
                                : 'bg-[#EAF2FF]/60 border-[#C7DCFF]'
                            }`}
                          >
                            <p className="font-semibold text-[#0A1F5C]">{n.title}</p>
                            <p className="text-[#5B6B8C] mt-0.5">{n.body}</p>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Profile / Sign In */}
            {user ? (
              <div ref={profileRef} className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen((v) => !v);
                    setNotifOpen(false);
                    setMobileMenuOpen(false);
                  }}
                  className="min-h-[44px] pl-2.5 pr-3 rounded-full border border-[#DCE7F9] bg-white hover:bg-[#F1F6FF] flex items-center gap-2 text-sm font-semibold text-[#0A1F5C] whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <span className="w-7 h-7 rounded-full bg-[#0B5FD9] text-white text-xs font-bold flex items-center justify-center">
                    {user.name.slice(0, 1).toUpperCase()}
                  </span>
                  <span className="hidden sm:inline max-w-[110px] truncate">{user.name}</span>
                  <ChevronDown className="w-4 h-4 text-[#5B6B8C]" />
                </button>
                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-60 serva-card p-2 z-50">
                    <div className="px-3 py-2 border-b border-[#EAF2FF]">
                      <p className="text-sm font-bold text-[#0A1F5C] truncate">{user.name}</p>
                      <p className="text-xs text-[#5B6B8C]">
                        {user.role} · {user.mobile || user.email}
                      </p>
                    </div>
                    <div className="py-1 flex flex-col">
                      <Link
                        to="/profile"
                        onClick={() => setProfileOpen(false)}
                        className="px-3 py-2.5 text-sm text-[#0A1F5C] hover:bg-[#F1F6FF] rounded-xl flex items-center gap-2"
                      >
                        <UserIcon className="w-4 h-4 text-[#0B5FD9]" /> Profile & Addresses
                      </Link>
                      <Link
                        to="/partner/panel"
                        onClick={() => setProfileOpen(false)}
                        className="px-3 py-2.5 text-sm text-[#0A1F5C] hover:bg-[#F1F6FF] rounded-xl flex items-center gap-2 font-medium"
                      >
                        <HardHat className="w-4 h-4 text-[#0B5FD9]" /> Partner Panel
                      </Link>
                      <Link
                        to="/admin"
                        onClick={() => setProfileOpen(false)}
                        className="px-3 py-2.5 text-sm text-[#0A1F5C] hover:bg-[#F1F6FF] rounded-xl flex items-center gap-2 font-medium"
                      >
                        <ShieldCheck className="w-4 h-4 text-[#0B5FD9]" /> Admin Panel
                      </Link>
                      <button
                        type="button"
                        onClick={async () => {
                          setProfileOpen(false);
                          await logout();
                          navigate('/');
                        }}
                        className="px-3 py-2.5 text-sm text-[#DC2626] hover:bg-red-50 rounded-xl flex items-center gap-2 text-left cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="min-h-[36px] px-3.5 py-1.5 rounded-full bg-[#0B5FD9] hover:bg-[#094FB6] text-white text-xs font-semibold whitespace-nowrap shrink-0 inline-flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
              >
                <UserIcon className="w-3.5 h-3.5 text-white" />
                <span>{t('signIn')}</span>
              </Link>
            )}

            {/* Mobile drawer toggle */}
            <button
              ref={mobileMenuButtonRef}
              type="button"
              onClick={() => {
                setMobileMenuOpen((v) => !v);
                setProfileOpen(false);
                setNotifOpen(false);
              }}
              aria-label="Toggle menu"
              className="md:hidden min-w-[36px] min-h-[36px] flex items-center justify-center text-[#0A1F5C] hover:bg-[#F1F6FF] rounded-full cursor-pointer ml-0.5"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6 stroke-[2.2]" />}
            </button>
          </div>
        </div>

        {/* Mobile slide-down menu */}
        {mobileMenuOpen && (
          <div ref={mobileMenuRef} className="md:hidden bg-white border-b border-[#DCE7F9] px-4 py-4 space-y-2 shadow-lg">
            <div className="flex items-center gap-2 px-3 py-2 bg-[#F1F6FF] rounded-xl text-xs text-[#0A1F5C]">
              <MapPin className="w-4 h-4 text-[#0B5FD9]" />
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                aria-label="City"
                className="bg-transparent font-medium w-full focus:outline-none"
              >
                {CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            {sidebarItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#0A1F5C] hover:bg-[#F1F6FF]"
              >
                <item.icon className="w-4 h-4 text-[#0B5FD9]" />
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </header>

      {/* Main Content Area (with optional Service Left Sidebar) */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 pt-4 pb-28 md:py-6">
        {showServiceSidebar ? (
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            <aside
              aria-label="Service categories navigation"
              className="w-full lg:w-64 shrink-0 space-y-4 lg:sticky lg:top-22"
            >
              <div className="serva-card p-3 hidden lg:block">
                <nav className="space-y-1">
                  {sidebarItems.map((item) => {
                    const active =
                      item.to === '/' ? pathname === '/' : pathname.startsWith(item.to);
                    return (
                      <Link
                        key={item.to}
                        to={item.to}
                        className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors min-h-[44px] ${
                          active
                            ? 'bg-[#0B5FD9] text-white'
                            : 'text-[#0A1F5C] hover:bg-[#EAF2FF]'
                        }`}
                      >
                        <item.icon className="w-4 h-4 shrink-0" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>

              {/* Blue Partner CTA Card from Spec Section 3 & Home Services PDF */}
              <div className="rounded-2xl bg-gradient-to-br from-[#0B5FD9] to-[#1E88FF] text-white p-5 shadow-md">
                <p className="text-xs font-medium text-blue-100">{t('becomePartnerTitle')}</p>
                <p className="text-base font-bold mt-1 leading-snug">{t('becomePartnerSub')}</p>
                <Link
                  to="/partner/register"
                  className="mt-4 inline-flex items-center justify-center gap-1.5 w-full min-h-[44px] px-4 py-2 rounded-full bg-white text-[#0B5FD9] font-semibold text-sm hover:bg-blue-50 transition-colors"
                >
                  <span>{t('registerNow')}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </aside>

            <main
              key={pathname}
              id="main-content"
              tabIndex={-1}
              className="flex-1 min-w-0 w-full focus:outline-none serva-page-slide"
            >
              {children}
            </main>
          </div>
        ) : (
          <main
            key={pathname}
            id="main-content"
            tabIndex={-1}
            className="w-full min-w-0 focus:outline-none serva-page-slide"
          >
            {children}
          </main>
        )}
      </div>

      {/* Footer — desktop only */}
      <footer className="hidden md:block bg-white border-t border-[#DCE7F9] mt-12 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-3">
            <BrandLogo variant="horizontal" />
            <p className="text-sm font-semibold text-[#0A1F5C]">
              SERVA: Multiple Services Provider
            </p>
            <p className="text-sm text-[#5B6B8C]">{t('brandTagline')}</p>
          </div>

          <div>
            <h4 className="text-sm font-bold text-[#0A1F5C] mb-3">Services</h4>
            <ul className="space-y-2 text-sm text-[#5B6B8C]">
              <li>
                <Link to="/home-services" className="hover:text-[#0B5FD9]">
                  Home Services
                </Link>
              </li>
              <li>
                <Link to="/contractors" className="hover:text-[#0B5FD9]">
                  Contractors
                </Link>
              </li>
              <li>
                <Link to="/events" className="hover:text-[#0B5FD9]">
                  Events
                </Link>
              </li>
              <li>
                <Link to="/agriculture" className="hover:text-[#0B5FD9]">
                  Agriculture
                </Link>
              </li>
              <li>
                <Link to="/moving" className="hover:text-[#0B5FD9]">
                  Moving and Shifting
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-[#0A1F5C] mb-3">Platform</h4>
            <ul className="space-y-2 text-sm text-[#5B6B8C]">
              <li>
                <Link to="/partner/register" className="hover:text-[#0B5FD9]">
                  Become a Partner
                </Link>
              </li>
              <li>
                <Link to="/offers" className="hover:text-[#0B5FD9]">
                  Offers & Deals
                </Link>
              </li>
              <li>
                <Link to="/support" className="hover:text-[#0B5FD9]">
                  Help & Support
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-[#0B5FD9]">
                  About SERVA
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-[#0A1F5C] mb-3">Policies</h4>
            <ul className="space-y-2 text-sm text-[#5B6B8C]">
              <li>
                <Link to="/terms" className="hover:text-[#0B5FD9]">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-[#0B5FD9]">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/refund-policy" className="hover:text-[#0B5FD9]">
                  Cancellation & Refund Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-[#EAF2FF] px-4 sm:px-6 py-4 max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#5B6B8C]">
          <span>© 2026 SERVA Multiple Services Provider. Hyderabad, Telangana.</span>
          <span>Sample listings and demo accounts are clearly marked as sample data.</span>
        </div>
      </footer>

      {/* Mobile Bottom Tab Bar (Home, Bookings, Offers, Profile) */}
      {/* Mobile Bottom Navigation — 5 tabs with centre FAB search */}
      {/* Mobile Bottom Navigation Bar matching mockup */}
      <nav
        aria-label="Mobile navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 h-[66px] bg-white/98 backdrop-blur-lg border-t border-[#EAEFF8] shadow-[0_-4px_20px_rgba(10,31,92,0.05)]"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="grid grid-cols-5 h-full items-center px-1">
          {/* Home */}
          {(() => {
            const active = pathname === '/';
            return (
              <Link
                to="/"
                onClick={() => {
                  setProfileOpen(false);
                  setNotifOpen(false);
                  setMobileMenuOpen(false);
                }}
                className="flex flex-col items-center justify-center gap-0.5"
              >
                <div className={`w-13 h-7 rounded-2xl flex items-center justify-center transition-colors ${active ? 'bg-[#EBF2FE] text-[#0B5FD9]' : 'text-[#64748B]'}`}>
                  <Home className={`w-5 h-5 ${active ? 'fill-current' : ''}`} />
                </div>
                <span className={`text-[10px] font-semibold ${active ? 'text-[#0B5FD9]' : 'text-[#64748B]'}`}>Home</span>
              </Link>
            );
          })()}
          {/* Bookings */}
          {(() => {
            const active = pathname.startsWith('/bookings');
            return (
              <Link
                to="/bookings"
                onClick={() => {
                  setProfileOpen(false);
                  setNotifOpen(false);
                  setMobileMenuOpen(false);
                }}
                className="flex flex-col items-center justify-center gap-0.5"
              >
                <div className={`w-13 h-7 rounded-2xl flex items-center justify-center transition-colors ${active ? 'bg-[#EBF2FE] text-[#0B5FD9]' : 'text-[#64748B]'}`}>
                  <Calendar className="w-5 h-5" />
                </div>
                <span className={`text-[10px] font-semibold ${active ? 'text-[#0B5FD9]' : 'text-[#64748B]'}`}>Bookings</span>
              </Link>
            );
          })()}
          {/* Search */}
          {(() => {
            const active = pathname.startsWith('/search');
            return (
              <Link
                to="/search"
                onClick={() => {
                  setProfileOpen(false);
                  setNotifOpen(false);
                  setMobileMenuOpen(false);
                }}
                className="flex flex-col items-center justify-center gap-0.5"
              >
                <div className={`w-13 h-7 rounded-2xl flex items-center justify-center transition-colors ${active ? 'bg-[#EBF2FE] text-[#0B5FD9]' : 'text-[#64748B]'}`}>
                  <Search className="w-5 h-5" />
                </div>
                <span className={`text-[10px] font-semibold ${active ? 'text-[#0B5FD9]' : 'text-[#64748B]'}`}>Search</span>
              </Link>
            );
          })()}
          {/* Offers */}
          {(() => {
            const active = pathname.startsWith('/offers');
            return (
              <Link
                to="/offers"
                onClick={() => {
                  setProfileOpen(false);
                  setNotifOpen(false);
                  setMobileMenuOpen(false);
                }}
                className="flex flex-col items-center justify-center gap-0.5"
              >
                <div className="relative w-13 h-7 rounded-2xl flex items-center justify-center transition-colors text-[#64748B]">
                  <Tag className={`w-5 h-5 ${active ? 'text-[#0B5FD9]' : 'text-[#64748B]'}`} />
                  <span className="absolute top-1 right-3.5 w-2 h-2 rounded-full bg-[#EF4444]" />
                </div>
                <span className={`text-[10px] font-semibold ${active ? 'text-[#0B5FD9]' : 'text-[#64748B]'}`}>Offers</span>
              </Link>
            );
          })()}
          {/* Sign In / Profile */}
          {(() => {
            const to = user ? '/profile' : '/login';
            const label = user ? t('navProfile') : 'Sign In';
            const active = pathname.startsWith(to);
            return (
              <Link
                to={to}
                onClick={() => {
                  setProfileOpen(false);
                  setNotifOpen(false);
                  setMobileMenuOpen(false);
                }}
                className="flex flex-col items-center justify-center gap-0.5"
              >
                <div className={`w-13 h-7 rounded-2xl flex items-center justify-center transition-colors ${active ? 'bg-[#EBF2FE] text-[#0B5FD9]' : 'text-[#64748B]'}`}>
                  <UserIcon className="w-5 h-5" />
                </div>
                <span className={`text-[10px] font-semibold truncate max-w-[56px] ${active ? 'text-[#0B5FD9]' : 'text-[#64748B]'}`}>{label}</span>
              </Link>
            );
          })()}
        </div>
      </nav>

      <ScrollRevealObserver />
      <ScrollToTopButton />
    </div>
  );
}
