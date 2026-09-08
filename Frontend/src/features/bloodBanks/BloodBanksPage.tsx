import React, { useState } from 'react';
import { GlassPanel } from '@/components/common/GlassPanel';
import { Button } from '@/components/common/Button';
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

  return (
    <div className="space-y-8">
      {/* Toast */}
      {simMessage && (
        <div className="fixed top-20 right-8 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-xl shadow-xl border border-emerald-500/50 flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
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
          <p className="text-sm text-slate-500 leading-relaxed">
            Real-time blood stock posture, inter-bank rebalancing availability, and cold-chain transport surveillance across the Delhi-NCR network.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 bg-white border border-slate-200 p-1.5 rounded-xl shadow-xs">
          <button
            onClick={() => setSelectedFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
              selectedFilter === 'ALL' ? 'bg-primary text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Facilities
          </button>
          <button
            onClick={() => setSelectedFilter('O-')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
              selectedFilter === 'O-' ? 'bg-primary text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            O− Negative Focus
          </button>
          <button
            onClick={() => setSelectedFilter('SURPLUS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
              selectedFilter === 'SURPLUS' ? 'bg-primary text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Surplus Reservoirs
          </button>
        </div>
      </section>

      {/* 2. Unified Network Metric Band */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 divide-y md:divide-y-0 md:divide-x divide-slate-100">
          <div className="p-2">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">Monitored Facilities</span>
            <div className="text-2xl font-display font-bold text-ink-main mt-1">14 Banks</div>
            <span className="text-xs text-slate-500 font-mono">4 Primary Hubs Active</span>
          </div>
          <div className="p-2 md:pl-4 pt-4 md:pt-2">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">Network Inventory</span>
            <div className="text-2xl font-display font-bold text-ink-main mt-1">1,420 Units</div>
            <span className="text-xs text-emerald-600 font-mono">+48u shift over 6h</span>
          </div>
          <div className="p-2 md:pl-4 pt-4 md:pt-2">
            <span className="text-[10px] font-mono text-primary uppercase font-bold block">Critical Deficit</span>
            <div className="text-2xl font-display font-bold text-primary mt-1">Bank A (O−)</div>
            <span className="text-xs text-primary font-mono font-bold">Immediate gap: 18u</span>
          </div>
          <div className="p-2 md:pl-4 pt-4 md:pt-2">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">Surplus Reservoir</span>
            <div className="text-2xl font-display font-bold text-ink-main mt-1">47 Units O−</div>
            <span className="text-xs text-emerald-600 font-mono">+32u deployable (Bank B)</span>
          </div>
          <div className="p-2 md:pl-4 pt-4 md:pt-2">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">Cold-Chain Fleet</span>
            <div className="text-2xl font-display font-bold text-ink-main mt-1">6 Active</div>
            <span className="text-xs text-slate-500 font-mono">Ready for dispatch</span>
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
            <p className="text-xs text-slate-500">
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
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold uppercase">
                Surplus Source Node
              </span>
              <span className="text-slate-400">#BB-NOI-B</span>
            </div>
            <h3 className="font-display font-bold text-base text-ink-main">
              Noida Regional Center (Bank B)
            </h3>
            <p className="text-xs text-slate-500">Sector 62, Noida • Regional Depository</p>

            <div className="mt-4 p-3 bg-white rounded-lg border border-emerald-200/80">
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-slate-500">O− Available Stock:</span>
                <span className="text-xl font-display font-bold text-emerald-700">47 Units</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full w-[85%]" />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                <span>Buffer req: 15u</span>
                <span className="font-bold text-emerald-700">+32u Deployable Surplus</span>
              </div>
            </div>
          </div>

          {/* Midsection: Transit Vector (4 cols) */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center text-center p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-primary">
              <span className="material-symbols-outlined text-[18px]">local_shipping</span>
              <span>MedExpress Courier #04</span>
            </div>

            <div className="w-full relative flex items-center justify-center my-1">
              <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden relative">
                <div className="h-full bg-primary rounded-full animate-pulse w-3/4" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 w-full text-[11px] font-mono">
              <div className="bg-white p-2 rounded border border-slate-200">
                <span className="text-slate-400 block text-[9px] uppercase">Route Corridor</span>
                <span className="font-bold text-ink-main">NH-24 Green Wave</span>
              </div>
              <div className="bg-white p-2 rounded border border-slate-200">
                <span className="text-slate-400 block text-[9px] uppercase">Transit Window</span>
                <span className="font-bold text-primary">38 Mins ETA</span>
              </div>
            </div>

            <span className="text-[10px] text-slate-500 font-mono">
              Cold-Chain Monitored: <strong className="text-emerald-700">3.6°C Nominal</strong>
            </span>
          </div>

          {/* Sink: Bank A (Metro Trauma Hub) (4 cols) */}
          <div className="lg:col-span-4 p-5 rounded-xl bg-red-50/60 border border-red-200">
            <div className="flex items-center justify-between text-xs font-mono mb-2">
              <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 font-bold uppercase">
                Deficit Destination Hub
              </span>
              <span className="text-slate-400">#BB-DEL-A</span>
            </div>
            <h3 className="font-display font-bold text-base text-ink-main">
              Metro Trauma Hub (Bank A)
            </h3>
            <p className="text-xs text-slate-500">Central Delhi • Pusa Road Hub</p>

            <div className="mt-4 p-3 bg-white rounded-lg border border-red-200/80">
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-slate-500">O− Current Reserve:</span>
                <span className="text-xl font-display font-bold text-primary">
                  {facilities.find(f => f.facilityId === 'BB-DEL-A')?.stocks['O-'].units} Units
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
                <div className="bg-red-500 h-full rounded-full w-[30%]" />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                <span>Floor req: 26u</span>
                <span className="font-bold text-primary">Deficit: −18u</span>
              </div>
            </div>
          </div>
        </div>
      </GlassPanel>

      {/* 4. Detailed Facility Directory Grid */}
      <section className="space-y-4">
        <h2 className="font-display font-bold text-lg text-ink-main">
          Regional Facility Posture & Serotype Stocks
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredFacilities.map(facility => (
            <GlassPanel key={facility.facilityId} className="p-6 space-y-4">
              <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-bold uppercase">
                      {facility.type}
                    </span>
                    <span className="text-xs font-mono text-slate-400">{facility.facilityId}</span>
                  </div>
                  <h3 className="font-display font-bold text-lg text-ink-main mt-1">
                    {facility.facilityName}
                  </h3>
                  <p className="text-xs text-slate-500">{facility.location}</p>
                </div>

                <div className="text-right">
                  <span className="text-2xl font-display font-extrabold text-ink-main">
                    {facility.totalUnits}
                  </span>
                  <span className="text-xs text-slate-400 block font-mono">Total Units Monitored</span>
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
                      className={`p-2 rounded-lg border ${
                        isCrit
                          ? 'bg-red-50 border-red-200 text-primary font-bold'
                          : isWarn
                          ? 'bg-amber-50 border-amber-200 text-amber-800'
                          : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <span className="text-[10px] opacity-75 uppercase block">{bg}</span>
                      <span className="text-sm font-bold block">{stock.units}u</span>
                      <span className="text-[9px] text-slate-400 block font-normal">fl: {stock.safetyFloor}u</span>
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
