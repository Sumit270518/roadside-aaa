import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { CookieConsentBanner } from './components/common/CookieConsentBanner';
import { SupportWindow } from './components/common/SupportWindow';

// Public Pages
import { LandingPage } from './pages/public/LandingPage';
import { ServicesPage } from './pages/public/ServicesPage';
import { HowItWorksPage } from './pages/public/HowItWorksPage';
import { AboutPage } from './pages/public/AboutPage';
import { ContactPage } from './pages/public/ContactPage';
import { FaqsPage } from './pages/public/FaqsPage';
import { PrivacyPolicyPage } from './pages/public/PrivacyPolicyPage';
import { TermsPage } from './pages/public/TermsPage';
import { NotFoundPage } from './pages/public/NotFoundPage';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { PartnerRegisterPage } from './pages/auth/PartnerRegisterPage';

// User / Driver Dashboard
import { UserLayout } from './layouts/UserLayout';
import { UserOverview } from './pages/user/UserOverview';
import { RequestAssistancePage } from './pages/user/RequestAssistancePage';
import { LiveTrackingPage } from './pages/user/LiveTrackingPage';
import { VehiclesPage } from './pages/user/VehiclesPage';
import { BookingsHistoryPage } from './pages/user/BookingsHistoryPage';
import { InvoiceViewPage } from './pages/user/InvoiceViewPage';
import { ComplaintsPage } from './pages/user/ComplaintsPage';
import { NotificationsPage } from './pages/user/NotificationsPage';

// Partner Dashboard
import { PartnerLayout } from './layouts/PartnerLayout';
import { PartnerOverview } from './pages/partner/PartnerOverview';
import { PartnerActiveJobPage } from './pages/partner/PartnerActiveJobPage';
import { PartnerProfilePage } from './pages/partner/PartnerProfilePage';
import { PartnerEarningsPage } from './pages/partner/PartnerEarningsPage';

// Admin Dashboard
import { AdminLayout } from './layouts/AdminLayout';
import { AdminOverview } from './pages/admin/AdminOverview';
import { AdminPartnerVerificationPage } from './pages/admin/AdminPartnerVerificationPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminBookingsPage } from './pages/admin/AdminBookingsPage';
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage';
import { AdminComplaintsPage } from './pages/admin/AdminComplaintsPage';
import { AdminReportsPage } from './pages/admin/AdminReportsPage';
import { AdminAuditLogsPage } from './pages/admin/AdminAuditLogsPage';

// Public layout wrapper
const PublicLayout = () => (
  <div className="flex flex-col min-h-screen">
    <Navbar />
    <main className="flex-1">
      <Outlet />
    </main>
    <Footer />
  </div>
);

function App() {
  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/faqs" element={<FaqsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/partner-register" element={<PartnerRegisterPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* User / Vehicle Owner Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={['user', 'admin']}>
              <UserLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<UserOverview />} />
          <Route path="request" element={<RequestAssistancePage />} />
          <Route path="tracking/:id" element={<LiveTrackingPage />} />
          <Route path="vehicles" element={<VehiclesPage />} />
          <Route path="bookings" element={<BookingsHistoryPage />} />
          <Route path="invoice/:id" element={<InvoiceViewPage />} />
          <Route path="complaints" element={<ComplaintsPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
        </Route>

        {/* Mechanic & Towing Partner Dashboard */}
        <Route
          path="/partner"
          element={
            <ProtectedRoute allowedRoles={['mechanic', 'towing_partner', 'admin']}>
              <PartnerLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<PartnerOverview />} />
          <Route path="active/:id" element={<PartnerActiveJobPage />} />
          <Route path="profile" element={<PartnerProfilePage />} />
          <Route path="earnings" element={<PartnerEarningsPage />} />
        </Route>

        {/* Administrator Dashboard */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminOverview />} />
          <Route path="partners" element={<AdminPartnerVerificationPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="bookings" element={<AdminBookingsPage />} />
          <Route path="categories" element={<AdminCategoriesPage />} />
          <Route path="complaints" element={<AdminComplaintsPage />} />
          <Route path="reports" element={<AdminReportsPage />} />
          <Route path="audit-logs" element={<AdminAuditLogsPage />} />
        </Route>
      </Routes>

      {/* Global 24/7 Emergency Support Desk Floating Widget */}
      <SupportWindow />

      {/* GDPR & Privacy Compliant Cookie Consent Banner */}
      <CookieConsentBanner />
    </>
  );
}

export default App;
