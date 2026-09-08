import React, { useState } from 'react';
import { GlassPanel } from '@/components/common/GlassPanel';
import { Button } from '@/components/common/Button';
import { MOCK_INTEGRATIONS, MOCK_SYSTEM_METRICS } from '@/data/mockSystemHealth';

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('env');
  const [isPinging, setIsPinging] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const subTabs = [
    { id: 'env', label: 'Environment & Health', icon: 'memory' },
    { id: 'org', label: 'Organization & Governance', icon: 'corporate_fare' },
    { id: 'int', label: 'Data Integrations', icon: 'hub' },
    { id: 'thresh', label: 'Forecast Thresholds', icon: 'tune' },
    { id: 'audit', label: 'Audit Ledger', icon: 'history_edu' },
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
        <div className="fixed top-20 right-8 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-xl shadow-xl border border-emerald-500/50 flex items-center gap-3 animate-fade-in">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
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
          <p className="text-sm text-slate-500 leading-relaxed">
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

      {/* 2. Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {subTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-white text-primary border border-slate-200 shadow-xs'
                : 'text-slate-500 hover:bg-slate-100 hover:text-ink-main'
            }`}
          >
            <span className="material-symbols-outlined text-[17px]">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* 3. High-Level Posture Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {MOCK_SYSTEM_METRICS.map(m => (
          <div key={m.title} className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider">{m.title}</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-mono text-[9px] font-bold">
                {m.status.toUpperCase()}
              </span>
            </div>
            <div>
              <div className="text-2xl font-display font-extrabold text-ink-main">{m.value}</div>
              <p className="text-xs text-slate-500 mt-1">{m.subtext}</p>
            </div>
            {m.delta && (
              <span className="text-[11px] font-mono text-emerald-600 font-semibold mt-2 block">
                {m.delta}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* 4. Persistence & Micro-Telemetry Grid */}
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
              <span className="text-xs font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                ALL SYSTEMS NOMINAL
              </span>
            </div>

            <div className="space-y-4">
              {MOCK_INTEGRATIONS.map(int => (
                <div key={int.name} className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold font-display text-sm text-ink-main">{int.name}</span>
                    <span className="text-xs font-mono font-bold text-emerald-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                      Ping: {int.pingMs}ms &bull; {int.status}
                    </span>
                  </div>
                  <div className="text-xs font-mono text-slate-500 truncate">
                    Cluster: {int.cluster}
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400 font-mono pt-1 border-t border-slate-200/60">
                    <span>Cadence: {int.syncCadence}</span>
                    <span className="font-semibold text-ink-main">{int.recordsIn24h}</span>
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

            <p className="text-xs text-slate-500 leading-relaxed">
              This sandbox is grounded on deterministic synthetic datasets modeling Delhi-NCR trauma cases, ISBT blood inventories, and cold-chain transit networks.
            </p>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Sandbox Region:</span>
                <span className="font-bold text-ink-main">Delhi-NCR Metro Hub</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Monte Carlo Seed:</span>
                <span className="font-bold text-ink-main">DL-2026-9042</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Synthetic Grounding:</span>
                <span className="font-bold text-emerald-600">ZERO PII / HIPAA SAFE</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Active Incident:</span>
                <span className="font-bold text-primary">INC-2026-0881 (Bank A, O−)</span>
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
