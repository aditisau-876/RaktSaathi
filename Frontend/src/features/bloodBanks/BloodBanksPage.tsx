import React, { useState } from 'react';
import { GlassPanel } from '@/components/common/GlassPanel';
import { Button } from '@/components/common/Button';
import { SegmentedControl } from '@/components/common/SegmentedControl';
import { useIncident } from '@/context/IncidentContext';

export const BloodBanksPage: React.FC = () => {
  const { facilities, executeTransfer, isTransferPrimed } = useIncident();
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'O-' | 'SURPLUS'>('ALL');
  const [transferDispatched, setTransferDispatched] = useState<boolean>(isTransferPrimed);
  const [simMessage, setSimMessage] = useState<string | null>(null);

  const handleSimulateRebalance = () => {
    const result = executeTransfer(18);
    setTransferDispatched(true);
    setSimMessage(result.message);
    setTimeout(() => setSimMessage(null), 6000);
  };

  const filteredFacilities = facilities.filter(f => {
    if (selectedFilter === 'SURPLUS') return f.facilityId === 'BB-NOI-B';
    if (selectedFilter === 'O-') return f.stocks['O-'].units > 0;
    return true;
  });

  const filterOptions = [
    { value: 'ALL' as const, label: 'All Facilities', badge: facilities.length },
    { value: 'O-' as const, label: 'O− Negative Focus', alertDot: true },
    { value: 'SURPLUS' as const, label: 'Surplus Reservoirs' },
  ];

  return (
    <div className="space-y-8">
      {/* Toast Alert */}
      {simMessage && (
        <div
          role="alert"
          className="fixed top-20 right-8 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-xl shadow-card-elevated border border-emerald-500/60 flex items-center gap-3 animate-fade-in"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-beacon" aria-hidden="true" />
          <span className="text-xs font-mono text-slate-200">{simMessage}</span>
        </div>
      )}

      {/* 1. Header & Controls */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="space-y-1.5 max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-mono text-primary font-bold tracking-wider">
            <span className="material-symbols-outlined text-[16px]">share_location</span>
            <span>OPERATIONAL SUPPLY DIRECTORY • REGIONAL INTELLIGENCE</span>
          </div>
          <h1 className="text-3xl font-display font-extrabold text-ink-main tracking-tight">
            Blood Banks
          </h1>
          <p className="text-sm text-ink-muted leading-relaxed">
            Real-time blood stock posture, inter-bank rebalancing availability, and cold-chain transport surveillance across the Delhi-NCR network.
          </p>
        </div>

        {/* Unified Filter Strip */}
        <SegmentedControl
          options={filterOptions}
          value={selectedFilter}
          onChange={setSelectedFilter}
          label="Blood banks filter"
        />
      </section>

      {/* 2. Lean Network Posture Strip (Operational, Not Metric-Heavy) */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-subtle">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 divide-y md:divide-y-0 md:divide-x divide-slate-100">
          <div className="px-2">
            <span className="text-[10px] font-mono text-ink-secondary uppercase font-bold block">Monitored Facilities</span>
            <div className="text-2xl font-display font-bold text-ink-main mt-1 tabular-nums">4 Active Hubs</div>
            <span className="text-xs text-ink-secondary font-mono">14 Satellite clinics</span>
          </div>
          <div className="px-2 md:pl-4 pt-3 md:pt-0">
            <span className="text-[10px] font-mono text-ink-secondary uppercase font-bold block">Network Inventory</span>
            <div className="text-2xl font-display font-bold text-ink-main mt-1 tabular-nums">1,420 Units</div>
            <span className="text-xs text-emerald-700 font-mono font-bold">+48u 24h net shift</span>
          </div>
          <div className="px-2 md:pl-4 pt-3 md:pt-0">
            <span className="text-[10px] font-mono text-primary uppercase font-bold block">Active Critical Deficit</span>
            <div className="text-2xl font-display font-bold text-primary mt-1">Bank A (O−)</div>
            <span className="text-xs text-primary font-mono font-bold">18u shortfall at T+18h</span>
          </div>
          <div className="px-2 md:pl-4 pt-3 md:pt-0">
            <span className="text-[10px] font-mono text-emerald-800 uppercase font-bold block">Deployable Surplus</span>
            <div className="text-2xl font-display font-bold text-emerald-700 mt-1 tabular-nums">47 Units O−</div>
            <span className="text-xs text-emerald-700 font-mono font-bold">+32u surplus at Bank B</span>
          </div>
        </div>
      </div>

      {/* 3. Visual Surplus ➔ Shortage Rebalance Corridor */}
      <GlassPanel elevation={2} className="p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">swap_horiz</span>
              <h2 className="font-display font-bold text-lg text-ink-main">
                Visual Surplus ➔ Shortage Rebalance Corridor
              </h2>
            </div>
            <p className="text-xs text-ink-secondary">
              Direct highway transfer routing connecting surplus node to acute deficit triage node.
            </p>
          </div>

          <Button
            variant={transferDispatched ? 'success' : 'primary'}
            size="sm"
            icon={transferDispatched ? 'check_circle' : 'route'}
            onClick={handleSimulateRebalance}
            disabled={transferDispatched}
          >
            {transferDispatched ? 'Transfer Order Active' : 'Dispatch 18u Rebalance Courier'}
          </Button>
        </div>

        {/* 3-Column Connected Vector */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Source: Bank B (Noida) (4 cols) */}
          <div className="lg:col-span-4 p-5 rounded-xl bg-emerald-50/60 border border-emerald-200">
            <div className="flex items-center justify-between text-xs font-mono mb-2">
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-bold uppercase">
                Surplus Source Node
              </span>
              <span className="text-ink-secondary">#BB-NOI-B</span>
            </div>
            <h3 className="font-display font-bold text-base text-ink-main">
              Noida Regional Center (Bank B)
            </h3>
            <p className="text-xs text-ink-secondary">Sector 62, Noida • Regional Depository</p>

            <div className="mt-4 p-3 bg-white rounded-lg border border-emerald-200/80">
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-ink-secondary">O− Available Stock:</span>
                <span className="text-xl font-display font-bold text-emerald-700 tabular-nums">47 Units</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden" aria-hidden="true">
                <div className="bg-emerald-600 h-full rounded-full w-[85%]" />
              </div>
              <div className="flex justify-between text-[11px] text-ink-secondary font-mono mt-1">
                <span>Floor req: 15u</span>
                <strong className="text-emerald-700">+32u Deployable Surplus</strong>
              </div>
            </div>
          </div>

          {/* Midsection: Transit Vector (4 cols) */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center text-center p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-primary">
              <span className="material-symbols-outlined text-[18px]">local_shipping</span>
              <span>MedExpress Courier #04</span>
            </div>

            <div className="w-full relative flex items-center justify-center my-1" aria-hidden="true">
              <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden relative">
                <div className="h-full bg-primary rounded-full animate-beacon w-3/4" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 w-full text-xs font-mono">
              <div className="bg-white p-2 rounded border border-slate-200">
                <span className="text-ink-secondary block text-[10px] uppercase">Route Corridor</span>
                <strong className="text-ink-main text-[12px]">NH-24 Green Wave</strong>
              </div>
              <div className="bg-white p-2 rounded border border-slate-200">
                <span className="text-ink-secondary block text-[10px] uppercase">Transit Window</span>
                <strong className="text-primary text-[12px]">38 Mins ETA</strong>
              </div>
            </div>

            <span className="text-xs text-ink-secondary font-mono">
              Cold-Chain Monitored: <strong className="text-emerald-700">3.6°C Nominal</strong>
            </span>
          </div>

          {/* Sink: Bank A (Metro Trauma Hub) (4 cols) */}
          <div className="lg:col-span-4 p-5 rounded-xl bg-red-50/60 border border-red-200">
            <div className="flex items-center justify-between text-xs font-mono mb-2">
              <span className="px-2 py-0.5 rounded bg-red-100 text-primary font-bold uppercase">
                Deficit Destination Hub
              </span>
              <span className="text-ink-secondary">#BB-DEL-A</span>
            </div>
            <h3 className="font-display font-bold text-base text-ink-main">
              Metro Trauma Hub (Bank A)
            </h3>
            <p className="text-xs text-ink-secondary">Central Delhi • Pusa Road Hub</p>

            <div className="mt-4 p-3 bg-white rounded-lg border border-red-200/80">
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-ink-secondary">O− Current Reserve:</span>
                <span className="text-xl font-display font-bold text-primary tabular-nums">
                  {facilities.find(f => f.facilityId === 'BB-DEL-A')?.stocks['O-'].units} Units
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden" aria-hidden="true">
                <div className="bg-primary h-full rounded-full w-[30%]" />
              </div>
              <div className="flex justify-between text-[11px] text-ink-secondary font-mono mt-1">
                <span>Floor req: 26u</span>
                <strong className="text-primary">Deficit: −18u</strong>
              </div>
            </div>
          </div>
        </div>
      </GlassPanel>

      {/* 4. Operational Facility Directory Grid (Scannable & Accessible) */}
      <section className="space-y-4" aria-labelledby="facilities-heading">
        <h2 id="facilities-heading" className="font-display font-bold text-lg text-ink-main">
          Regional Facility Posture & Serotype Availability ({filteredFacilities.length})
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredFacilities.map(facility => (
            <GlassPanel key={facility.facilityId} className="p-6 space-y-4">
              <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-ink-secondary font-bold uppercase">
                      {facility.type}
                    </span>
                    <span className="text-xs font-mono text-ink-secondary">{facility.facilityId}</span>
                  </div>
                  <h3 className="font-display font-bold text-lg text-ink-main mt-1">
                    {facility.facilityName}
                  </h3>
                  <p className="text-xs text-ink-secondary">{facility.location}</p>
                </div>

                <div className="text-right">
                  <span className="text-2xl font-display font-extrabold text-ink-main tabular-nums">
                    {facility.totalUnits}
                  </span>
                  <span className="text-xs text-ink-secondary block font-mono">Total Units Monitored</span>
                </div>
              </div>

              {/* 8 Serotype Stock Badges */}
              <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono">
                {Object.entries(facility.stocks).map(([bg, stock]) => {
                  const isCrit = stock.status === 'critical';
                  const isWarn = stock.status === 'warning';

                  return (
                    <div
                      key={bg}
                      className={`p-2.5 rounded-lg border transition-all ${
                        isCrit
                          ? 'bg-red-50 border-red-200 text-primary font-bold'
                          : isWarn
                          ? 'bg-amber-50 border-amber-200 text-amber-900 font-semibold'
                          : 'bg-slate-50 border-slate-200 text-ink-main'
                      }`}
                    >
                      <span className="text-[10px] opacity-75 uppercase block">{bg}</span>
                      <span className="text-sm font-bold block tabular-nums">{stock.units}u</span>
                      <span className="text-[10px] text-ink-secondary block font-normal">fl: {stock.safetyFloor}u</span>
                    </div>
                  );
                })}
              </div>
            </GlassPanel>
          ))}
        </div>
      </section>
    </div>
  );
};
