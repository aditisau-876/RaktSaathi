import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopHeader } from './TopHeader';
import { ContinuityRibbon } from '@/components/common/ContinuityRibbon';

export const AppLayout: React.FC = () => {
  const location = useLocation();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Show persistent continuity ribbon on operational shortage triage routes
  const showRibbon = [
    '/radar',
    '/decision-center',
    '/campaign-studio',
    '/blood-banks',
    '/requests',
    '/donor-network',
  ].includes(location.pathname);

  return (
    <div className="min-h-screen bg-surface flex text-ink-main antialiased selection:bg-red-100 selection:text-primary">
      {/* Fixed Architectural Navigation Shell (Desktop fixed, Mobile drawer) */}
      <Sidebar isOpen={isMobileNavOpen} onClose={() => setIsMobileNavOpen(false)} />

      {/* Main Working Scaffold */}
      <div className="lg:pl-64 pl-0 flex flex-col flex-1 min-w-0 transition-all duration-300">
        <TopHeader onMenuToggle={() => setIsMobileNavOpen(prev => !prev)} />

        {showRibbon && <ContinuityRibbon />}

        <main className="flex-1 w-full max-w-[1720px] mx-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
