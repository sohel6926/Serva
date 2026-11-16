import React from 'react';
import { ArrowRight, Calendar, HardHat, Home, LayoutGrid, Sprout, Truck, Wrench } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { Link } from '../lib/router.tsx';
import { BrandLogo } from '../components/common/BrandLogo.tsx';

export function HomeShellPage() {
  const { user, t } = useAuth();

  const tiles = [
    {
      to: '/home-services',
      label: t('homeServices'),
      sub: 'Repairing, Cleaning, Cooking, Painting',
      icon: Home,
      bg: 'bg-blue-50',
      fg: 'text-[#0B5FD9]',
    },
    {
      to: '/contractors',
      label: t('contractors'),
      sub: 'Interior, Furniture, Workers, Machinery, Home Construction',
      icon: HardHat,
      bg: 'bg-amber-50',
      fg: 'text-amber-600',
    },
    {
      to: '/events',
      label: t('events'),
      sub: 'Decoration, Catering, Dance, Singing, Photography, DJ',
      icon: Calendar,
      bg: 'bg-purple-50',
      fg: 'text-purple-600',
    },
    {
      to: '/agriculture',
      label: t('agriculture'),
      sub: 'Farm Workers, Services & Machinery Rental',
      icon: Sprout,
      bg: 'bg-green-50',
      fg: 'text-green-600',
    },
    {
      to: '/moving',
      label: t('moving'),
      sub: 'Home, Office, Packing, Loading & Unloading (Customer Vehicle)',
      icon: Truck,
      bg: 'bg-red-50',
      fg: 'text-red-600',
    },
    {
      to: '/services',
      label: t('moreServices'),
      sub: 'Explore all SERVA service directories',
      icon: LayoutGrid,
      bg: 'bg-slate-100',
      fg: 'text-slate-700',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <section className="serva-card p-6 sm:p-10 bg-gradient-to-br from-[#0A1F5C] via-[#0B5FD9] to-[#1E88FF] text-white border-0">
        <div className="max-w-3xl space-y-4">
          <div className="inline-block bg-white rounded-xl p-1.5">
            <BrandLogo variant="horizontal" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
            {user ? `Hi, ${user.name} 👋 How can we help you today?` : t('heroGreetingGuest')}
          </h1>
          <p className="text-blue-100 text-base sm:text-lg leading-relaxed max-w-2xl">
            {t('heroSubcopy')}
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              to="/services"
              className="min-h-[46px] px-6 py-2.5 rounded-full bg-white text-[#0B5FD9] font-semibold text-sm inline-flex items-center gap-2 hover:bg-blue-50 transition-colors"
            >
              <span>{t('getStarted')}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            {!user && (
              <Link
                to="/login"
                className="min-h-[46px] px-6 py-2.5 rounded-full border border-white/40 text-white font-semibold text-sm inline-flex items-center gap-2 hover:bg-white/10 transition-colors"
              >
                <span>{t('signIn')}</span>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Six Category Tiles */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-bold text-[#0A1F5C]">{t('categoriesTitle')}</h2>
          <Link to="/services" className="text-sm font-semibold text-[#0B5FD9] hover:underline">
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tiles.map((tile) => (
            <Link
              key={tile.to}
              to={tile.to}
              className="serva-card p-5 flex items-start gap-4 hover:border-[#0B5FD9] transition-colors"
            >
              <div className={`w-12 h-12 rounded-2xl ${tile.bg} ${tile.fg} flex items-center justify-center shrink-0`}>
                <tile.icon className="w-6 h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-bold text-[#0A1F5C]">{tile.label}</h3>
                <p className="text-xs text-[#5B6B8C] mt-1 leading-relaxed">{tile.sub}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-[#5B6B8C] shrink-0 mt-1" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

export function PhasePlaceholderPage({
  title,
  subtitle,
  phaseNote,
}: {
  title: string;
  subtitle: string;
  phaseNote: string;
}) {
  return (
    <div className="serva-card p-6 sm:p-8 space-y-4">
      <div className="w-12 h-12 rounded-2xl bg-[#EAF2FF] text-[#0B5FD9] flex items-center justify-center">
        <Wrench className="w-6 h-6" />
      </div>
      <h1 className="text-2xl font-bold text-[#0A1F5C]">{title}</h1>
      <p className="text-[#5B6B8C] max-w-2xl">{subtitle}</p>
      <div className="p-4 rounded-xl bg-[#F5F9FF] border border-[#DCE7F9] text-xs text-[#0A1F5C]">
        {phaseNote}
      </div>
      <div>
        <Link to="/" className="serva-pill-btn">
          Back to Home <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
