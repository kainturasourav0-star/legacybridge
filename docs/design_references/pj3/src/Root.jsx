import { useEffect } from 'react';
import { ClerkProvider, Show } from '@clerk/react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import LandingPage from './App';
import AuthPage from './AuthPage';
import LegalPage from './LegalPage';
import OperationsCommandCenter from './OperationsCommandCenter';
import { clerkAppearance, clerkPublishableKey, isClerkConfigured } from './clerk';

function ProtectedDashboard() {
  if (!isClerkConfigured) return <OperationsCommandCenter previewMode />;
  return (
    <Show when="signed-in" fallback={<Navigate to="/login" replace />}>
      <OperationsCommandCenter />
    </Show>
  );
}

function RouteScrollReset() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname]);
  return null;
}

function ApplicationRoutes() {
  return (
    <BrowserRouter>
      <RouteScrollReset />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/sign-up" element={<AuthPage mode="sign-up" />} />
        <Route path="/privacy" element={<LegalPage type="privacy" />} />
        <Route path="/privacy-policy" element={<Navigate to="/privacy" replace />} />
        <Route path="/terms" element={<LegalPage type="terms" />} />
        <Route path="/terms-and-conditions" element={<Navigate to="/terms" replace />} />
        <Route path="/dashboard" element={<ProtectedDashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default function Root() {
  if (!isClerkConfigured) return <ApplicationRoutes />;
  return (
    <ClerkProvider publishableKey={clerkPublishableKey} appearance={clerkAppearance} afterSignOutUrl="/">
      <ApplicationRoutes />
    </ClerkProvider>
  );
}
