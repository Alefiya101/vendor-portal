import React, { useEffect, useState } from 'react';
import { VendorLandingPage } from '../components/VendorLandingPage';
import { LoginScreen } from '../components/LoginScreen';
import { VendorDashboard } from '../components/VendorDashboard';
import { ErrorBoundary } from '../components/ErrorBoundary';

type VendorView = 'vendor-landing' | 'login' | 'vendor-dashboard';

export function VendorPortalApp() {
  const [currentView, setCurrentView] = useState<VendorView>('vendor-landing');

  useEffect(() => {
    document.title = 'Tashivar Vendor Portal';

    const storedRole = localStorage.getItem('currentUserRole');
    if (storedRole === 'vendor') {
      setCurrentView('vendor-dashboard');
    }
  }, []);

  const handleLogin = (role: string) => {
    // For this standalone portal, always route to vendor dashboard
    localStorage.setItem('currentUserRole', 'vendor');
    setCurrentView('vendor-dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUserRole');
    setCurrentView('vendor-landing');
  };

  return (
    <ErrorBoundary>
      <div className="vendor-app">
        {currentView === 'vendor-landing' && (
          <VendorLandingPage onGetStarted={() => setCurrentView('login')} />
        )}

        {currentView === 'login' && (
          <LoginScreen
            onLogin={handleLogin}
            initialRole="vendor"
            portalTitle="Vendor Central"
          />
        )}

        {currentView === 'vendor-dashboard' && (
          <VendorDashboard onLogout={handleLogout} />
        )}
      </div>
    </ErrorBoundary>
  );
}

