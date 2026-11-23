import React, { useState, useEffect } from 'react';
import { RoleGuard } from './components/auth/RoleGuard.tsx';
import { LoadingScreen } from './components/common/LoadingScreen.tsx';
import { AppShell } from './components/layout/AppShell.tsx';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { RouterProvider, useRouter, Link } from './lib/router.tsx';
import { OffersPage, ProfilePage, SupportPage, WalletPage } from './pages/AccountPages.tsx';
import { AdminDashboardPage } from './pages/AdminDashboardPage.tsx';
import { BookingCreatePage } from './pages/BookingCreatePage.tsx';
import { BookingDetailPage } from './pages/BookingDetailPage.tsx';
import { BookingPayPage } from './pages/BookingPayPage.tsx';
import {
  AgricultureLandingPage,
  ContractorsLandingPage,
  EventsLandingPage,
  HomeServicesLandingPage,
  MovingLandingPage,
  SubServiceDetailPage,
} from './pages/CategoryPages.tsx';
import { ContractorsSectionPage } from './pages/ContractorsFlows.tsx';
import { EventServiceFlowPage, EventsPlanPage } from './pages/EventsFlows.tsx';
import { EventPlannerDetailPage } from './pages/EventPlannerDetailPage.tsx';
import { HomePage } from './pages/HomePage.tsx';
import { RepairingPage, CleaningPage, CookingPage, PaintingPage } from './pages/HomeServicesFlows.tsx';
import { AgricultureFlowPage } from './pages/AgricultureFlowPage.tsx';
import { InteriorDesignerDetailPage } from './pages/InteriorDesignerDetailPage.tsx';
import { LoginPage } from './pages/LoginPage.tsx';
import { MovingFlowPage } from './pages/MovingFlowPage.tsx';
import { MyBookingsPage } from './pages/MyBookingsPage.tsx';
import { PartnerRegisterPage } from './pages/PartnerRegisterPage.tsx';
import { PartnerPanelPage } from './pages/PartnerPanelPage.tsx';
import { PhasePlaceholderPage } from './pages/Phase1ShellPages.tsx';
import { SearchPage } from './pages/SearchPage.tsx';
import { ServicesDirectoryPage } from './pages/ServicesDirectoryPage.tsx';
import { AboutPage, PrivacyPage, RefundPolicyPage, TermsPage } from './pages/StaticPages.tsx';

const SERVICE_SIDEBAR_PREFIXES = [
  '/services',
  '/home-services',
  '/contractors',
  '/events',
  '/agriculture',
  '/moving',
];

