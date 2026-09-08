import React, { useState } from 'react';
import { GlassPanel } from '@/components/common/GlassPanel';
import { Button } from '@/components/common/Button';
import { SegmentedControl } from '@/components/common/SegmentedControl';
import { MOCK_INTEGRATIONS, MOCK_SYSTEM_METRICS } from '@/data/mockSystemHealth';

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('env');
  const [isPinging, setIsPinging] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const subTabs = [
    { value: 'env', label: 'Environment & Health' },
    { value: 'org', label: 'Governance & SOP' },
    { value: 'int', label: 'Data Integrations' },
    { value: 'thresh', label: 'Threshold Rules' },
    { value: 'audit', label: 'Audit Ledger' },
  ];

  const handleSimulateHeartbeat = () => {
    setIsPinging(true);
    setTimeout(() => {
      setIsPinging(false);
      setToastMsg('Heartbeat acknowledged: All 4 regional clinical engines nominal (14ms response).');
      setTimeout(() => setToastMsg(null), 5000);
    }, 800);
  };

  const handleDownloadDiagnostics = () => {
    const data = {
      system: 'RaktSaathi Operational Intelligence OS',
      version: 'v4.8-production-sandbox',
      generatedAt: new Date().toISOString(),
      cluster: 'Delhi-NCR Central Hub',
      metrics: MOCK_SYSTEM_METRICS,
      integrations: MOCK_INTEGRATIONS,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'raktsaathi-system-diagnostics.json';
    a.click();
  };

  return (
    <div className="space-y-8">
      {/* Toast */}
      {toastMsg && (
        <div
          role="alert"
          className="fixed top-20 right-8 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-xl shadow-card-elevated border border-emerald-500/60 flex items-center gap-3 animate-fade-in"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-beacon" aria-hidden="true" />
          <span className="text-xs font-mono text-slate-200">{toastMsg}</span>
        </div>
      )}

      {/* 1. Header & Quick Actions */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="space-y-1.5 max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-mono text-primary font-bold tracking-wider">
            <span className="material-symbols-outlined text-[16px]">tune</span>
            <span>SYSTEM RUNTIME CONFIGURATION • ENVIRONMENT HEALTH</span>
          </div>
          <h1 className="text-3xl font-display font-extrabold text-ink-main tracking-tight">
            System Configuration & Health
          </h1>
          <p className="text-sm text-ink-muted leading-relaxed">
            Operational telemetry, edge connectivity status, Snowflake lakehouse persistence streaming, and synthetic sandbox governance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="secondary"
            icon="download"
            onClick={handleDownloadDiagnostics}
          >
            Download Diagnostics
          </Button>
          <Button
            variant="primary"
            icon="speed"
            onClick={handleSimulateHeartbeat}
            isLoading={isPinging}
          >
            Simulate Heartbeat
          </Button>
        </div>
      </section>

      {/* 2. Sub-Navigation Tabs (Unified SegmentedControl) */}
      <div className="overflow-x-auto pb-1">
        <SegmentedControl
          options={subTabs}
          value={activeTab}
          onChange={setActiveTab}
          label="Settings domain navigation"
        />
      </div>

      {/* 3. Grouped Runtime Health Strip (Clean Utility-Focused Layout) */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-subtle">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 font-mono text-xs">
          <span className="text-ink-main font-bold uppercase tracking-wider">
            Cluster Runtime Health SLAs
          </span>
          <span className="text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            Delhi-NCR Node 01 &bull; 99.98% SLA
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
          {MOCK_SYSTEM_METRICS.map(m => (
            <div key={m.title} className="p-3.5 bg-slate-50 rounded-lg border border-slate-200/80">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-ink-secondary uppercase font-bold">{m.title}</span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {m.status}
                </span>
              </div>
              <strong className="text-xl font-display font-extrabold text-ink-main tabular-nums block mt-0.5">
                {m.value}
              </strong>
              <p className="text-[11px] text-ink-secondary mt-1">{m.subtext}</p>
              {m.delta && (
                <span className="text-[10px] text-emerald-700 font-semibold block mt-1">
                  {m.delta}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 4. Grouped Settings Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left (7 cols): Data Connections & Persistence */}
        <div className="lg:col-span-7 space-y-4">
          <GlassPanel className="p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">database</span>
                <h2 className="font-display font-bold text-base text-ink-main">
                  Data Connections & Lakehouse Persistence
                </h2>
              </div>
              <span className="text-xs font-mono text-emerald-800 font-bold bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                ALL SYSTEMS NOMINAL
              </span>
            </div>

            <div className="space-y-3">
              {MOCK_INTEGRATIONS.map(int => (
                <div key={int.name} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold font-display text-sm text-ink-main">{int.name}</span>
                    <span className="text-xs font-mono font-bold text-emerald-800 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-subtle">
                      Ping: {int.pingMs}ms &bull; {int.status}
                    </span>
                  </div>
                  <div className="text-xs font-mono text-ink-secondary truncate">
                    Cluster: {int.cluster}
                  </div>
                  <div className="flex items-center justify-between text-xs text-ink-secondary font-mono pt-1.5 border-t border-slate-200">
                    <span>Cadence: {int.syncCadence}</span>
                    <strong className="text-ink-main tabular-nums">{int.recordsIn24h}</strong>
                  </div>
                </div>
              ))}
            </div>
          </GlassPanel>
        </div>

        {/* Right (5 cols): Simulation Governance & Deterministic Sandbox */}
        <div className="lg:col-span-5 space-y-4">
          <GlassPanel className="p-6 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <span className="material-symbols-outlined text-primary text-[20px]">science</span>
              <h3 className="font-display font-bold text-base text-ink-main">
                Simulation Governance & Sandbox
              </h3>
            </div>

            <p className="text-xs text-ink-secondary leading-relaxed">
              This sandbox is grounded on deterministic synthetic datasets modeling Delhi-NCR trauma cases, ISBT blood inventories, and cold-chain transit networks.
            </p>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono space-y-2">
              <div className="flex justify-between">
                <span className="text-ink-secondary">Sandbox Region:</span>
                <strong className="text-ink-main">Delhi-NCR Metro Hub</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-secondary">Monte Carlo Seed:</span>
                <strong className="text-ink-main">DL-2026-9042</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-secondary">Synthetic Grounding:</span>
                <strong className="text-emerald-700">ZERO PII / HIPAA SAFE</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-secondary">Active Incident:</span>
                <strong className="text-primary">INC-2026-0881 (Bank A, O−)</strong>
              </div>
            </div>

            <div className="pt-2">
              <Button
                variant="secondary"
                size="md"
                className="w-full"
                icon="restart_alt"
                onClick={() => {
                  window.location.reload();
                }}
              >
                Reset Sandbox State to Baseline
              </Button>
            </div>
          </GlassPanel>
        </div>
      </div>
    </div>
  );
};
