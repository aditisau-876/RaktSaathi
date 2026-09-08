import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { GlassPanel } from '@/components/common/GlassPanel';
import { Button } from '@/components/common/Button';
import { MOCK_DONORS, MOCK_DONOR_WAVES } from '@/data/mockDonors';

export const DonorNetworkPage: React.FC = () => {
  const [selectedWave, setSelectedWave] = useState<number | 'ALL'>('ALL');
  const [mobilizedWave, setMobilizedWave] = useState<number | null>(null);

  const filteredDonors = MOCK_DONORS.filter(d => {
    if (selectedWave === 'ALL') return true;
    return d.wave === selectedWave;
  });

  const handleMobilize = (waveNum: number) => {
    setMobilizedWave(waveNum);
    setTimeout(() => setMobilizedWave(null), 5000);
  };

  return (
    <div className="space-y-8">
      {/* Toast */}
      {mobilizedWave && (
        <div className="fixed top-20 right-8 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-xl shadow-xl border border-emerald-500/50 flex items-center gap-3 animate-fade-in">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-xs font-mono text-slate-200">
            Wave {mobilizedWave} dispatch alert transmitted to {MOCK_DONOR_WAVES[mobilizedWave - 1].donorCount} pre-screened O− donors!
          </span>
        </div>
      )}

      {/* 1. Header & Controls */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="space-y-1.5 max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-mono text-primary font-bold tracking-wider">
            <span className="material-symbols-outlined text-[16px]">group</span>
            <span>PROXIMITY CORRIDORS • PRIVACY-SAFE SYNTHETIC MOBILIZATION</span>
          </div>
          <h1 className="text-3xl font-display font-extrabold text-ink-main tracking-tight">
            Donor Network Outreach Intelligence
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            Autonomous mobilization pipeline calibrating proximity corridors, historical response velocity, and ethical NBTC safe-harbor synthetic models to reinforce regional supply buffers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/campaign-studio">
            <Button variant="primary" icon="campaign" iconPosition="right">
              Broadcast to Campaign Studio
            </Button>
          </Link>
        </div>
      </section>

      {/* 2. Executive Network Posture Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider">Active Radius Corridor</span>
            <span className="material-symbols-outlined text-primary text-[20px]">near_me</span>
          </div>
          <div>
            <div className="text-3xl font-display font-extrabold text-ink-main">84 O− Donors</div>
            <p className="text-xs text-slate-500 mt-1">Pre-screened within 8km active transit grid of Bank A</p>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-primary h-full rounded-full w-[78%]" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono text-primary uppercase font-bold tracking-wider">High Priority Wave 1</span>
            <span className="material-symbols-outlined text-primary text-[20px]">send_time_extension</span>
          </div>
          <div>
            <div className="text-3xl font-display font-extrabold text-primary">20 Donors Primed</div>
            <p className="text-xs text-slate-500 mt-1">Instant automated multi-channel dispatch readiness</p>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-primary h-full rounded-full w-full" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider">Historical Conversion</span>
            <span className="material-symbols-outlined text-emerald-600 text-[20px]">insights</span>
          </div>
          <div>
            <div className="text-3xl font-display font-extrabold text-ink-main">91.4% Index</div>
            <p className="text-xs text-slate-500 mt-1">High-confidence affirmative response profile in South Delhi</p>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full w-[91%]" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider">Privacy Protocol</span>
            <span className="material-symbols-outlined text-slate-600 text-[20px]">shield</span>
          </div>
          <div>
            <div className="text-3xl font-display font-extrabold text-ink-main">Zero PII Leak</div>
            <p className="text-xs text-slate-500 mt-1">NBTC safe harbor cryptographic tokens & masked geolocation</p>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-slate-700 h-full rounded-full w-full" />
          </div>
        </div>
      </div>

      {/* 3. Spatial Corridors & Wave Mobilization */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left (7 cols): Dynamic Corridor Telemetry SVG Map */}
        <div className="lg:col-span-7">
          <GlassPanel className="p-6 h-full flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">hub</span>
                <h2 className="font-display font-bold text-base text-ink-main">
                  Dynamic Corridor Telemetry
                </h2>
              </div>
              <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
                <span>RT-GIS Sync &bull; Delhi NCR</span>
              </span>
            </div>

            {/* SVG Spatial Radar Rings */}
            <div className="w-full h-80 relative bg-slate-50/70 rounded-2xl border border-slate-200/80 p-4 flex items-center justify-center overflow-hidden">
              <svg className="w-full h-full" viewBox="0 0 500 320">
                {/* Concentric Proximity Rings around Hub */}
                <circle cx="250" cy="160" r="140" fill="none" stroke="#E2E8F0" strokeWidth="1.5" strokeDasharray="3 3" />
                <circle cx="250" cy="160" r="95" fill="none" stroke="#CBD5E1" strokeWidth="1.5" strokeDasharray="4 3" />
                <circle cx="250" cy="160" r="50" fill="none" stroke="#FDA4AF" strokeWidth="2" strokeDasharray="5 3" />

                {/* Central Crisis Epicenter (Bank A) */}
                <circle cx="250" cy="160" r="24" fill="#DC2626" fillOpacity="0.1" className="risk-pulse-critical" />
                <circle cx="250" cy="160" r="12" fill="#93000B" stroke="#FFFFFF" strokeWidth="3" />
                <text x="250" y="195" textAnchor="middle" fill="#0F172A" fontSize="11" fontWeight="800" fontFamily="Plus Jakarta Sans">
                  METRO TRAUMA HUB (BANK A)
                </text>
                <text x="250" y="210" textAnchor="middle" fill="#93000B" fontSize="9" fontWeight="700" fontFamily="JetBrains Mono">
                  CRISIS CENTER: −18u GAP
                </text>

                {/* Distance Ring Labels */}
                <text x="305" y="155" fill="#DC2626" fontSize="9" fontWeight="700" fontFamily="JetBrains Mono">3km (Wave 1)</text>
                <text x="350" y="155" fill="#64748B" fontSize="9" fontWeight="600" fontFamily="JetBrains Mono">5km (Wave 2)</text>
                <text x="395" y="155" fill="#94A3B8" fontSize="9" fontWeight="500" fontFamily="JetBrains Mono">8km (Wave 3)</text>

                {/* Wave 1 Donor Nodes */}
                <circle cx="220" cy="140" r="5" fill="#93000B" />
                <circle cx="270" cy="130" r="5" fill="#93000B" />
                <circle cx="240" cy="120" r="5" fill="#93000B" />
                <circle cx="275" cy="175" r="5" fill="#93000B" />
                <circle cx="230" cy="180" r="5" fill="#93000B" />

                {/* Wave 2 Donor Nodes */}
                <circle cx="180" cy="130" r="4.5" fill="#EA580C" />
                <circle cx="320" cy="140" r="4.5" fill="#EA580C" />
                <circle cx="290" cy="220" r="4.5" fill="#EA580C" />
                <circle cx="190" cy="200" r="4.5" fill="#EA580C" />

                {/* Wave 3 Donor Nodes */}
                <circle cx="140" cy="110" r="4" fill="#64748B" />
                <circle cx="360" cy="120" r="4" fill="#64748B" />
                <circle cx="340" cy="240" r="4" fill="#64748B" />
                <circle cx="150" cy="230" r="4" fill="#64748B" />
              </svg>
            </div>

            <div className="flex items-center justify-between text-xs font-mono text-slate-500 pt-2">
              <span>Wave 1: &lt;5km radius (11–18 min transit)</span>
              <span className="text-primary font-bold">20 High-Probability Donors</span>
            </div>
          </GlassPanel>
        </div>

        {/* Right (5 cols): Triage Waves Breakdown & Dispatch */}
        <div className="lg:col-span-5 space-y-4">
          <GlassPanel className="p-6 space-y-4">
            <h3 className="font-display font-bold text-base text-ink-main">
              Mobilization Queue by Proximity Tiers
            </h3>

            {MOCK_DONOR_WAVES.map(w => (
              <div
                key={w.wave}
                className={`p-4 rounded-xl border transition-all ${
                  w.wave === 1
                    ? 'bg-red-50/50 border-primary/30'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                    w.wave === 1 ? 'bg-primary text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    Wave 0{w.wave} Corridor ({w.radiusKm} km)
                  </span>
                  <span className="text-xs font-mono text-slate-400">ETA: ~{w.avgResponseMins}m</span>
                </div>

                <div className="flex justify-between items-baseline mt-1">
                  <span className="text-xl font-display font-bold text-ink-main">
                    {w.donorCount} Donors Ready
                  </span>
                  <span className="text-xs font-mono text-emerald-700 font-bold">
                    +{w.estimatedUnits} Units Yield
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <button
                    onClick={() => setSelectedWave(w.wave)}
                    className="text-xs font-mono text-slate-600 hover:text-ink-main underline"
                  >
                    Filter Table Below
                  </button>
                  <Button
                    variant={w.wave === 1 ? 'primary' : 'secondary'}
                    size="sm"
                    icon="send"
                    onClick={() => handleMobilize(w.wave)}
                  >
                    Mobilize Wave {w.wave}
                  </Button>
                </div>
              </div>
            ))}
          </GlassPanel>
        </div>
      </div>

      {/* 4. Privacy-Safe Synthetic Donor Stream */}
      <GlassPanel className="p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200/80 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="font-display font-bold text-base text-ink-main">
              Privacy-Safe Synthetic Donor Stream
            </h2>
            <p className="text-xs text-slate-500">
              NBTC safe-harbor compliance enforced. Cryptographic identifiers mask donor PII.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedWave('ALL')}
              className={`px-2.5 py-1 rounded text-xs font-mono font-bold ${
                selectedWave === 'ALL' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              All Waves ({MOCK_DONORS.length})
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="bg-slate-50/80 text-slate-500 border-b border-slate-200/80">
                <th className="py-3 px-6 font-bold uppercase tracking-wider">Token ID</th>
                <th className="py-3 px-6 font-bold uppercase tracking-wider">Cohort Cluster</th>
                <th className="py-3 px-4 font-bold uppercase tracking-wider text-center">Serotype</th>
                <th className="py-3 px-4 font-bold uppercase tracking-wider text-center">Distance</th>
                <th className="py-3 px-4 font-bold uppercase tracking-wider text-center">Travel ETA</th>
                <th className="py-3 px-4 font-bold uppercase tracking-wider text-center">Response Prob.</th>
                <th className="py-3 px-4 font-bold uppercase tracking-wider text-center">Last Donation</th>
                <th className="py-3 px-6 font-bold uppercase tracking-wider text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filteredDonors.map(d => (
                <tr key={d.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-6 font-mono font-bold text-ink-main">{d.id}</td>
                  <td className="py-3 px-6">
                    <span className="font-semibold text-ink-main block">{d.cluster}</span>
                    <span className="text-[11px] text-slate-400 font-mono">Wave {d.wave} &bull; {d.contactMasked}</span>
                  </td>
                  <td className="py-3 px-4 text-center font-mono font-bold text-sm text-primary">{d.bloodGroup}</td>
                  <td className="py-3 px-4 text-center font-mono">{d.distanceKm} km</td>
                  <td className="py-3 px-4 text-center font-mono font-bold text-ink-main">{d.travelMinutes} mins</td>
                  <td className="py-3 px-4 text-center font-mono font-bold text-emerald-600">{d.responseProbability}%</td>
                  <td className="py-3 px-4 text-center font-mono text-slate-500">{d.lastDonationWeeks}w ago</td>
                  <td className="py-3 px-6 text-center">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-mono font-bold text-[10px] border border-emerald-200">
                      {d.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassPanel>
    </div>
  );
};