function AppRoutes() {
  const { loading } = useAuth();
  const [timedOut, setTimedOut] = useState(false);
  const { pathname: rawPath } = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => setTimedOut(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  if (loading && !timedOut) {
    return <LoadingScreen />;
  }

  // Normalize trailing slash
  const normalizedPath = rawPath.length > 1 && rawPath.endsWith('/') ? rawPath.slice(0, -1) : rawPath;

  // Handle client-side aliases & redirections
  let pathname = normalizedPath;
  if (pathname === '/home' || pathname === '/index' || pathname === '/index.html') pathname = '/';
  else if (pathname === '/home-service' || pathname === '/homeservices' || pathname === '/home-services-provider') pathname = '/home-services';
  else if (pathname === '/service' || pathname === '/all-services' || pathname === '/our-services') pathname = '/services';
  else if (pathname === '/booking' || pathname === '/my-bookings' || pathname === '/my-booking') pathname = '/bookings';
  else if (pathname === '/partner' || pathname === '/partner/dashboard') pathname = '/partner/panel';
  else if (pathname === '/partner-register' || pathname === '/join') pathname = '/partner/register';
  else if (pathname === '/admin/dashboard') pathname = '/admin';
  else if (pathname === '/contractor' || pathname === '/contractor-services') pathname = '/contractors';
  else if (pathname === '/contractors/interior') pathname = '/contractors/interior-design';
  else if (pathname === '/contractors/construction') pathname = '/contractors/home-construction';
  else if (pathname === '/contractors/machinery') pathname = '/contractors/heavy-machinery';
  else if (pathname === '/event') pathname = '/events';
  else if (pathname === '/events/catering' || pathname === '/events/dj' || pathname === '/events/decor') pathname = '/events/plan';
  else if (pathname === '/agri' || pathname === '/agri-services') pathname = '/agriculture';
  else if (pathname === '/agriculture/tractor' || pathname === '/agriculture/drone') pathname = '/agriculture/services';
  else if (pathname === '/shift' || pathname === '/shifting' || pathname === '/moving-shifting' || pathname === '/moving-and-shifting') pathname = '/moving';
  else if (pathname === '/home-shifting') pathname = '/moving/home-shifting';
  else if (pathname === '/cleaning' || pathname === '/clean') pathname = '/home-services/cleaning';
  else if (pathname === '/repairing' || pathname === '/repair' || pathname === '/plumbing' || pathname === '/electrician' || pathname === '/ac-repair') pathname = '/home-services/repairing';
  else if (pathname === '/cooking' || pathname === '/cook') pathname = '/home-services/cooking';
  else if (pathname === '/painting' || pathname === '/paint') pathname = '/home-services/painting';
  else if (pathname === '/offer' || pathname === '/deals' || pathname === '/deal') pathname = '/offers';
  else if (pathname === '/help' || pathname === '/contact' || pathname === '/contact-us') pathname = '/support';
  else if (pathname === '/account' || pathname === '/user') pathname = '/profile';
  else if (pathname === '/signin' || pathname === '/signup' || pathname === '/register') pathname = '/login';

  const showSidebar = SERVICE_SIDEBAR_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  // Dedicated, standalone portals: Never wrap Partner or Admin in the customer AppShell
  const isPartnerRoute = pathname === '/partner' || pathname.startsWith('/partner/');
  const isAdminRoute = pathname === '/admin' || pathname.startsWith('/admin/');

  if (isPartnerRoute) {
    return <PartnerPanelPage />;
  }

  if (isAdminRoute) {
    return <AdminDashboardPage />;
  }

  let content: React.ReactNode;

  if (pathname === '/') {
    content = <HomePage />;
  } else if (pathname === '/login') {
    content = <LoginPage />;
  } else if (pathname === '/services') {
    content = <ServicesDirectoryPage />;
  } else if (pathname === '/search') {
    content = <SearchPage />;
  } else if (pathname === '/book/summary' || pathname === '/book/pay') {
    content = (
      <RoleGuard allowedRoles={['CUSTOMER', 'PARTNER', 'ADMIN']}>
        <BookingPayPage />
      </RoleGuard>
    );
  } else if (pathname.startsWith('/book/')) {
    const parts = pathname.split('/').filter(Boolean);
    const cat = parts[1] || 'home-services';
    const svc = parts[2] || 'electrician';
    content = <BookingCreatePage categorySlug={cat} serviceSlug={svc} />;
  } else if (pathname === '/bookings') {
    content = (
      <RoleGuard allowedRoles={['CUSTOMER', 'PARTNER', 'ADMIN']}>
        <MyBookingsPage />
      </RoleGuard>
    );
  } else if (pathname.startsWith('/bookings/')) {
    const id = pathname.split('/')[2] || '';
    content = (
      <RoleGuard allowedRoles={['CUSTOMER', 'PARTNER', 'ADMIN']}>
        <BookingDetailPage bookingId={id} />
      </RoleGuard>
    );
  } else if (pathname === '/home-services') {
    content = <HomeServicesLandingPage />;
  } else if (pathname === '/home-services/repairing') {
    content = <RepairingPage />;
  } else if (pathname === '/home-services/cleaning') {
    content = <CleaningPage />;
  } else if (pathname === '/home-services/cooking') {
    content = <CookingPage />;
  } else if (pathname === '/home-services/painting') {
    content = <PaintingPage />;
  } else if (pathname.startsWith('/home-services/')) {
    const sub = pathname.split('/')[2] || 'repairing';
    content = (
      <SubServiceDetailPage
        categoryTitle="Home Services"
        categoryPath="/home-services"
        subTitle={sub}
        description="Book trusted doorstep home technicians."
        bookTo={`/book/home-services/${sub}`}
      />
    );
  } else if (pathname.startsWith('/contractors/interior-design/designer/') || pathname.startsWith('/interior-designer/')) {
    const parts = pathname.split('/').filter(Boolean);
    const designerId = parts[parts.length - 1] || 'dsg-1';
    content = <InteriorDesignerDetailPage designerId={designerId} />;
  } else if (pathname === '/contractors') {
    content = <ContractorsLandingPage />;
  } else if (pathname.startsWith('/contractors/')) {
    const sub = pathname.split('/')[2] || 'interior-design';
    content = <ContractorsSectionPage section={sub} />;
  } else if (pathname === '/events') {
    content = <EventsLandingPage />;
  } else if (pathname === '/events/plan') {
    content = <EventsPlanPage />;
  } else if (pathname.startsWith('/events/planner/') || pathname.startsWith('/events/planners/') || pathname.startsWith('/event-planner/')) {
    const parts = pathname.split('/').filter(Boolean);
    const plannerId = parts[parts.length - 1] || 'planner-1';
    content = <EventPlannerDetailPage plannerId={plannerId} />;
  } else if (pathname.startsWith('/events/')) {
    const sub = pathname.split('/')[2] || 'decoration';
    content = <EventServiceFlowPage serviceSlug={sub} />;
  } else if (pathname === '/agriculture') {
    content = <AgricultureLandingPage />;
  } else if (pathname.startsWith('/agriculture/')) {
    const sub = pathname.split('/')[2] || 'services';
    const entryPath = sub === 'workers' || sub === 'machinery' ? sub : 'services';
    content = <AgricultureFlowPage entryPath={entryPath} />;
  } else if (pathname === '/moving') {
    content = <MovingLandingPage />;
  } else if (pathname.startsWith('/moving/')) {
    const sub = pathname.split('/')[2] || 'home-shifting';
    content = <MovingFlowPage serviceSlug={sub} />;
  } else if (pathname === '/partner' || pathname.startsWith('/partner/panel') || pathname.startsWith('/partner/dashboard')) {
    content = <PartnerPanelPage />;
  } else if (pathname.startsWith('/admin')) {
    content = <AdminDashboardPage />;
  } else if (pathname.startsWith('/wallet')) {
    content = (
      <RoleGuard allowedRoles={['CUSTOMER', 'PARTNER', 'ADMIN']}>
        <WalletPage />
      </RoleGuard>
    );
  } else if (pathname.startsWith('/profile')) {
    content = (
      <RoleGuard allowedRoles={['CUSTOMER', 'PARTNER', 'ADMIN']}>
        <ProfilePage />
      </RoleGuard>
    );
  } else if (pathname.startsWith('/offers')) {
    content = <OffersPage />;
  } else if (pathname.startsWith('/support')) {
    content = <SupportPage />;
  } else if (pathname === '/partner/register') {
    content = <PartnerRegisterPage />;
  } else if (pathname === '/about') {
    content = <AboutPage />;
  } else if (pathname === '/terms') {
    content = <TermsPage />;
  } else if (pathname === '/privacy') {
    content = <PrivacyPage />;
  } else if (pathname === '/refund-policy') {
    content = <RefundPolicyPage />;
  } else {
    content = (
      <div className="min-h-[60vh] flex items-center justify-center py-10 px-4">
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-lg text-center space-y-4">
          <div className="flex justify-center">
            <img src="/serva-logo.png" alt="SERVA Logo" className="h-12 w-auto object-contain" />
          </div>
          <div>
            <div className="text-5xl sm:text-6xl font-extrabold text-[#033E8C] tracking-tight">404</div>
            <h1 className="text-lg sm:text-xl font-bold text-[#0F172A] mt-2">Page Not Found</h1>
            <p className="text-xs text-[#64748B] mt-2 leading-relaxed">
              The page you are looking for might have been moved, removed, or is temporarily unavailable.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
            <Link
              to="/"
              className="flex-1 py-3 px-4 rounded-xl bg-[#033E8C] hover:bg-[#022B63] text-white font-bold text-xs shadow-md transition-colors text-center"
            >
              Go to Homepage
            </Link>
            <Link
              to="/services"
              className="flex-1 py-3 px-4 rounded-xl bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#1E293B] font-bold text-xs transition-colors text-center"
            >
              Browse Services
            </Link>
          </div>
          <div className="pt-2 border-t border-slate-100 flex flex-wrap justify-center gap-1.5 text-[11px]">
            <Link to="/home-services" className="px-2.5 py-1 bg-blue-50 text-[#0B5FD9] rounded-md font-semibold hover:bg-blue-100">
              Home Services
            </Link>
            <Link to="/contractors" className="px-2.5 py-1 bg-blue-50 text-[#0B5FD9] rounded-md font-semibold hover:bg-blue-100">
              Contractors
            </Link>
            <Link to="/agriculture" className="px-2.5 py-1 bg-blue-50 text-[#0B5FD9] rounded-md font-semibold hover:bg-blue-100">
              Agriculture
            </Link>
            <Link to="/events" className="px-2.5 py-1 bg-blue-50 text-[#0B5FD9] rounded-md font-semibold hover:bg-blue-100">
              Events
            </Link>
            <Link to="/moving" className="px-2.5 py-1 bg-blue-50 text-[#0B5FD9] rounded-md font-semibold hover:bg-blue-100">
              Moving
            </Link>
          </div>
          <p className="text-[10px] text-[#94A3B8]">
            SERVA — Multiple Services Provider · All Your Needs, One Platform
          </p>
        </div>
      </div>
    );
  }

  return <AppShell showServiceSidebar={showSidebar}>{content}</AppShell>;
}

export default function App() {
  return (
    <RouterProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </RouterProvider>
  );
}
