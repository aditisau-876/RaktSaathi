import React, { useState } from 'react';
import { GlassPanel } from '@/components/common/GlassPanel';
import { Button } from '@/components/common/Button';
import { StatusBadge } from '@/components/common/StatusBadge';
import { useIncident } from '@/context/IncidentContext';
import { BloodGroup } from '@/core/types/inventory';
import { RequestPriority } from '@/core/types/requests';

export const HospitalRequestsPage: React.FC = () => {
  const { requests, simulateRequisition } = useIncident();
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');
  const [showSimModal, setShowSimModal] = useState<boolean>(false);

  // Simulation form states
  const [hospitalName, setHospitalName] = useState<string>('AIIMS Apex Trauma Center');
  const [department, setDepartment] = useState<string>('Emergency OR #02');
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('O-');
  const [unitsRequested, setUnitsRequested] = useState<number>(4);
  const [priority, setPriority] = useState<RequestPriority>('STAT');
  const [indication, setIndication] = useState<string>('Uncontrolled Abdominal Trauma Inflow');

  const filteredRequests = requests.filter(req => {
    if (selectedPriority === 'STAT') return req.priority === 'STAT';
    if (selectedPriority === 'URGENT') return req.priority === 'URGENT';
    if (selectedPriority === 'ROUTINE') return req.priority === 'ROUTINE';
    return true;
  });

  const handleSimulateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    simulateRequisition({
      hospitalName,
      department,
      leadClinician: 'Dr. S. Roy (On-Call)',
      bloodGroup,
      unitsRequested,
      priority,
      indication,
      etaMinutes: 15,
    });
    setShowSimModal(false);
  };

  return (
    <div className="space-y-8">
      {/* 1. Header & Controls */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="space-y-1.5 max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-mono text-primary font-bold tracking-wider">
            <span className="material-symbols-outlined text-[16px]">swap_horiz</span>
            <span>CLINICAL DEMAND STREAM • METROPOLITAN SURGICAL INFLOW</span>
          </div>
          <h1 className="text-3xl font-display font-extrabold text-ink-main tracking-tight">
            Hospital Requests
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            Real-time emergency surgery allocations, scheduled transfusion requisitions, and algorithmic demand-to-deficit propagation across hospital clusters.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-white border border-slate-200 p-1 rounded-xl shadow-xs text-xs font-mono">
            {['ALL', 'STAT', 'URGENT', 'ROUTINE'].map(p => (
              <button
                key={p}
                onClick={() => setSelectedPriority(p)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  selectedPriority === p ? 'bg-primary text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {p === 'ALL' ? 'All Requisitions' : p}
              </button>
            ))}
          </div>

          <Button
            variant="primary"
            icon="emergency"
            onClick={() => setShowSimModal(true)}
          >
            Simulate Emergency Requisition
          </Button>
        </div>
      </section>

      {/* 2. Demand Telemetry Strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 bg-slate-100/70 p-2 rounded-2xl">
        <div className="bg-white p-4 rounded-xl shadow-xs">
          <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Unfulfilled Demand</span>
          <div className="text-2xl font-display font-bold text-ink-main mt-1">48 Units</div>
          <span className="text-xs text-slate-500 font-mono">6 Apex Hospitals</span>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-xs">
          <span className="text-[10px] font-mono uppercase text-primary font-bold block">STAT Surge Priority</span>
          <div className="text-2xl font-display font-bold text-primary mt-1">18 Units</div>
          <span className="text-xs text-primary font-mono font-semibold">O-Neg Primary Driving Factor</span>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-xs">
          <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Next 12h Surgical Load</span>
          <div className="text-2xl font-display font-bold text-ink-main mt-1">34 Units</div>
          <span className="text-xs text-slate-500 font-mono">Elective & Bypass</span>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-xs">
          <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Mean Allocation Time</span>
          <div className="text-2xl font-display font-bold text-ink-main mt-1">4.2 Mins</div>
          <span className="text-xs text-slate-500 font-mono">Triage-to-Routing</span>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-xs col-span-2 md:col-span-1">
          <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Allocation Confidence</span>
          <div className="text-2xl font-display font-bold text-ink-main mt-1">99.1%</div>
          <span className="text-xs text-emerald-600 font-mono font-semibold">Clinical Rules Locked</span>
        </div>
      </div>

      {/* 3. Algorithmic Demand-to-Deficit Propagation Visualizer */}
      <GlassPanel elevation={1} className="p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-primary" />
            <h2 className="font-display font-bold text-base text-ink-main">
              Algorithmic Demand-to-Deficit Propagation
            </h2>
          </div>
          <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-slate-100 text-slate-600 font-bold uppercase">
            Dynamic Attribution Model
          </span>
        </div>

        {/* 4 Pipeline Blocks Connected */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          <div className="p-4 rounded-xl bg-red-50/70 border border-red-200">
            <div className="flex justify-between items-center text-[10px] font-mono text-primary font-bold">
              <span>INCOMING STAT</span>
              <span className="bg-red-600 text-white px-1.5 py-0.2 rounded">STAT</span>
            </div>
            <div className="font-display font-bold text-sm text-ink-main mt-1.5">AIIMS Trauma OR</div>
            <div className="text-2xl font-display font-extrabold text-primary mt-1">6u O−</div>
            <span className="text-[11px] text-slate-500">Aortic Emergency</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 font-bold">
              <span>SCHEDULED ROSTER</span>
              <span className="bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded">URGENT</span>
            </div>
            <div className="font-display font-bold text-sm text-ink-main mt-1.5">Safdarjung Cardiac</div>
            <div className="text-2xl font-display font-extrabold text-ink-main mt-1">8u O−</div>
            <span className="text-[11px] text-slate-500">Valve Replacement</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 font-bold">
              <span>SURGE ATTRIBUTION</span>
              <span className="bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded">+14u Surge</span>
            </div>
            <div className="font-display font-bold text-sm text-ink-main mt-1.5">Combined Demand</div>
            <div className="text-2xl font-display font-extrabold text-amber-600 mt-1">14 Units</div>
            <span className="text-[11px] text-slate-500">Accelerated Velocity</span>
          </div>

          <div className="p-4 rounded-xl bg-red-50 border-2 border-primary/40">
            <div className="flex justify-between items-center text-[10px] font-mono text-primary font-bold">
              <span>DEPLETION IMPACT</span>
              <span className="bg-primary text-white px-1.5 py-0.2 rounded">ALERT</span>
            </div>
            <div className="font-display font-bold text-sm text-ink-main mt-1.5">Bank A Metro Trauma</div>
            <div className="text-2xl font-display font-extrabold text-primary mt-1">−18u Deficit</div>
            <span className="text-[11px] text-primary font-semibold">T+18h Horizon Breach</span>
          </div>
        </div>
      </GlassPanel>

      {/* 4. Real-Time Hospital Requisition Queue */}
      <GlassPanel className="p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200/80 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="font-display font-bold text-base text-ink-main">
              Clinical Requisition Queue ({filteredRequests.length})
            </h2>
            <p className="text-xs text-slate-500">
              Live automated matching against regional cold-chain inventories.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">Stream synced &bull; Realtime</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="bg-slate-50/80 text-slate-500 border-b border-slate-200/80">
                <th className="py-3 px-6 font-bold uppercase tracking-wider">Requisition ID</th>
                <th className="py-3 px-6 font-bold uppercase tracking-wider">Hospital & Department</th>
                <th className="py-3 px-4 font-bold uppercase tracking-wider text-center">Serotype</th>
                <th className="py-3 px-4 font-bold uppercase tracking-wider text-center">Units</th>
                <th className="py-3 px-4 font-bold uppercase tracking-wider text-center">Priority</th>
                <th className="py-3 px-4 font-bold uppercase tracking-wider text-center">Status</th>
                <th className="py-3 px-6 font-bold uppercase tracking-wider">Clinical Indication</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filteredRequests.map(req => (
                <tr key={req.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-6 font-mono font-bold text-ink-main">{req.id}</td>
                  <td className="py-3 px-6">
                    <span className="font-bold text-ink-main block">{req.hospitalName}</span>
                    <span className="text-[11px] text-slate-400 font-mono">{req.department} • {req.leadClinician}</span>
                  </td>
                  <td className="py-3 px-4 text-center font-mono font-bold text-sm text-primary">{req.bloodGroup}</td>
                  <td className="py-3 px-4 text-center font-mono font-bold text-sm text-ink-main">{req.unitsRequested}u</td>
                  <td className="py-3 px-4 text-center">
                    <StatusBadge
                      variant={req.priority === 'STAT' ? 'stat' : req.priority === 'URGENT' ? 'urgent' : 'routine'}
                      label={req.priority}
                      hasPulseDot={req.priority === 'STAT'}
                    />
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                      req.status === 'ALLOCATED'
                        ? 'bg-emerald-50 text-emerald-700'
                        : req.status === 'IN_TRANSIT'
                        ? 'bg-sky-50 text-sky-700'
                        : 'bg-amber-50 text-amber-800 animate-pulse'
                    }`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="py-3 px-6 text-xs text-slate-600 max-w-xs truncate">{req.indication}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassPanel>

      {/* 5. Simulate Emergency Requisition Modal */}
      {showSimModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-primary animate-ping" />
                <h3 className="font-display font-bold text-lg text-ink-main">
                  Simulate Emergency Hospital Requisition
                </h3>
              </div>
              <button onClick={() => setShowSimModal(false)} className="text-slate-400 hover:text-ink-main">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSimulateSubmit} className="space-y-4 text-xs font-mono">
              <div>
                <label className="text-slate-500 font-bold block mb-1 uppercase">Requesting Hospital</label>
                <input
                  type="text"
                  value={hospitalName}
                  onChange={e => setHospitalName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:border-primary outline-none text-xs font-sans font-medium"
                />
              </div>

              <div>
                <label className="text-slate-500 font-bold block mb-1 uppercase">Clinical Department</label>
                <input
                  type="text"
                  value={department}
                  onChange={e => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:border-primary outline-none text-xs font-sans font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-500 font-bold block mb-1 uppercase">Blood Group</label>
                  <select
                    value={bloodGroup}
                    onChange={e => setBloodGroup(e.target.value as BloodGroup)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 font-bold"
                  >
                    {['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'].map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-500 font-bold block mb-1 uppercase">Units Demanded</label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={unitsRequested}
                    onChange={e => setUnitsRequested(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-500 font-bold block mb-1 uppercase">Clinical Priority</label>
                <div className="grid grid-cols-3 gap-2 font-bold">
                  {(['STAT', 'URGENT', 'ROUTINE'] as RequestPriority[]).map(p => (
                    <button
                      type="button"
                      key={p}
                      onClick={() => setPriority(p)}
                      className={`py-2 rounded-lg border text-center transition-all ${
                        priority === p ? 'bg-primary text-white border-primary shadow-xs' : 'bg-slate-50 text-slate-600 border-slate-200'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-slate-500 font-bold block mb-1 uppercase">Clinical Indication</label>
                <input
                  type="text"
                  value={indication}
                  onChange={e => setIndication(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:border-primary outline-none text-xs font-sans"
                />
              </div>

              <div className="pt-2">
                <Button variant="primary" type="submit" className="w-full" icon="bolt">
                  Submit & Propagate Deficit
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
