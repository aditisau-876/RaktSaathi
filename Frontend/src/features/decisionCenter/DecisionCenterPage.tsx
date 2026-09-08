import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { GlassPanel } from '@/components/common/GlassPanel';
import { Button } from '@/components/common/Button';
import { Stepper } from '@/components/common/Stepper';
import { useIncident } from '@/context/IncidentContext';

export const DecisionCenterPage: React.FC = () => {
  const { activeIncident, executeTransfer, isTransferPrimed } = useIncident();
  const [transferUnits, setTransferUnits] = useState<number>(18);
  const [transferDispatched, setTransferDispatched] = useState<boolean>(isTransferPrimed);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleVerifyTransfer = () => {
    if (transferUnits <= 0) {
      setErrorMsg('Transfer volume must be at least 1 unit.');
      return;
    }
    if (transferUnits > 32) {
      setErrorMsg('Cannot exceed deployable surplus of 32 units at Bank B.');
      return;
    }
    setErrorMsg(null);

    const result = executeTransfer(transferUnits);
    setTransferDispatched(true);
    setToastMessage(result.message);
    setTimeout(() => setToastMessage(null), 6000);
  };

  return (
    <div className="space-y-8">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          role="alert"
          className="fixed top-20 right-8 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-xl shadow-card-elevated border border-emerald-500/60 flex items-center gap-3 animate-fade-in"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-beacon" aria-hidden="true" />
          <div className="flex flex-col">
            <span className="text-xs font-bold font-mono text-emerald-400 uppercase tracking-wider">
              Cold-Chain Order Dispatched
            </span>
            <span className="text-xs text-slate-200">{toastMessage}</span>
          </div>
        </div>
      )}

      {/* 1. Page Header & Diagnostic Stepper */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="space-y-1.5 max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-mono text-primary font-bold tracking-wider">
            <span className="w-2 h-2 rounded-full bg-primary animate-beacon" aria-hidden="true" />
            <span>STAGE 02/04: DIAGNOSTIC & RESPONSE PROTOCOL</span>
          </div>
          <h1 className="text-3xl font-display font-extrabold text-ink-main tracking-tight">
            Why is this a problem, and what should we do?
          </h1>
          <p className="text-sm text-ink-muted leading-relaxed">
            Algorithmic evidence reconciles verifiable surgical demand, scheduled collections, and regional inventory reserves to formulate the optimal mitigation path.
          </p>
        </div>

        {/* Narrative Stepper */}
        <Stepper currentStep={2} />
      </section>

      {/* 2. Primary Evidence Center: Deterministic Balance Equation */}
      <section className="space-y-4" aria-labelledby="equation-heading">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-1.5 h-5 bg-primary rounded-full" aria-hidden="true" />
            <h2 id="equation-heading" className="text-xl font-display font-bold text-ink-main tracking-tight">
              Clinical Evidence Chain & Deterministic Balance Equation
            </h2>
          </div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-primary font-bold px-2.5 py-1 bg-red-50 border border-red-200/90 rounded-md">
            Mathematical Proof of Deficit
          </span>
        </div>

        {/* The Equation Card */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-subtle space-y-6">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
            <div className="max-w-xl">
              <span className="text-[11px] font-mono uppercase tracking-wider text-ink-secondary font-bold">
                Clinical Demand Reconciliation
              </span>
              <h3 className="text-lg font-display font-bold text-ink-main mt-0.5">
                Verifiable Deficit Formulation
              </h3>
              <p className="text-xs text-ink-secondary mt-1 leading-relaxed">
                Reconciling verified emergency bookings across AIIMS and Safdarjung against active shelf reserves and scheduled inbound blood drives.
              </p>
            </div>

            {/* Visual Formula Badges */}
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap bg-slate-50 border border-slate-200/90 p-3 rounded-xl font-mono text-sm shadow-subtle">
              <div className="flex flex-col px-3 py-1.5 rounded-lg bg-white border border-slate-200 shadow-subtle">
                <span className="text-[10px] uppercase text-ink-secondary font-bold tracking-wider">Projected Demand</span>
                <span className="font-bold text-ink-main text-[16px] tabular-nums">31 <span className="text-xs font-normal text-ink-secondary">units</span></span>
              </div>
              <span className="text-primary font-black text-lg" aria-hidden="true">−</span>
              <div className="flex flex-col px-3 py-1.5 rounded-lg bg-white border border-slate-200 shadow-subtle">
                <span className="text-[10px] uppercase text-ink-secondary font-bold tracking-wider">Available Stock</span>
                <span className="font-bold text-ink-main text-[16px] tabular-nums">8 <span className="text-xs font-normal text-ink-secondary">units</span></span>
              </div>
              <span className="text-primary font-black text-lg" aria-hidden="true">−</span>
              <div className="flex flex-col px-3 py-1.5 rounded-lg bg-white border border-slate-200 shadow-subtle">
                <span className="text-[10px] uppercase text-ink-secondary font-bold tracking-wider">Scheduled Inflow</span>
                <span className="font-bold text-ink-main text-[16px] tabular-nums">5 <span className="text-xs font-normal text-ink-secondary">units</span></span>
              </div>
              <span className="text-primary font-black text-lg" aria-hidden="true">=</span>
              <div className="flex flex-col px-4 py-1.5 rounded-lg bg-primary text-white shadow-subtle">
                <span className="text-[10px] uppercase text-red-200 font-bold tracking-wider">Net Deficit</span>
                <span className="font-extrabold text-[17px] tabular-nums">−18 <span className="text-xs font-normal text-red-200">units</span></span>
              </div>
            </div>
          </div>

          {/* 3 Causal Drivers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
            <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80">
              <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase font-mono">
                <span className="material-symbols-outlined text-[18px]">emergency</span>
                <span>Demand Influx (+14u)</span>
              </div>
              <p className="text-xs text-ink-secondary mt-2 leading-relaxed">
                Two emergency aortic rupture surgeries scheduled at AIIMS Apex OR (#REQ-8821) and Safdarjung ICU.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80">
              <div className="flex items-center gap-2 text-amber-800 font-bold text-xs uppercase font-mono">
                <span className="material-symbols-outlined text-[18px]">trending_down</span>
                <span>Collection Slump (−4u)</span>
              </div>
              <p className="text-xs text-ink-secondary mt-2 leading-relaxed">
                Seasonal slump at Sector 62 mobile donation camp yielded 4 fewer uncrossmatched units than the 30-day rolling baseline.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80">
              <div className="flex items-center gap-2 text-ink-main font-bold text-xs uppercase font-mono">
                <span className="material-symbols-outlined text-[18px]">shield</span>
                <span>Mandated Reserve (26u)</span>
              </div>
              <p className="text-xs text-ink-secondary mt-2 leading-relaxed">
                Trauma Center Level-1 statutory mandate requires maintaining a permanent 26-unit safety cushion for disaster resilience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Section 2: Interactive Resolution Simulator (Closed-Loop Prediction) */}
      <section className="space-y-4" aria-labelledby="resolution-heading">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-1.5 h-5 bg-primary rounded-full" aria-hidden="true" />
            <h2 id="resolution-heading" className="text-xl font-display font-bold text-ink-main tracking-tight">
              Closed-Loop Resolution Simulator
            </h2>
          </div>
          <span className={`text-xs font-mono px-2.5 py-1 rounded-md font-bold flex items-center gap-1.5 ${
            transferDispatched
              ? 'text-emerald-800 bg-emerald-50 border border-emerald-200'
              : 'text-ink-secondary bg-slate-100 border border-slate-200'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${transferDispatched ? 'bg-emerald-600' : 'bg-slate-400'}`} />
            {transferDispatched ? 'Mitigation Active: Gap Closed' : 'Simulating Option 01 Impact'}
          </span>
        </div>

        <GlassPanel isCritical={!transferDispatched} elevation={2} className="p-6 lg:p-8 space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left: Resolution Parameters */}
            <div className="lg:col-span-4 space-y-4 border-b lg:border-b-0 lg:border-r border-slate-200/80 pb-6 lg:pb-0 lg:pr-6">
              <div className={`p-4 rounded-xl border transition-all ${
                transferDispatched
                  ? 'bg-emerald-50/70 border-emerald-200'
                  : 'bg-red-50/50 border-red-200'
              }`}>
                <span className="text-[11px] font-mono uppercase text-ink-secondary font-bold tracking-wider">
                  Post-Mitigation Projected Balance
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className={`text-4xl font-display font-extrabold tabular-nums ${
                    transferDispatched ? 'text-emerald-700' : 'text-primary'
                  }`}>
                    {transferDispatched ? 26 : activeIncident.currentStock}
                  </span>
                  <span className="text-lg font-display font-bold text-ink-secondary">
                    / 26 Units Buffer
                  </span>
                </div>
                <div className={`mt-2 text-xs font-bold font-mono flex items-center gap-1.5 ${
                  transferDispatched ? 'text-emerald-700' : 'text-primary'
                }`}>
                  <span className="material-symbols-outlined text-[16px]">
                    {transferDispatched ? 'verified' : 'warning'}
                  </span>
                  <span>
                    {transferDispatched
                      ? 'Deficit completely mitigated via Bank B rebalance'
                      : `Active Deficit: ${activeIncident.projectedGap}u (Exhaustion T+18h)`}
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between font-mono">
                  <span className="text-ink-secondary">Surplus Node:</span>
                  <strong className="text-ink-main">Noida Regional Center (Bank B)</strong>
                </div>
                <div className="flex justify-between font-mono">
                  <span className="text-ink-secondary">Deployable Surplus:</span>
                  <strong className="text-emerald-700">+32 Units O−</strong>
                </div>
                <div className="flex justify-between font-mono">
                  <span className="text-ink-secondary">Cold-Chain Highway ETA:</span>
                  <strong className="text-ink-main">38 mins (NH-24 Corridor)</strong>
                </div>
              </div>
            </div>

            {/* Right: Comparative Resolution Trajectory SVG */}
            <div className="lg:col-span-8 flex flex-col justify-between">
              <div className="flex items-center justify-between pb-2 text-xs">
                <div>
                  <span className="font-bold text-ink-main">Trajectory Comparison: Unmitigated vs Mitigated</span>
                  <p className="text-[11px] text-ink-secondary">Simulated effect of cold-chain transfer on Bank A reserve floor</p>
                </div>
                <div className="flex items-center gap-3 text-[11px] font-mono">
                  <span className="flex items-center gap-1 text-primary">
                    <span className="w-3 h-0.5 border-t-2 border-dashed border-primary" /> Unmitigated
                  </span>
                  <span className="flex items-center gap-1 text-emerald-700">
                    <span className="w-3 h-1 bg-emerald-600 rounded-full" /> Mitigated
                  </span>
                  <span className="flex items-center gap-1 text-ink-secondary">
                    <span className="w-3 h-0.5 border-t-2 border-dotted border-slate-400" /> Floor (26u)
                  </span>
                </div>
              </div>

              {/* Comparative SVG */}
              <div className="w-full h-64 relative mt-2 bg-slate-50/60 rounded-xl border border-slate-200/80 p-2">
                <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 760 250" aria-label="Comparative resolution trajectory graph">
                  {/* Gridlines */}
                  <line x1="50" x2="720" y1="35" y2="35" stroke="#E2E8F0" strokeDasharray="2 2" strokeWidth="1" />
                  <line x1="50" x2="720" y1="80" y2="80" stroke="#E2E8F0" strokeDasharray="2 2" strokeWidth="1" />
                  <line x1="50" x2="720" y1="130" y2="130" stroke="#E2E8F0" strokeDasharray="2 2" strokeWidth="1" />
                  <line x1="50" x2="720" y1="180" y2="180" stroke="#E2E8F0" strokeDasharray="2 2" strokeWidth="1" />

                  {/* Safety Floor Line: 26 Units */}
                  <line x1="50" x2="720" y1="75" y2="75" stroke="#475569" strokeDasharray="5 4" strokeWidth="1.8" />
                  <text x="560" y="68" fill="#334155" fontSize="10" fontWeight="700" fontFamily="JetBrains Mono">
                    SAFETY FLOOR: 26u BUFFER
                  </text>

                  {/* Historical Solid Curve */}
                  <path d="M 65,95 Q 160,115 270,145" fill="none" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" />

                  {/* Unmitigated Depletion Spline (Crimson Dashed) */}
                  <path d="M 270,145 Q 360,170 415,185 T 570,216 T 710,232" fill="none" stroke="#93000B" strokeWidth="2.5" strokeDasharray="6 4" strokeOpacity={transferDispatched ? "0.4" : "1"} />

                  {/* Mitigated Recovery Spline (Emerald Solid) */}
                  <path
                    d="M 270,145 Q 330,110 390,75 T 570,72 T 710,70"
                    fill="none"
                    stroke="#059669"
                    strokeWidth={transferDispatched ? "3.5" : "2"}
                    strokeDasharray={transferDispatched ? "none" : "4 4"}
                    strokeLinecap="round"
                    className="transition-all duration-700"
                  />

                  {/* Now Marker */}
                  <circle cx="270" cy="145" r="5.5" fill="#0F172A" stroke="#FFFFFF" strokeWidth="2" />
                  <text x="270" y="125" textAnchor="middle" fill="#0F172A" fontSize="10" fontWeight="700" fontFamily="Inter">
                    NOW (8u)
                  </text>

                  {/* Recovery Anchor at T+4h (Arrival of Courier) */}
                  <circle cx="390" cy="75" r="6" fill="#059669" stroke="#FFFFFF" strokeWidth="2" />
                  <rect x="330" y="20" width="160" height="24" rx="5" fill="#ECFDF5" stroke="#A7F3D0" strokeWidth="1" />
                  <text x="410" y="36" textAnchor="middle" fill="#065F46" fontSize="9.5" fontWeight="800" fontFamily="JetBrains Mono">
                    ✓ COURIER ARRIVAL T+42m (+18u)
                  </text>

                  {/* Time Axis */}
                  <text x="55" y="240" fill="#64748B" fontSize="10" fontFamily="JetBrains Mono">T−24h (Past)</text>
                  <text x="250" y="240" fill="#0F172A" fontSize="10" fontWeight="700" fontFamily="JetBrains Mono">T+0h (Now)</text>
                  <text x="375" y="240" fill="#059669" fontSize="10" fontWeight="800" fontFamily="JetBrains Mono">T+1h (Delivered)</text>
                  <text x="545" y="240" fill="#64748B" fontSize="10" fontFamily="JetBrains Mono">T+24h</text>
                  <text x="680" y="240" fill="#64748B" fontSize="10" fontFamily="JetBrains Mono">T+48h</text>
                </svg>
              </div>
            </div>
          </div>
        </GlassPanel>
      </section>

      {/* 4. Section 3: Available Operational Options & Decision Hierarchy */}
      <section className="space-y-4" aria-labelledby="hierarchy-heading">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-1.5 h-5 bg-primary rounded-full" aria-hidden="true" />
            <h2 id="hierarchy-heading" className="text-xl font-display font-bold text-ink-main tracking-tight">
              Operational Decision Hierarchy
            </h2>
          </div>
          <span className="text-xs font-mono text-ink-secondary">
            Ranked by clinical speed, cold-chain feasibility, and blood viability
          </span>
        </div>

        {/* Option 01: Inter-Bank Rebalance (Dominant Authority Weight) */}
        <div className={`p-6 rounded-2xl border-2 transition-all shadow-subtle ${
          transferDispatched
            ? 'bg-emerald-50/60 border-emerald-400'
            : 'bg-white border-primary/30 hover:border-primary/50'
        }`}>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2.5 max-w-3xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-primary text-white text-[10px] font-mono font-bold uppercase tracking-wider">
                  Rank 01 • Recommended Action (94% Confidence)
                </span>
                <span className="text-xs font-mono text-emerald-800 font-bold bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                  {transferDispatched ? 'COURIER DISPATCHED' : 'TRANSFER FEASIBLE'}
                </span>
                <span className="text-xs text-ink-secondary font-mono">• 38 Mins Transit ETA</span>
              </div>

              <h3 className="text-xl font-display font-bold text-ink-main">
                01 • Inter-Bank Cold-Chain Transfer from Noida Regional Center (Bank B)
              </h3>
              <p className="text-sm text-ink-secondary leading-relaxed">
                Bank B holds 47 units of O− with a required floor of only 15u (<strong className="text-ink-main">+32u deployable surplus</strong>). Transferring 18 units completely closes the Bank A deficit without causing a shortage at Noida.
              </p>

              {/* Transit Parameters */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 font-mono text-xs">
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-ink-secondary uppercase block">Surplus Node</span>
                  <strong className="text-ink-main text-[13px]">Bank B (Noida)</strong>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-ink-secondary uppercase block">Deployable Surplus</span>
                  <strong className="text-emerald-700 text-[13px]">+32 Units O−</strong>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-ink-secondary uppercase block">Logistics Corridor</span>
                  <strong className="text-ink-main text-[13px]">NH-24 Green Wave</strong>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-ink-secondary uppercase block">Cold-Chain Temp</span>
                  <strong className="text-ink-main text-[13px]">3.6°C Calibrated</strong>
                </div>
              </div>
            </div>

            {/* Action Trigger */}
            <div className="flex flex-col items-stretch lg:items-end justify-center gap-3 flex-shrink-0">
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 p-1.5 rounded-lg">
                <label htmlFor="transfer-units-input" className="text-xs text-ink-secondary pl-2 font-mono">
                  Units:
                </label>
                <input
                  id="transfer-units-input"
                  type="number"
                  value={transferUnits}
                  onChange={e => setTransferUnits(Number(e.target.value))}
                  min={1}
                  max={32}
                  className="w-16 px-2 py-1 text-center font-mono font-bold text-sm bg-white border border-slate-200 rounded text-ink-main focus:outline-none focus:border-primary"
                />
              </div>

              {errorMsg && (
                <span className="text-xs text-primary font-mono font-semibold">{errorMsg}</span>
              )}

              <Button
                variant={transferDispatched ? 'success' : 'primary'}
                size="lg"
                icon={transferDispatched ? 'check_circle' : 'local_shipping'}
                onClick={handleVerifyTransfer}
                disabled={transferDispatched}
              >
                {transferDispatched ? 'Transfer Active (#ORD-902)' : 'Verify & Dispatch Transfer'}
              </Button>
            </div>
          </div>
        </div>

        {/* Secondary Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Option 02: Targeted Donors */}
          <div className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-subtle flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded bg-slate-100 text-ink-secondary text-[10px] font-mono font-bold uppercase">
                  Rank 02 • Precision Outreach
                </span>
                <span className="text-xs text-ink-secondary font-mono">Wave 1: 20 Donors Ready</span>
              </div>
              <h4 className="font-display font-bold text-base text-ink-main">
                02 • Precision Targeted Donor Mobilization
              </h4>
              <p className="text-xs text-ink-secondary leading-relaxed">
                Pre-screened cohort within 5km radius of Bank A with 91.4% historical affirmative response index. Provides secondary buffer reinforcement.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-mono text-ink-secondary">ETA: 14–25 mins</span>
              <Link to="/donor-network">
                <Button variant="secondary" size="sm" icon="group">
                  Open Donor Corridor
                </Button>
              </Link>
            </div>
          </div>

          {/* Option 03: Campaign Studio */}
          <div className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-subtle flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded bg-slate-100 text-ink-secondary text-[10px] font-mono font-bold uppercase">
                  Rank 03 • Autonomous Syndication
                </span>
                <span className="text-xs text-ink-secondary font-mono">Multi-Channel Edge</span>
              </div>
              <h4 className="font-display font-bold text-base text-ink-main">
                03 • Autonomous Campaign Studio Syndication
              </h4>
              <p className="text-xs text-ink-secondary leading-relaxed">
                Emergency creative compilation across WhatsApp (1:1), Instagram stories (9:16), and Digital OOH billboards with pre-approved NBTC safe harbor copy.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-mono text-ink-secondary">Edge Render: 184ms</span>
              <Link to="/campaign-studio">
                <Button variant="primary" size="sm" icon="campaign" iconPosition="right">
                  Deploy in Campaign Studio
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
