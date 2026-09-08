import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { GlassPanel } from '@/components/common/GlassPanel';
import { Button } from '@/components/common/Button';
import { Stepper } from '@/components/common/Stepper';
import { SegmentedControl } from '@/components/common/SegmentedControl';
import { BloodGroup } from '@/core/types/inventory';
import { useIncident } from '@/context/IncidentContext';
import { RadarNetwork3D } from './RadarNetwork3D';

const SEROTYPES: BloodGroup[] = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

export const ShortageRadarPage: React.FC = () => {
  const { facilities, setActiveIncident } = useIncident();
  const [selectedSerotype, setSelectedSerotype] = useState<BloodGroup>('O-');
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>('BB-DEL-A');
  const [viewMode, setViewMode] = useState<'both' | '3d' | 'matrix'>('both');

  const selectedFacility = facilities.find(f => f.facilityId === selectedFacilityId) || facilities[0];
  const selectedStock = selectedFacility.stocks[selectedSerotype];

  const handleCellClick = (facilityId: string, bg: BloodGroup) => {
    setSelectedFacilityId(facilityId);
    setSelectedSerotype(bg);

    const facility = facilities.find(f => f.facilityId === facilityId);
    if (!facility) return;

    const stock = facility.stocks[bg];
    const gap = stock.units - stock.safetyFloor;

    if (gap < 0) {
      setActiveIncident({
        incidentId: `INC-${Math.floor(1000 + Math.random() * 9000)}`,
        facilityId: facility.facilityId,
        facilityName: facility.facilityName,
        bloodGroup: bg,
        currentStock: stock.units,
        mandatedFloor: stock.safetyFloor,
        projectedGap: gap,
        breachHorizonIST: '02:40 IST (T+18h)',
        hoursUntilBreach: stock.depletionHours || 18,
        severity: stock.status === 'critical' ? 'CRITICAL' : 'WARNING',
        modelIdentifier: 'ML-DL-TRAUMA-9042',
        burnVelocityUnitsPerHour: 1.28,
      });
    }
  };

  const handleFacilitySelect = (facilityId: string) => {
    handleCellClick(facilityId, selectedSerotype);
  };

  const serotypeOptions = SEROTYPES.map(bg => ({
    value: bg,
    label: bg,
    alertDot: bg === 'O-' || bg === 'AB-',
  }));

  const viewModeOptions = [
    { value: 'both', label: 'Unified View' },
    { value: '3d', label: '3D Spatial Grid' },
    { value: 'matrix', label: 'Inventory Matrix' },
  ];

  return (
    <div className="space-y-8">
      {/* 1. Page Header & Diagnostic Stepper */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="space-y-1.5 max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-mono text-primary font-bold tracking-wider">
            <span className="w-2 h-2 rounded-full bg-primary animate-beacon" aria-hidden="true" />
            <span>STAGE 01/04: REGIONAL PREDICTIVE SURVEILLANCE</span>
          </div>
          <h1 className="text-3xl font-display font-extrabold text-ink-main tracking-tight">
            Blood Shortage Radar
          </h1>
          <p className="text-sm text-ink-muted leading-relaxed">
            Multi-facility inventory surveillance across 8 blood groups. Predictive threshold algorithms continuously monitor burn velocity to signal imminent runout events.
          </p>
        </div>

        {/* Narrative Stepper */}
        <Stepper currentStep={1} />
      </section>

      {/* 2. Serotype Filter Strip, Projection Controls & Operational Legend */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-slate-200/90 p-3.5 rounded-xl shadow-subtle">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs font-mono font-bold text-ink-secondary uppercase">
            Serotype Focus:
          </span>
          <SegmentedControl
            options={serotypeOptions}
            value={selectedSerotype}
            onChange={setSelectedSerotype}
            label="Serotype selector"
          />
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-ink-secondary uppercase">
              Mode:
            </span>
            <SegmentedControl
              options={viewModeOptions}
              value={viewMode}
              onChange={setViewMode as any}
              label="Radar view mode selector"
              size="sm"
            />
          </div>

          {/* Operational Status Legend */}
          <div className="hidden xl:flex items-center gap-4 text-xs font-mono text-ink-secondary pl-3 border-l border-slate-200">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-primary" aria-hidden="true" />
              <strong className="text-primary">Critical</strong> (≤8u)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" aria-hidden="true" />
              <strong className="text-amber-800">Warning</strong> (9–14u)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-slate-300" aria-hidden="true" />
              <span className="text-ink-secondary">Nominal</span> (&gt;15u)
            </span>
          </div>
        </div>
      </div>

      {/* 3. Interactive 3D Spatial Radar Network */}
      {(viewMode === 'both' || viewMode === '3d') && (
        <RadarNetwork3D
          selectedSerotype={selectedSerotype}
          selectedFacilityId={selectedFacilityId}
          onSelectFacility={handleFacilitySelect}
        />
      )}

      {/* 4. The 8-Serotype Regional Blood Inventory Matrix */}
      {(viewMode === 'both' || viewMode === 'matrix') && (
        <GlassPanel className="p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200/80 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="font-display font-bold text-base text-ink-main">
              Regional Blood Inventory Matrix
            </h2>
            <p className="text-xs text-ink-secondary mt-0.5">
              Telemetry aggregated across 4 Delhi-NCR clinical depots. Click any cell to lock analytical triage.
            </p>
          </div>
          <span className="text-xs font-mono bg-white border border-slate-200 px-3 py-1 rounded-md text-ink-secondary font-semibold shadow-subtle">
            Active Focus: <strong className="text-primary">{selectedFacility.shortName} × {selectedSerotype}</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono border-collapse" role="grid" aria-label="Regional Blood Inventory Matrix">
            <thead>
              <tr className="bg-slate-50/80 text-ink-secondary border-b border-slate-200/80">
                <th className="py-3.5 px-6 font-bold uppercase tracking-wider sticky left-0 bg-slate-50/95 z-20 shadow-[2px_0_6px_-2px_rgba(0,0,0,0.06)] min-w-[240px]">
                  Facility Hub
                </th>
                {SEROTYPES.map(bg => (
                  <th
                    key={bg}
                    className={`py-3.5 px-3 text-center font-bold uppercase tracking-wider min-w-[84px] ${
                      selectedSerotype === bg ? 'bg-red-50/60 text-primary border-x border-red-200/60' : ''
                    }`}
                  >
                    {bg}
                  </th>
                ))}
                <th className="py-3.5 px-6 text-center font-bold uppercase tracking-wider min-w-[120px]">
                  Postural Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {facilities.map(facility => {
                const isSelectedFacility = facility.facilityId === selectedFacilityId;

                return (
                  <tr
                    key={facility.facilityId}
                    className={`transition-colors ${
                      isSelectedFacility ? 'bg-red-50/20' : 'hover:bg-slate-50/50'
                    }`}
                  >
                    {/* Sticky Facility Column */}
                    <td className={`py-3.5 px-6 font-sans sticky left-0 z-10 shadow-[2px_0_6px_-2px_rgba(0,0,0,0.06)] ${
                      isSelectedFacility ? 'bg-slate-50' : 'bg-white'
                    }`}>
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`w-2 h-2 rounded-full flex-shrink-0 ${
                            facility.activeAlertCount > 0 ? 'bg-primary animate-beacon' : 'bg-emerald-600'
                          }`}
                          aria-hidden="true"
                        />
                        <div className="min-w-0">
                          <span className="font-bold text-ink-main block leading-tight text-[13px] truncate">
                            {facility.facilityName}
                          </span>
                          <span className="text-[11px] text-ink-secondary font-mono block mt-0.5">
                            {facility.location}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* 8 Serotype Cells with Proportional Micro-Stock Meters */}
                    {SEROTYPES.map(bg => {
                      const item = facility.stocks[bg];
                      const isCellActive = isSelectedFacility && selectedSerotype === bg;
                      const isCritical = item.status === 'critical';
                      const isWarning = item.status === 'warning';
                      const fillPercent = Math.min(100, Math.round((item.units / Math.max(item.safetyFloor, 1)) * 100));

                      return (
                        <td
                          key={bg}
                          role="button"
                          tabIndex={0}
                          aria-label={`${facility.shortName}, group ${bg}, ${item.units} units against ${item.safetyFloor} unit safety floor, status ${item.status}`}
                          onClick={() => handleCellClick(facility.facilityId, bg)}
                          onKeyDown={e => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              handleCellClick(facility.facilityId, bg);
                            }
                          }}
                          className={`py-2.5 px-3 text-center cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset ${
                            isCellActive
                              ? 'bg-red-100/70 ring-2 ring-primary ring-inset font-bold text-primary shadow-subtle'
                              : isCritical
                              ? 'bg-red-50/80 text-primary hover:bg-red-100/60'
                              : isWarning
                              ? 'bg-amber-50/60 text-amber-900 hover:bg-amber-100/60'
                              : 'text-ink-main hover:bg-slate-100/60'
                          } ${selectedSerotype === bg && !isCellActive ? 'bg-slate-50/60' : ''}`}
                        >
                          <div className="flex flex-col items-center justify-center gap-1">
                            <span className="font-bold text-[13px] tabular-nums leading-none">
                              {item.units}u
                            </span>

                            {/* Proportional Micro-Stock Gauge */}
                            <div
                              className="w-12 h-1 bg-slate-200/80 rounded-full overflow-hidden"
                              aria-hidden="true"
                            >
                              <div
                                className={`h-full rounded-full transition-all ${
                                  isCritical
                                    ? 'bg-primary'
                                    : isWarning
                                    ? 'bg-amber-500'
                                    : 'bg-emerald-600'
                                }`}
                                style={{ width: `${fillPercent}%` }}
                              />
                            </div>

                            <span className="text-[10px] text-ink-secondary font-mono leading-none">
                              fl:{item.safetyFloor}u
                            </span>
                          </div>
                        </td>
                      );
                    })}

                    {/* Status Pill */}
                    <td className="py-3.5 px-6 text-center">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider ${
                          facility.activeAlertCount > 0
                            ? 'bg-red-50 text-primary border border-red-200'
                            : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {facility.activeAlertCount > 0 ? `${facility.activeAlertCount} Shortage` : 'Stable'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </GlassPanel>
      )}

      {/* 5. Active Shortage Triage: Depletion Forecast & Threshold Crossover */}
      <GlassPanel isCritical elevation={2} className="p-6 lg:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-mono font-bold text-primary uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-primary animate-beacon" aria-hidden="true" />
              <span>Active Shortage Triage Drill-Down</span>
            </div>
            <h3 className="font-display font-bold text-xl text-ink-main mt-0.5">
              {selectedFacility.facilityName} • {selectedSerotype} Depletion Trajectory
            </h3>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-ink-secondary">
              Confidence: <strong className="text-ink-main">98.2%</strong> (Monte Carlo n=5,000)
            </span>
            <Link to="/decision-center">
              <Button variant="primary" size="sm" icon="rule" iconPosition="right">
                Evaluate in Decision Center
              </Button>
            </Link>
          </div>
        </div>

        {/* 2-Column: Telemetry Gauges (Left 4 cols) & High-Precision SVG Runout Spline (Right 8 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Telemetry */}
          <div className="lg:col-span-4 space-y-4 border-b lg:border-b-0 lg:border-r border-slate-200/80 pb-6 lg:pb-0 lg:pr-6">
            <div className="p-4 rounded-xl bg-red-50/50 border border-red-200/90 shadow-subtle">
              <span className="text-[11px] font-mono uppercase text-ink-secondary font-bold tracking-wider">
                Current Reserve vs Required Safety Floor
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-4xl font-display font-extrabold text-primary tabular-nums">
                  {selectedStock?.units ?? 8}
                </span>
                <span className="text-lg font-display font-bold text-ink-secondary tabular-nums">
                  / {selectedStock?.safetyFloor ?? 26} Units
                </span>
              </div>
              <div className="mt-2 text-xs font-semibold text-primary flex items-center gap-1.5 font-mono">
                <span className="material-symbols-outlined text-[16px]">warning</span>
                <span>
                  Net Deficit: {(selectedStock?.units ?? 8) - (selectedStock?.safetyFloor ?? 26)} Units
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-mono uppercase text-ink-secondary font-bold">Exhaustion Horizon</span>
                <div className="text-xl font-display font-bold text-primary mt-0.5 tabular-nums">T+18h</div>
                <span className="text-[11px] text-ink-secondary font-mono">02:40 IST Breach</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-mono uppercase text-ink-secondary font-bold">Burn Velocity</span>
                <div className="text-xl font-display font-bold text-ink-main mt-0.5 tabular-nums">1.28 u/h</div>
                <span className="text-[11px] text-ink-secondary font-mono">14 OR Bookings</span>
              </div>
            </div>

            {/* Recommended Cold-Chain Corridor Hook */}
            <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200 text-xs">
              <div className="flex items-center gap-1 text-emerald-900 font-bold">
                <span className="material-symbols-outlined text-[16px]">local_shipping</span>
                <span>Rebalance Solution Available</span>
              </div>
              <p className="text-ink-secondary mt-1 leading-snug">
                Noida Regional Center (Bank B) holds <strong className="text-ink-main">47 units of O−</strong> (+32u surplus). Feasible transfer ETA: <strong className="text-ink-main">38 mins</strong> via NH-24.
              </p>
            </div>
          </div>

          {/* Right SVG Chart */}
          <div className="lg:col-span-8 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs pb-2">
              <span className="font-bold text-ink-main">72-Hour Inventory Depletion Forecast</span>
              <div className="flex items-center gap-3 text-[11px] font-mono">
                <span className="flex items-center gap-1 text-ink-main">
                  <span className="w-3 h-1 bg-ink-main rounded-full" /> Actual
                </span>
                <span className="flex items-center gap-1 text-primary">
                  <span className="w-3 h-0.5 border-t-2 border-dashed border-primary" /> Projected
                </span>
                <span className="flex items-center gap-1 text-ink-secondary">
                  <span className="w-3 h-0.5 border-t-2 border-dotted border-slate-400" /> Floor (26u)
                </span>
              </div>
            </div>

            {/* Visual SVG Chart */}
            <div className="w-full h-64 relative mt-2 bg-slate-50/60 rounded-xl border border-slate-200/80 p-2">
              <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 760 260" aria-label="72-Hour Inventory Depletion Forecast chart">
                <defs>
                  <linearGradient id="chartDeficitFill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#93000B" stopOpacity="0.22" />
                    <stop offset="100%" stopColor="#93000B" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Gridlines */}
                <line x1="50" x2="720" y1="40" y2="40" stroke="#E2E8F0" strokeDasharray="2 2" strokeWidth="1" />
                <line x1="50" x2="720" y1="90" y2="90" stroke="#E2E8F0" strokeDasharray="2 2" strokeWidth="1" />
                <line x1="50" x2="720" y1="140" y2="140" stroke="#E2E8F0" strokeDasharray="2 2" strokeWidth="1" />
                <line x1="50" x2="720" y1="190" y2="190" stroke="#E2E8F0" strokeDasharray="2 2" strokeWidth="1" />

                {/* Safety Floor line (26 Units) */}
                <line x1="50" x2="720" y1="75" y2="75" stroke="#475569" strokeDasharray="5 4" strokeWidth="1.8" />
                <text x="560" y="68" fill="#334155" fontSize="10" fontWeight="700" fontFamily="JetBrains Mono">
                  MANDATED FLOOR: 26u BUFFER
                </text>

                {/* Zero line */}
                <line x1="50" x2="720" y1="190" y2="190" stroke="#93000B" strokeDasharray="3 3" strokeOpacity="0.5" strokeWidth="1.5" />
                <text x="645" y="185" fill="#64748B" fontSize="9.5" fontWeight="600" fontFamily="JetBrains Mono">
                  ZERO LINE: 0u
                </text>

                {/* Area Gradient */}
                <path d="M 270,145 Q 360,170 415,185 T 570,216 T 710,232 L 710,245 L 270,245 Z" fill="url(#chartDeficitFill)" />

                {/* Historical Actual (Solid Line) */}
                <path d="M 65,95 Q 160,115 270,145" fill="none" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" />

                {/* Projected Depletion (Crimson Dashed) */}
                <path d="M 270,145 Q 360,170 415,185 T 570,216 T 710,232" fill="none" stroke="#93000B" strokeWidth="3" strokeDasharray="7 4" strokeLinecap="round" />

                {/* Now Marker (T=0, 8u) */}
                <circle cx="270" cy="145" r="6" fill="#0F172A" stroke="#FFFFFF" strokeWidth="2.5" />
                <rect x="230" y="110" width="80" height="22" rx="4" fill="#0F172A" />
                <text x="270" y="125" textAnchor="middle" fill="#FFFFFF" fontSize="10.5" fontWeight="700" fontFamily="Inter">
                  NOW (8u)
                </text>

                {/* Crossover Breach Point at T+18h */}
                <circle cx="415" cy="185" r="14" fill="#FF4D4D" opacity="0.25" className="risk-pulse-critical" />
                <circle cx="415" cy="185" r="6" fill="#93000B" stroke="#FFFFFF" strokeWidth="2.5" />
                <line x1="415" x2="415" y1="20" y2="185" stroke="#93000B" strokeDasharray="2 2" strokeWidth="1.5" />

                {/* Crossover Badge */}
                <rect x="290" y="12" width="250" height="26" rx="6" fill="#FFF1F0" stroke="#FFDAD6" strokeWidth="1.5" />
                <text x="305" y="29" fill="#93000B" fontSize="10" fontWeight="800" fontFamily="JetBrains Mono">
                  ● CROSSOVER AT T+18h: −18u GAP
                </text>

                {/* Axis Labels */}
                <text x="55" y="248" fill="#64748B" fontSize="10" fontFamily="JetBrains Mono">T−24h (Actual)</text>
                <text x="250" y="248" fill="#0F172A" fontSize="10" fontWeight="700" fontFamily="JetBrains Mono">T+0h Now (8u)</text>
                <text x="385" y="248" fill="#93000B" fontSize="10" fontWeight="800" fontFamily="JetBrains Mono">T+18h (Breach)</text>
                <text x="545" y="248" fill="#64748B" fontSize="10" fontFamily="JetBrains Mono">T+36h</text>
                <text x="680" y="248" fill="#64748B" fontSize="10" fontFamily="JetBrains Mono">T+48h</text>
              </svg>
            </div>

            {/* Next Step Action Anchor */}
            <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between">
              <span className="text-xs text-ink-secondary font-mono">
                Recommended Action: Cold-chain inter-bank transfer from Bank B to close the 18u gap.
              </span>
              <Link to="/decision-center">
                <Button variant="primary" size="sm" icon="arrow_forward" iconPosition="right">
                  Proceed to Decision Center
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </GlassPanel>
    </div>
  );
};
