import React from 'react';
import { Link } from 'react-router-dom';
import { RiskPulse } from '@/components/common/RiskPulse';
import { GlassPanel } from '@/components/common/GlassPanel';
import { Button } from '@/components/common/Button';
import { useIncident } from '@/context/IncidentContext';

export const OverviewPage: React.FC = () => {
  const { activeIncident } = useIncident();

  return (
    <div className="space-y-8">
      {/* 1. Page Header & Operational Briefing */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-mono uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
            <span>08 September 2026</span>
            <span>•</span>
            <span>Regional Operations Command</span>
            <span>•</span>
            <span className="font-bold text-ink-main">Delhi-NCR Metro Hubs</span>
          </div>
          <h1 className="text-3xl font-display font-extrabold text-ink-main tracking-tight">
            Good morning, Dr. Rao
          </h1>
          <p className="text-sm text-slate-500 max-w-2xl leading-relaxed">
            Blood availability intelligence and predictive runout surveillance across 4 active regional clinical depots and 38 tier-1 surgical endpoints.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-[22px]">timelapse</span>
            <div className="flex flex-col">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                Network Runout Buffer
              </span>
              <span className="font-display font-bold text-ink-main text-base leading-tight">
                41.2 Hours
              </span>
            </div>
          </div>
          <Link to="/radar">
            <Button variant="secondary" icon="radar">
              Inspect Radar
            </Button>
          </Link>
          <Link to="/decision-center">
            <Button variant="primary" icon="bolt" iconPosition="right">
              Triage Crisis
            </Button>
          </Link>
        </div>
      </section>

      {/* 2. Hero: Dominant Incident Card with Signature Risk Pulse */}
      <GlassPanel isCritical hasDotsGrid elevation={2} className="p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left: The Signature Risk Pulse Dial */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 bg-slate-50/70 border border-slate-200/80 rounded-2xl relative">
            <RiskPulse
              size="xl"
              severity={activeIncident.severity}
              units={activeIncident.currentStock}
              label={`${activeIncident.bloodGroup} PRBC`}
              sublabel={`Floor: ${activeIncident.mandatedFloor}u`}
            />
            <div className="mt-6 flex items-center gap-2 text-[11px] font-mono text-slate-500">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span>Sensor Telemetry Synced • T-0 Live</span>
            </div>
          </div>

          {/* Right: Dominant Incident Breakdown */}
          <div className="lg:col-span-8 flex flex-col justify-between h-full space-y-6">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2">
                <div>
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-primary">
                    Dominant Network Shortage Incident
                  </span>
                  <h2 className="text-2xl font-display font-extrabold text-ink-main mt-0.5">
                    {activeIncident.facilityName}
                  </h2>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-800 text-xs font-mono font-bold border border-red-200">
                  <span className="material-symbols-outlined text-[16px] text-primary">crisis_alert</span>
                  <span>Shortage Horizon: {activeIncident.hoursUntilBreach}h</span>
                </div>
              </div>

              {/* 3 Metric Pills */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-4">
                <div className="bg-slate-50/90 border border-slate-200/80 p-4 rounded-xl">
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-bold tracking-wider">
                    Projected Net Shortfall
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-3xl font-display font-extrabold text-primary">
                      {activeIncident.projectedGap}
                    </span>
                    <span className="text-sm font-display font-semibold text-primary">Units</span>
                  </div>
                  <span className="text-[11px] text-slate-500 mt-1 block font-mono">
                    Mandated floor breach at T+18h
                  </span>
                </div>

                <div className="bg-slate-50/90 border border-slate-200/80 p-4 rounded-xl">
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-bold tracking-wider">
                    Requisition Pressure
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-3xl font-display font-extrabold text-ink-main">+14</span>
                    <span className="text-sm font-display font-semibold text-slate-500">Units/24h</span>
                  </div>
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    2 Emergency Aortic OR bookings
                  </span>
                </div>

                <div className="bg-slate-50/90 border border-slate-200/80 p-4 rounded-xl">
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-bold tracking-wider">
                    Replenishment Drag
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-3xl font-display font-extrabold text-ink-main">−42%</span>
                    <span className="text-sm font-display font-semibold text-slate-500">Inflow</span>
                  </div>
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Monsoon weather donor dip
                  </span>
                </div>
              </div>
            </div>

            {/* Narrative Progression Ribbon & Action Button */}
            <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-600">
                <span className="font-bold text-primary">Prediction</span>
                <span className="text-slate-300">➔</span>
                <span className="text-ink-main font-semibold">Evidence (Audit #8821)</span>
                <span className="text-slate-300">➔</span>
                <span className="text-ink-main font-semibold">Bank B Transfer (Feasible)</span>
                <span className="text-slate-300">➔</span>
                <span className="text-amber-700 font-bold">Action Pending</span>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <Link to="/decision-center">
                  <Button variant="primary" size="sm" icon="bolt" iconPosition="right">
                    Resolve in Decision Center
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </GlassPanel>

      {/* 3. Operational Telemetry Cards Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {/* Tile 1: Supply Buffer */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono uppercase font-bold tracking-wider text-slate-400">
              Regional Supply Buffer
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              Nominal
            </span>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-display font-extrabold text-ink-main">1,420</span>
              <span className="text-xs font-mono text-emerald-600 font-semibold">+48u 24h Net</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Surplus Reservoir: Bank B (Noida) +32u Deployable O−
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Cold Chain Fleet</span>
            <span className="text-ink-main font-semibold">94% Fleet Active</span>
          </div>
        </div>

        {/* Tile 2: Demand Acceleration */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono uppercase font-bold tracking-wider text-slate-400">
              Demand Acceleration
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Surge
            </span>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-display font-extrabold text-primary">48u</span>
              <span className="text-xs font-mono text-slate-400">Unfulfilled</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              18u STAT Priority (AIIMS Apex & Safdarjung ICUs)
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Active Incidents</span>
            <span className="text-primary font-semibold">1 Critical / 2 Watch</span>
          </div>
        </div>

        {/* Tile 3: Mobilization Pool */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono uppercase font-bold tracking-wider text-slate-400">
              Mobilization Pool
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
              Standby
            </span>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-display font-extrabold text-ink-main">84</span>
              <span className="text-xs font-mono text-slate-500">O− Donors Ready</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Wave 1: 20 nearby donors primed within 5km radius
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Response Velocity</span>
            <span className="text-ink-main font-semibold">91.4% Cohort Index</span>
          </div>
        </div>

        {/* Tile 4: Ingestion Latency */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono uppercase font-bold tracking-wider text-slate-400">
              Data Ingestion Delta
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">
              Live Sync
            </span>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-display font-extrabold text-ink-main">14ms</span>
              <span className="text-xs font-mono text-sky-600 font-semibold">Edge to DW</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Cloudinary OCR parsing 99.4% confidence rate
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Snowflake Commit</span>
            <span className="text-ink-main font-semibold">Zero Loss Sync</span>
          </div>
        </div>
      </section>

      {/* 4. Action Corridors */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/radar"
          className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-red-300 hover:shadow-md transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-red-50 text-primary flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[24px]">radar</span>
            </div>
            <h3 className="font-display font-bold text-lg text-ink-main group-hover:text-primary transition-colors">
              Blood Shortage Radar
            </h3>
            <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
              Scan real-time inventory matrices across all 8 blood groups and 4 regional health facilities.
            </p>
          </div>
          <div className="mt-6 flex items-center text-xs font-bold text-primary gap-1">
            <span>Explore Inventory Matrix</span>
            <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </div>
        </Link>

        <Link
          to="/decision-center"
          className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-red-300 hover:shadow-md transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-red-50 text-primary flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[24px]">emergency</span>
            </div>
            <h3 className="font-display font-bold text-lg text-ink-main group-hover:text-primary transition-colors">
              Shortage Decision Center
            </h3>
            <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
              Examine the deterministic evidence equation and verify Bank B transfer feasibility in 1-click.
            </p>
          </div>
          <div className="mt-6 flex items-center text-xs font-bold text-primary gap-1">
            <span>Evaluate Intervention Options</span>
            <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </div>
        </Link>

        <Link
          to="/campaign-studio"
          className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-red-300 hover:shadow-md transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-red-50 text-primary flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[24px]">campaign</span>
            </div>
            <h3 className="font-display font-bold text-lg text-ink-main group-hover:text-primary transition-colors">
              Campaign Studio
            </h3>
            <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
              Autonomous multi-channel emergency broadcast compilation (WhatsApp, Stories, Digital Billboards).
            </p>
          </div>
          <div className="mt-6 flex items-center text-xs font-bold text-primary gap-1">
            <span>Preview Broadcast Formats</span>
            <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </div>
        </Link>
      </section>
    </div>
  );
};
