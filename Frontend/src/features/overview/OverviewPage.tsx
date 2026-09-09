import React from 'react';
import { Link } from 'react-router-dom';
import { RiskPulse } from '@/components/common/RiskPulse';
import { Button } from '@/components/common/Button';
import { useIncident } from '@/context/IncidentContext';
import { RadarNetwork3D } from '@/features/radar/RadarNetwork3D';

export const OverviewPage: React.FC = () => {
  const { activeIncident } = useIncident();

  return (
    <div className="space-y-8 animate-fade-in">
      <section className="flex flex-col xl:flex-row xl:items-end justify-between gap-5">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/75 border border-slate-200/80 shadow-subtle text-[9px] font-mono uppercase tracking-[.12em] text-slate-500">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-beacon" />
            08 September 2026 · Delhi-NCR demo region
          </div>
          <h1 className="mt-4 font-display text-4xl sm:text-5xl font-black tracking-[-.055em] text-ink-main">
            Good morning, Dr. Rao.
          </h1>
          <p className="mt-3 text-sm sm:text-[15px] text-slate-500 leading-7 max-w-2xl">
            One incident needs attention now: <strong className="text-slate-800">Metro Trauma Hub (Bank A)</strong> is projected to cross its O− safety floor in 18 hours. A verified surplus corridor from Bank B is available.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="px-4 py-2.5 rounded-2xl bg-white/80 border border-slate-200 shadow-subtle">
            <span className="block text-[8px] font-mono uppercase tracking-[.12em] text-slate-400">Runout horizon</span>
            <strong className="block mt-1 text-primary font-display text-lg tabular-nums">T+18h</strong>
          </div>
          <Link to="/decision-center">
            <Button variant="primary" size="md" icon="arrow_forward" iconPosition="right">Open decision center</Button>
          </Link>
        </div>
      </section>

      <section className="grid xl:grid-cols-[minmax(340px,.72fr)_minmax(0,1.28fr)] gap-5">
        <div className="relative overflow-hidden rounded-[30px] bg-white/78 border border-red-100 shadow-[0_24px_70px_rgba(147,0,11,.08)] p-5 sm:p-7">
          <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-red-100/40 blur-3xl" />
          <div className="relative flex items-center justify-between mb-3">
            <div>
              <span className="section-kicker">RISK INSTRUMENT</span>
              <h2 className="mt-1 font-display text-xl font-extrabold tracking-tight">O− reserve pressure</h2>
            </div>
            <span className="status-chip status-chip-critical">CRITICAL</span>
          </div>
          <div className="min-h-[330px] flex items-center justify-center">
            <RiskPulse
              size="xl"
              severity={activeIncident.severity}
              units={activeIncident.currentStock}
              mandatedFloor={activeIncident.mandatedFloor}
              label={`${activeIncident.bloodGroup} PRBC`}
              sublabel={`Safety floor: ${activeIncident.mandatedFloor}u`}
            />
          </div>
          <div className="relative flex items-center justify-between border-t border-slate-200/70 pt-4 text-[9px] font-mono uppercase tracking-[.08em] text-slate-400">
            <span>Live telemetry synced</span>
            <strong className="text-primary">−18u projected gap</strong>
          </div>
        </div>

        <div className="min-w-0 rounded-[30px] bg-[#111722] border border-white/10 overflow-hidden shadow-[0_24px_70px_rgba(15,23,42,.16)]">
          <div className="px-5 sm:px-7 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10">
            <div>
              <span className="text-[9px] font-mono uppercase tracking-[.14em] text-red-300">SPATIAL RESPONSE MAP</span>
              <h2 className="mt-1 text-white font-display text-xl font-extrabold tracking-tight">Delhi-NCR supply topology</h2>
            </div>
            <Link to="/radar" className="text-[9px] font-mono uppercase tracking-[.1em] text-slate-300 hover:text-white inline-flex items-center gap-1">
              Open full radar <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </Link>
          </div>
          <div className="h-[430px]">
            <RadarNetwork3D selectedSerotype="O-" selectedFacilityId="BB-DEL-A" onSelectFacility={() => {}} />
          </div>
        </div>
      </section>

      <section className="grid lg:grid-cols-[1.35fr_.65fr] gap-5">
        <div className="rounded-[28px] bg-white/78 border border-slate-200/80 shadow-subtle p-6 sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="section-kicker">THE INCIDENT IN FOUR ANSWERS</span>
              <h2 className="mt-2 font-display text-2xl font-extrabold tracking-[-.035em]">Metro Trauma Hub · Bank A</h2>
            </div>
            <span className="status-chip status-chip-critical">18h horizon</span>
          </div>
          <div className="mt-7 grid sm:grid-cols-2 gap-3">
            <div className="overview-answer critical">
              <span>01 · WHAT</span>
              <strong>8u available · −18u gap</strong>
              <p>O− inventory is below the 26u safety floor; burn velocity is elevated.</p>
            </div>
            <div className="overview-answer">
              <span>02 · WHERE</span>
              <strong>Central Delhi · Pusa Road</strong>
              <p>Connected to the emergency and ICU demand network in the demo region.</p>
            </div>
            <div className="overview-answer">
              <span>03 · WHEN</span>
              <strong>T+18h projected runout</strong>
              <p>Forecast indicates depletion without an intervention.</p>
            </div>
            <div className="overview-answer stable">
              <span>04 · ACTION</span>
              <strong>Bank B · +32u deployable</strong>
              <p>A simulated cold-chain corridor can close the projected gap.</p>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 pt-5 border-t border-slate-200/70">
            <span className="text-[10px] text-slate-400 font-mono">Prediction → evidence → action pending</span>
            <Link to="/decision-center"><Button variant="primary" size="sm" icon="arrow_forward" iconPosition="right">Resolve in Decision Center</Button></Link>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-1 gap-3">
          {[
            ['REGIONAL SUPPLY BUFFER', '1,420', 'units', 'Bank B +32u deployable', 'stable'],
            ['DEMAND ACCELERATION', '48', 'pending', '18u STAT · 1 critical shortage', 'critical'],
            ['MOBILIZATION POOL', '84', 'donors', 'Wave 1 readiness', 'stable'],
            ['DATA INGESTION', '14', 'ms stream', 'Cloudinary → Snowflake synced', 'neutral'],
          ].map(([label, value, unit, detail, state]) => (
            <div key={label} className={`overview-metric ${state}`}>
              <span>{label}</span>
              <div><strong>{value}</strong><small>{unit}</small></div>
              <em>{detail}</em>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
