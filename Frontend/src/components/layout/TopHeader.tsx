import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export const TopHeader: React.FC = () => {
  const location = useLocation();

  const getPageTitle = (pathname: string) => {
    switch (pathname) {
      case '/':
        return 'Overview';
      case '/radar':
        return 'Blood Shortage Radar';
      case '/decision-center':
        return 'Shortage Decision Center';
      case '/campaign-studio':
        return 'Campaign Studio';
      case '/blood-banks':
        return 'Blood Banks Directory';
      case '/requests':
        return 'Hospital Requests';
      case '/donor-network':
        return 'Donor Network';
      case '/data-ingestion':
        return 'Data Ingestion (OCR)';
      case '/settings':
        return 'System Settings';
      default:
        return 'Operations Command';
    }
  };

  return (
    <header className="sticky top-0 z-40 h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-8 flex items-center justify-between shadow-xs">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-3">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[13px]">
          <Link to="/" className="font-bold text-primary tracking-tight hover:opacity-80">
            RaktSaathi
          </Link>
          <span className="text-slate-300 font-mono">/</span>
          <span className="text-slate-500 font-medium">Operations</span>
          <span className="text-slate-300 font-mono">/</span>
          <span className="text-ink-main font-semibold">{getPageTitle(location.pathname)}</span>
        </nav>
      </div>

      {/* Regional Selector & Live Telemetry Controls */}
      <div className="flex items-center gap-4">
        {/* Region Selector */}
        <div className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg text-[12px] font-medium text-ink-main cursor-pointer transition-colors shadow-xs">
          <span className="material-symbols-outlined text-primary text-[16px]">pin_drop</span>
          <span>India / Delhi-NCR (Demo Region)</span>
          <span className="material-symbols-outlined text-slate-400 text-[14px]">expand_more</span>
        </div>

        {/* Live Telemetry Indicator */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 border border-red-200/80 text-[11px] font-semibold text-primary">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
          <span className="font-mono">Live Telemetry</span>
        </div>

        <div className="h-4 w-px bg-slate-200" />

        {/* Sync Status & Notifications */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
            <span className="material-symbols-outlined text-[15px] animate-spin text-slate-400" style={{ animationDuration: '10s' }}>
              sync
            </span>
            <span>Synced</span>
          </div>

          <button
            className="relative p-1.5 text-slate-500 hover:text-ink-main hover:bg-slate-100 rounded-lg transition-colors"
            title="Alert Notifications"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full ring-2 ring-white" />
          </button>

          {/* User Profile Pill */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-100 to-red-200 text-primary border border-red-300 flex items-center justify-center font-bold text-[12px] shadow-xs">
              VR
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[12px] font-semibold leading-tight text-ink-main">Dr. V. Rao</span>
              <span className="text-[10px] text-slate-400 leading-tight font-mono">Dispatch Officer</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
