import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useIncident } from '@/context/IncidentContext';

export const ContinuityRibbon: React.FC = () => {
  const { activeIncident, isTransferPrimed } = useIncident();
  const location = useLocation();

  const isCritical = activeIncident.severity === 'CRITICAL';
  const isMitigated = isTransferPrimed || activeIncident.severity === 'STABLE';

  return (
    <div
      role="region"
      aria-label="Active Incident Continuity Anchor"
      className="rs-continuity-ribbon px-6 py-2 sticky top-16 z-30 shadow-subtle"
    >
      <div className="max-w-[1720px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-2.5 text-xs">
        {/* Left: Incident Telemetry Strip */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Active Status Beacon */}
          <span
            className={`font-mono text-[11px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded flex items-center gap-1.5 ${
              isMitigated
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-red-50 text-primary border border-red-200'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isMitigated ? 'bg-emerald-400' : 'bg-red-500 animate-beacon'
              }`}
              aria-hidden="true"
            />
            <span>{activeIncident.bloodGroup}</span>
          </span>

          {/* Incident ID */}
          <span className="font-mono text-[11px] text-slate-600 bg-white/70 px-1.5 py-0.5 rounded border border-slate-200">
            {activeIncident.incidentId}
          </span>

          <span className="text-slate-600 font-mono" aria-hidden="true">•</span>

          {/* Facility */}
          <span className="font-semibold text-slate-700 flex items-center gap-1">
            <span className="material-symbols-outlined text-[15px] text-slate-400">domain</span>
            <span>{activeIncident.facilityName}</span>
          </span>

          <span className="text-slate-600 font-mono" aria-hidden="true">•</span>

          {/* Stock & Horizon Readings */}
          <span className="font-mono text-slate-600">
            Stock: <strong className="text-ink-main">{activeIncident.currentStock}u</strong>
          </span>

          <span className="text-slate-600 font-mono" aria-hidden="true">•</span>

          {/* Deficit or Mitigated Pill */}
          {isMitigated ? (
            <span className="inline-flex items-center gap-1 font-mono font-bold text-white bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded shadow-subtle border border-emerald-200">
              <span className="material-symbols-outlined text-[13px]">check_circle</span>
              <span>Rebalance Active (+18u in transit)</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 font-mono font-bold text-white bg-primary px-2.5 py-0.5 rounded shadow-subtle border border-red-500/40">
              <span>Shortage: {activeIncident.hoursUntilBreach}h to breach</span>
              <span className="text-red-200">({activeIncident.projectedGap}u deficit)</span>
            </span>
          )}
        </div>

        {/* Right: Focused Navigation Corridor */}
        <div className="flex items-center gap-2 self-end md:self-auto flex-shrink-0 font-mono text-[11px]">
          {location.pathname !== '/radar' && (
            <Link
              to="/radar"
              className="text-slate-600 hover:text-primary px-2.5 py-1 rounded-xl bg-white/70 hover:bg-white border border-slate-200 transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[14px]">radar</span>
              <span>Radar</span>
            </Link>
          )}

          {location.pathname !== '/decision-center' && (
            <Link
              to="/decision-center"
              className="font-bold text-white bg-primary hover:bg-primary-hover px-2.5 py-1 rounded border border-red-500/40 transition-colors flex items-center gap-1 shadow-subtle"
            >
              <span className="material-symbols-outlined text-[14px]">emergency</span>
              <span>Decision Center</span>
            </Link>
          )}

          {location.pathname !== '/campaign-studio' && (
            <Link
              to="/campaign-studio"
              className="font-bold text-primary bg-white/75 hover:bg-white px-2.5 py-1 rounded-xl border border-red-100 transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[14px]">campaign</span>
              <span>Campaign Studio</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
