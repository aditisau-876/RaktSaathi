import React, { useState } from 'react';
import { GlassPanel } from '@/components/common/GlassPanel';
import { Button } from '@/components/common/Button';
import { StatusBadge } from '@/components/common/StatusBadge';
import { SegmentedControl } from '@/components/common/SegmentedControl';
import { MetricTile } from '@/components/common/MetricTile';
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

  const priorityOptions = [
    { value: 'ALL', label: 'All Requisitions', badge: requests.length },
    { value: 'STAT', label: 'STAT Only', alertDot: true },
    { value: 'URGENT', label: 'Urgent' },
    { value: 'ROUTINE', label: 'Routine' },
  ];

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
      {/* 1. Header & Primary Action Controls */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="space-y-1.5 max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-mono text-primary font-bold tracking-wider">
            <span className="material-symbols-outlined text-[16px]">swap_horiz</span>
            <span>CLINICAL DEMAND STREAM • METROPOLITAN SURGICAL INFLOW</span>
          </div>
          <h1 className="text-3xl font-display font-extrabold text-ink-main tracking-tight">
            Hospital Requests
          </h1>
          <p className="text-sm text-ink-muted leading-relaxed">
            Emergency surgery requisitions, scheduled transfusion allocations, and algorithmic demand-to-deficit propagation across hospital endpoints.
          </p>
        </div>

        {/* Priority Filter & Trigger Button */}
        <div className="flex flex-wrap items-center gap-3">
          <SegmentedControl
            options={priorityOptions}
            value={selectedPriority}
            onChange={setSelectedPriority}
            label="Request priority filter"
          />

          <Button
            variant="primary"
            icon="emergency"
            onClick={() => setShowSimModal(true)}
          >
            Simulate Emergency Requisition
          </Button>
        </div>
      </section>

      {/* 2. Focused Demand Telemetry (Key Operational KPIs) */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4" aria-label="Demand Telemetry Overview">
        <MetricTile
          label="Unfulfilled Active Demand"
          value="48"
          unit="Units"
          subtext="6 Apex Hospital clusters"
          icon="inventory"
          trend={{ value: "High Triage Load", isWarning: true }}
          progressPercent={70}
        />
        <MetricTile
          label="STAT Surge Priority"
          value="18"
          unit="Units"
          subtext="O− PRBC primary driver"
          icon="crisis_alert"
          isCritical={true}
          trend={{ value: "Aortic Trauma Active", isCritical: true }}
          progressPercent={88}
        />
        <MetricTile
          label="Mean Allocation Routing"
          value="4.2"
          unit="Mins"
          subtext="Triage-to-routing response"
          icon="speed"
          trend={{ value: "SLA Compliant (≤5m)", isPositive: true }}
          progressPercent={95}
        />
      </section>

      {/* 3. Algorithmic Demand-to-Deficit Propagation Visualizer */}
      <GlassPanel elevation={1} className="p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-primary" aria-hidden="true" />
            <h2 className="font-display font-bold text-base text-ink-main">
              Algorithmic Demand-to-Deficit Propagation
            </h2>
          </div>
          <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-slate-100 text-ink-secondary font-bold uppercase">
            Dynamic Attribution Flow
          </span>
        </div>

        {/* 4 Propagation Blocks Connected */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          <div className="p-4 rounded-xl bg-red-50/70 border border-red-200">
            <div className="flex justify-between items-center text-[10px] font-mono text-primary font-bold">
              <span>INCOMING STAT</span>
              <span className="bg-primary text-white px-1.5 py-0.2 rounded font-mono">STAT</span>
            </div>
            <div className="font-display font-bold text-sm text-ink-main mt-1.5">AIIMS Trauma OR</div>
            <div className="text-2xl font-display font-extrabold text-primary mt-1 tabular-nums">6u O−</div>
            <span className="text-[11px] text-ink-secondary">Aortic Emergency</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex justify-between items-center text-[10px] font-mono text-ink-secondary font-bold">
              <span>SCHEDULED ROSTER</span>
              <span className="bg-slate-200 text-ink-main px-1.5 py-0.2 rounded font-mono">URGENT</span>
            </div>
            <div className="font-display font-bold text-sm text-ink-main mt-1.5">Safdarjung Cardiac</div>
            <div className="text-2xl font-display font-extrabold text-ink-main mt-1 tabular-nums">8u O−</div>
            <span className="text-[11px] text-ink-secondary">Valve Replacement</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex justify-between items-center text-[10px] font-mono text-ink-secondary font-bold">
              <span>SURGE ATTRIBUTION</span>
              <span className="bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded font-mono font-bold">+14u Surge</span>
            </div>
            <div className="font-display font-bold text-sm text-ink-main mt-1.5">Combined Demand</div>
            <div className="text-2xl font-display font-extrabold text-amber-800 mt-1 tabular-nums">14 Units</div>
            <span className="text-[11px] text-ink-secondary">Accelerated Burn</span>
          </div>

          <div className="p-4 rounded-xl bg-red-50/80 border-2 border-primary/40">
            <div className="flex justify-between items-center text-[10px] font-mono text-primary font-bold">
              <span>DEPLETION IMPACT</span>
              <span className="bg-primary text-white px-1.5 py-0.2 rounded font-mono">ALERT</span>
            </div>
            <div className="font-display font-bold text-sm text-ink-main mt-1.5">Bank A Metro Trauma</div>
            <div className="text-2xl font-display font-extrabold text-primary mt-1 tabular-nums">−18u Deficit</div>
            <span className="text-[11px] text-primary font-semibold">T+18h Horizon Breach</span>
          </div>
        </div>
      </GlassPanel>

      {/* 4. Primary Content: Clinical Requisition Queue Table */}
      <GlassPanel className="p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200/80 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="font-display font-bold text-base text-ink-main">
              Clinical Requisition Queue ({filteredRequests.length})
            </h2>
            <p className="text-xs text-ink-secondary">
              Active surgical matching against regional cold-chain inventories.
            </p>
          </div>
          <span className="text-xs font-mono text-ink-secondary">Stream: Live Synced</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-ink-secondary border-b border-slate-200/80">
                <th className="py-3.5 px-6 font-bold uppercase tracking-wider">Requisition ID</th>
                <th className="py-3.5 px-6 font-bold uppercase tracking-wider">Hospital & Department</th>
                <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-center">Serotype</th>
                <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-center">Units</th>
                <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-center">Priority</th>
                <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-center">Status</th>
                <th className="py-3.5 px-6 font-bold uppercase tracking-wider">Clinical Indication</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filteredRequests.map(req => (
                <tr key={req.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-6 font-mono font-bold text-ink-main">{req.id}</td>
                  <td className="py-3.5 px-6">
                    <span className="font-bold text-ink-main block text-[13px]">{req.hospitalName}</span>
                    <span className="text-[11px] text-ink-secondary font-mono">{req.department} • {req.leadClinician}</span>
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono font-bold text-sm text-primary">{req.bloodGroup}</td>
                  <td className="py-3.5 px-4 text-center font-mono font-bold text-sm text-ink-main tabular-nums">{req.unitsRequested}u</td>
                  <td className="py-3.5 px-4 text-center">
                    <StatusBadge
                      variant={req.priority === 'STAT' ? 'stat' : req.priority === 'URGENT' ? 'urgent' : 'routine'}
                      label={req.priority}
                      hasPulseDot={req.priority === 'STAT'}
                    />
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                      req.status === 'ALLOCATED'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : req.status === 'IN_TRANSIT'
                        ? 'bg-sky-50 text-sky-900 border border-sky-200'
                        : 'bg-amber-50 text-amber-900 border border-amber-200'
                    }`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-6 text-xs text-ink-secondary max-w-xs truncate">{req.indication}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassPanel>

      {/* 5. Simulate Emergency Requisition Modal */}
      {showSimModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-md p-4"
        >
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-card-elevated border border-slate-200 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">emergency</span>
                <h3 className="font-display font-bold text-lg text-ink-main">
                  Simulate Emergency Hospital Requisition
                </h3>
              </div>
              <button
                onClick={() => setShowSimModal(false)}
                className="text-ink-secondary hover:text-ink-main"
                aria-label="Close modal"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSimulateSubmit} className="space-y-4 text-xs font-mono">
              <div>
                <label htmlFor="sim-hospital" className="block uppercase font-bold text-ink-secondary mb-1">
                  Requesting Hospital
                </label>
                <input
                  id="sim-hospital"
                  type="text"
                  value={hospitalName}
                  onChange={e => setHospitalName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-ink-main bg-slate-50 focus:bg-white focus:border-primary outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="sim-department" className="block uppercase font-bold text-ink-secondary mb-1">
                    Department / Unit
                  </label>
                  <input
                    id="sim-department"
                    type="text"
                    value={department}
                    onChange={e => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-ink-main bg-slate-50 focus:bg-white focus:border-primary outline-none"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="sim-bloodgroup" className="block uppercase font-bold text-ink-secondary mb-1">
                    Blood Group
                  </label>
                  <select
                    id="sim-bloodgroup"
                    value={bloodGroup}
                    onChange={e => setBloodGroup(e.target.value as BloodGroup)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-ink-main bg-slate-50 focus:bg-white focus:border-primary outline-none"
                  >
                    {['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'].map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="sim-units" className="block uppercase font-bold text-ink-secondary mb-1">
                    Units Requested
                  </label>
                  <input
                    id="sim-units"
                    type="number"
                    min={1}
                    max={20}
                    value={unitsRequested}
                    onChange={e => setUnitsRequested(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-ink-main bg-slate-50 focus:bg-white focus:border-primary outline-none font-bold"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="sim-priority" className="block uppercase font-bold text-ink-secondary mb-1">
                    Priority Level
                  </label>
                  <select
                    id="sim-priority"
                    value={priority}
                    onChange={e => setPriority(e.target.value as RequestPriority)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-ink-main bg-slate-50 focus:bg-white focus:border-primary outline-none font-bold"
                  >
                    <option value="STAT">STAT (Immediate &lt;15m)</option>
                    <option value="URGENT">URGENT (&lt;2 Hours)</option>
                    <option value="ROUTINE">ROUTINE (Scheduled)</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="sim-indication" className="block uppercase font-bold text-ink-secondary mb-1">
                  Clinical Indication
                </label>
                <input
                  id="sim-indication"
                  type="text"
                  value={indication}
                  onChange={e => setIndication(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-ink-main bg-slate-50 focus:bg-white focus:border-primary outline-none"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  type="button"
                  onClick={() => setShowSimModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  type="submit"
                  icon="send"
                >
                  Inject Simulated Requisition
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
