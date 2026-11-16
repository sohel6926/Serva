import React from 'react';
import { RoleGuard } from './components/auth/RoleGuard.tsx';
import { LoadingScreen } from './components/common/LoadingScreen.tsx';
import { AppShell } from './components/layout/AppShell.tsx';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { RouterProvider, useRouter } from './lib/router.tsx';
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
import { HomePage } from './pages/HomePage.tsx';
import {
  CleaningPage,
  CookingPage,
  PaintingPage,
  RepairingPage,
} from './pages/HomeServicesFlows.tsx';
import { AgricultureFlowPage } from './pages/AgricultureFlowPage.tsx';
import { LoginPage } from './pages/LoginPage.tsx';
import { MovingFlowPage } from './pages/MovingFlowPage.tsx';
import { MyBookingsPage } from './pages/MyBookingsPage.tsx';
import { PartnerRegisterPage } from './pages/PartnerRegisterPage.tsx';
import { PartnerRequestsPage } from './pages/PartnerRequestsPage.tsx';
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
  const { pathname } = useRouter();

  if (loading) {
    return <LoadingScreen />;
  }

  const showSidebar = SERVICE_SIDEBAR_PREFIXES.some((prefix) => pathname.startsWith(prefix));

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
  } else if (pathname === '/contractors') {
    content = <ContractorsLandingPage />;
  } else if (pathname.startsWith('/contractors/')) {
    const sub = pathname.split('/')[2] || 'interior-design';
    content = <ContractorsSectionPage section={sub} />;
  } else if (pathname === '/events') {
    content = <EventsLandingPage />;
  } else if (pathname === '/events/plan') {
    content = <EventsPlanPage />;
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
  } else if (pathname.startsWith('/partner/dashboard')) {
    content = (
      <RoleGuard allowedRoles={['PARTNER', 'ADMIN']}>
        <PartnerRequestsPage />
      </RoleGuard>
    );
  } else if (pathname.startsWith('/admin')) {
    content = (
      <RoleGuard allowedRoles={['ADMIN']}>
        <AdminDashboardPage />
      </RoleGuard>
    );
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
      <PhasePlaceholderPage
        title="Page Not Found"
        subtitle="The requested SERVA page could not be located."
        phaseNote="Use Our Services or Home to continue browsing."
      />
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
