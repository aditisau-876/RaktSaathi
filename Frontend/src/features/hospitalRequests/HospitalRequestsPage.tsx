
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { GlassPanel } from '@/components/common/GlassPanel';
import { Button } from '@/components/common/Button';
import { StatusBadge } from '@/components/common/StatusBadge';
import { SegmentedControl } from '@/components/common/SegmentedControl';
import { MetricTile } from '@/components/common/MetricTile';
import { BloodGroup } from '@/core/types/inventory';
import { RequestPriority } from '@/core/types/requests';

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1'
).replace(/\/$/, '');

type PriorityFilter = 'ALL' | 'STAT' | 'URGENT' | 'ROUTINE';

interface ApiRequest {
  id: string;
  hospital_name: string;
  department?: string | null;
  lead_clinician?: string | null;
  blood_group: BloodGroup;
  units_requested: number;
  priority: RequestPriority;
  status: string;
  indication?: string | null;
  created_at?: string | null;
}

interface HospitalRequest {
  id: string;
  hospitalName: string;
  department: string;
  leadClinician: string;
  bloodGroup: BloodGroup;
  unitsRequested: number;
  priority: RequestPriority;
  status: string;
  indication: string;
  createdAt?: string | null;
}

function mapRequest(item: ApiRequest): HospitalRequest {
  return {
    id: item.id,
    hospitalName: item.hospital_name,
    department: item.department || 'Not specified',
    leadClinician: item.lead_clinician || 'Not specified',
    bloodGroup: item.blood_group,
    unitsRequested: item.units_requested,
    priority: item.priority,
    status: item.status,
    indication: item.indication || 'Not specified',
    createdAt: item.created_at,
  };
}

async function getErrorMessage(response: Response): Promise<string> {
  try {
    const body = await response.json();
    if (typeof body.detail === 'string') return body.detail;
    if (body.detail) return JSON.stringify(body.detail);
  } catch {
    // Use the HTTP status if the response is not JSON.
  }

  return `Request failed (${response.status} ${response.statusText})`;
}

export const HospitalRequestsPage: React.FC = () => {
  const [requests, setRequests] = useState<HospitalRequest[]>([]);
  const [selectedPriority, setSelectedPriority] =
    useState<PriorityFilter>('ALL');
  const [showSimModal, setShowSimModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [hospitalName, setHospitalName] = useState(
    'AIIMS Apex Trauma Center'
  );
  const [department, setDepartment] = useState('Emergency OR #02');
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('O-');
  const [unitsRequested, setUnitsRequested] = useState(4);
  const [priority, setPriority] = useState<RequestPriority>('STAT');
  const [indication, setIndication] = useState(
    'Uncontrolled Abdominal Trauma Inflow'
  );

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/requests`);

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      const data: ApiRequest[] = await response.json();
      setRequests(data.map(mapRequest));
    } catch (err) {
      setError(
        err instanceof Error
          ? `${err.message}. Check that the FastAPI server is running and the API URL is correct.`
          : 'Unable to load hospital requests.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchRequests();
  }, [fetchRequests]);

  const filteredRequests = useMemo(
    () =>
      requests.filter(
        (request) =>
          selectedPriority === 'ALL' ||
          request.priority === selectedPriority
      ),
    [requests, selectedPriority]
  );

  const priorityOptions = [
    {
      value: 'ALL',
      label: 'All Requisitions',
      badge: requests.length,
    },
    { value: 'STAT', label: 'STAT Only', alertDot: true },
    { value: 'URGENT', label: 'Urgent' },
    { value: 'ROUTINE', label: 'Routine' },
  ];

  const statRequests = requests.filter(
    (request) => request.priority === 'STAT'
  );

  const activeRequests = requests.filter((request) =>
    ['QUEUED', 'ANALYZING', 'PENDING', 'OPEN'].includes(
      request.status.toUpperCase()
    )
  );

  const activeDemandUnits = activeRequests.reduce(
    (total, request) => total + request.unitsRequested,
    0
  );

  const statDemandUnits = statRequests.reduce(
    (total, request) => total + request.unitsRequested,
    0
  );

  const handleCreateRequest = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!hospitalName.trim() || !bloodGroup || unitsRequested < 1) {
      setError('Please enter a hospital, blood group, and valid unit count.');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hospital_name: hospitalName.trim(),
          department: department.trim() || null,
          lead_clinician: null,
          blood_group: bloodGroup,
          units_requested: unitsRequested,
          priority,
          indication: indication.trim() || null,
        }),
      });

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      const created: ApiRequest = await response.json();

      // Add the API-confirmed record to the displayed queue.
      setRequests((current) => [
        mapRequest(created),
        ...current.filter((request) => request.id !== created.id),
      ]);

      setShowSimModal(false);
      setSuccess(`Request ${created.id} was saved successfully.`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to create the hospital request.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusClass = (status: string) => {
    switch (status.toUpperCase()) {
      case 'ALLOCATED':
      case 'COMPLETED':
        return 'bg-emerald-50 text-emerald-800 border border-emerald-200';
      case 'IN_TRANSIT':
        return 'bg-sky-50 text-sky-900 border border-sky-200';
      case 'CANCELLED':
      case 'REJECTED':
        return 'bg-slate-100 text-slate-600 border border-slate-200';
      default:
        return 'bg-amber-50 text-amber-900 border border-amber-200';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header and actions */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="space-y-1.5 max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-mono text-primary font-bold tracking-wider">
            <span className="material-symbols-outlined text-[16px]">
              swap_horiz
            </span>
            <span>CLINICAL DEMAND STREAM • HOSPITAL REQUISITIONS</span>
          </div>

          <h1 className="text-3xl font-display font-extrabold text-ink-main tracking-tight">
            Hospital Requests
          </h1>

          <p className="text-sm text-ink-muted leading-relaxed">
            Create and monitor hospital blood requests using records saved by
            the RaktSaathi API.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <SegmentedControl
            options={priorityOptions}
            value={selectedPriority}
            onChange={(value) =>
              setSelectedPriority(value as PriorityFilter)
            }
            label="Request priority filter"
          />

          <Button
            variant="primary"
            icon="emergency"
            onClick={() => {
              setError('');
              setSuccess('');
              setShowSimModal(true);
            }}
          >
            Create Hospital Request
          </Button>

          <Button
            variant="secondary"
            icon="refresh"
            onClick={() => void fetchRequests()}
            disabled={loading}
          >
            Refresh
          </Button>
        </div>
      </section>

      {/* API feedback */}
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          <div className="font-bold">Unable to complete the operation</div>
          <p className="mt-1 break-words">{error}</p>
        </div>
      )}

      {success && (
        <div
          role="status"
          className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
        >
          {success}
        </div>
      )}

      {/* Live metrics calculated from API records */}
      <section
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
        aria-label="Demand telemetry overview"
      >
        <MetricTile
          label="Active Requested Demand"
          value={loading ? '—' : String(activeDemandUnits)}
          unit="Units"
          subtext={`${activeRequests.length} active requests`}
          icon="inventory"
          trend={{
            value: 'Calculated from request queue',
            isPositive: true,
          }}
          progressPercent={0}
        />

        <MetricTile
          label="STAT Priority Demand"
          value={loading ? '—' : String(statDemandUnits)}
          unit="Units"
          subtext={`${statRequests.length} STAT requests`}
          icon="crisis_alert"
          isCritical={statRequests.length > 0}
          trend={{
            value: 'Immediate-priority requests',
            isWarning: statRequests.length > 0,
          }}
          progressPercent={0}
        />

        <MetricTile
          label="Total Hospital Requests"
          value={loading ? '—' : String(requests.length)}
          unit="Requests"
          subtext="Records returned by the API"
          icon="speed"
          trend={{
            value: loading ? 'Loading records' : 'API data loaded',
            isPositive: !loading && !error,
            isWarning: Boolean(error),
          }}
          progressPercent={0}
        />
      </section>

      {/* Request processing information */}
      <GlassPanel elevation={1} className="p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-primary" />
            <h2 className="font-display font-bold text-base text-ink-main">
              Request Processing
            </h2>
          </div>

          <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-100 text-ink-secondary font-bold uppercase">
            FastAPI Connected
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-xs font-mono text-ink-secondary font-bold">
              01 · SUBMISSION
            </div>
            <div className="font-display font-bold text-sm text-ink-main mt-2">
              Hospital requisition
            </div>
            <p className="text-xs text-ink-secondary mt-1 leading-relaxed">
              The form sends the hospital, blood group, units, priority, and
              indication to the API.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-xs font-mono text-ink-secondary font-bold">
              02 · PERSISTENCE
            </div>
            <div className="font-display font-bold text-sm text-ink-main mt-2">
              Backend record
            </div>
            <p className="text-xs text-ink-secondary mt-1 leading-relaxed">
              The backend creates the request and stores it in the configured
              database.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-xs font-mono text-ink-secondary font-bold">
              03 · MONITORING
            </div>
            <div className="font-display font-bold text-sm text-ink-main mt-2">
              Request queue
            </div>
            <p className="text-xs text-ink-secondary mt-1 leading-relaxed">
              Refresh the queue to retrieve the latest records from the
              backend.
            </p>
          </div>
        </div>
      </GlassPanel>

      {/* Hospital requisition queue */}
      <GlassPanel className="p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-slate-50/50">
          <div>
            <h2 className="font-display font-bold text-base text-ink-main">
              Clinical Requisition Queue ({filteredRequests.length})
            </h2>
            <p className="text-xs text-ink-secondary mt-1">
              Hospital requests retrieved from the backend database.
            </p>
          </div>

          <span className="text-xs font-mono text-ink-secondary">
            {loading ? 'Loading…' : 'API-backed records'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-ink-secondary border-b border-slate-200/80">
                <th className="py-3.5 px-6 font-bold uppercase tracking-wider">
                  Requisition ID
                </th>
                <th className="py-3.5 px-6 font-bold uppercase tracking-wider">
                  Hospital & Department
                </th>
                <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-center">
                  Blood Group
                </th>
                <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-center">
                  Units
                </th>
                <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-center">
                  Priority
                </th>
                <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-center">
                  Status
                </th>
                <th className="py-3.5 px-6 font-bold uppercase tracking-wider">
                  Clinical Indication
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 font-sans">
              {!loading && filteredRequests.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-sm text-ink-secondary"
                  >
                    {error
                      ? 'Requests could not be loaded. Resolve the connection error and refresh.'
                      : 'No requests match this filter. Create a hospital request to get started.'}
                  </td>
                </tr>
              )}

              {filteredRequests.map((request) => (
                <tr
                  key={request.id}
                  className="hover:bg-slate-50/70 transition-colors"
                >
                  <td className="py-3.5 px-6 font-mono font-bold text-ink-main whitespace-nowrap">
                    {request.id}
                  </td>

                  <td className="py-3.5 px-6 min-w-52">
                    <span className="font-bold text-ink-main block text-[13px]">
                      {request.hospitalName}
                    </span>
                    <span className="text-[11px] text-ink-secondary font-mono">
                      {request.department} · {request.leadClinician}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-center font-mono font-bold text-sm text-primary">
                    {request.bloodGroup}
                  </td>

                  <td className="py-3.5 px-4 text-center font-mono font-bold text-sm text-ink-main tabular-nums">
                    {request.unitsRequested}u
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <StatusBadge
                      variant={
                        request.priority === 'STAT'
                          ? 'stat'
                          : request.priority === 'URGENT'
                            ? 'urgent'
                            : 'routine'
                      }
                      label={request.priority}
                      hasPulseDot={request.priority === 'STAT'}
                    />
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase whitespace-nowrap ${getStatusClass(request.status)}`}
                    >
                      {request.status.replace(/_/g, ' ')}
                    </span>
                  </td>

                  <td className="py-3.5 px-6 text-xs text-ink-secondary min-w-48">
                    {request.indication}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassPanel>

      {/* Create hospital request modal */}
      {showSimModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="request-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4"
        >
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-card-elevated border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">
                  emergency
                </span>
                <h3
                  id="request-modal-title"
                  className="font-display font-bold text-lg text-ink-main"
                >
                  Create Hospital Request
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setShowSimModal(false)}
                className="text-ink-secondary hover:text-ink-main"
                aria-label="Close modal"
              >
                <span className="material-symbols-outlined text-[20px]">
                  close
                </span>
              </button>
            </div>

            <p className="text-xs text-ink-secondary">
              Submitting this form saves a requisition through the FastAPI
              backend.
            </p>

            <form
              onSubmit={handleCreateRequest}
              className="space-y-4 text-xs font-mono"
            >
              <div>
                <label
                  htmlFor="sim-hospital"
                  className="block uppercase font-bold text-ink-secondary mb-1"
                >
                  Requesting Hospital
                </label>
                <input
                  id="sim-hospital"
                  type="text"
                  value={hospitalName}
                  onChange={(event) => setHospitalName(event.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-ink-main bg-slate-50 focus:bg-white focus:border-primary outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="sim-department"
                    className="block uppercase font-bold text-ink-secondary mb-1"
                  >
                    Department / Unit
                  </label>
                  <input
                    id="sim-department"
                    type="text"
                    value={department}
                    onChange={(event) => setDepartment(event.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-ink-main bg-slate-50 focus:bg-white focus:border-primary outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="sim-bloodgroup"
                    className="block uppercase font-bold text-ink-secondary mb-1"
                  >
                    Blood Group
                  </label>
                  <select
                    id="sim-bloodgroup"
                    value={bloodGroup}
                    onChange={(event) =>
                      setBloodGroup(event.target.value as BloodGroup)
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-ink-main bg-slate-50 focus:bg-white focus:border-primary outline-none"
                  >
                    {['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'].map(
                      (group) => (
                        <option key={group} value={group}>
                          {group}
                        </option>
                      )
                    )}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="sim-units"
                    className="block uppercase font-bold text-ink-secondary mb-1"
                  >
                    Units Requested
                  </label>
                  <input
                    id="sim-units"
                    type="number"
                    min={1}
                    max={20}
                    value={unitsRequested}
                    onChange={(event) =>
                      setUnitsRequested(Number(event.target.value))
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-ink-main bg-slate-50 focus:bg-white focus:border-primary outline-none font-bold"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="sim-priority"
                    className="block uppercase font-bold text-ink-secondary mb-1"
                  >
                    Priority Level
                  </label>
                  <select
                    id="sim-priority"
                    value={priority}
                    onChange={(event) =>
                      setPriority(event.target.value as RequestPriority)
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-ink-main bg-slate-50 focus:bg-white focus:border-primary outline-none font-bold"
                  >
                    <option value="STAT">STAT (Immediate)</option>
                    <option value="URGENT">URGENT</option>
                    <option value="ROUTINE">ROUTINE</option>
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="sim-indication"
                  className="block uppercase font-bold text-ink-secondary mb-1"
                >
                  Clinical Indication
                </label>
                <input
                  id="sim-indication"
                  type="text"
                  value={indication}
                  onChange={(event) => setIndication(event.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-ink-main bg-slate-50 focus:bg-white focus:border-primary outline-none"
                />
              </div>

              {error && (
                <div
                  role="alert"
                  className="rounded-lg bg-red-50 border border-red-200 p-3 text-red-800 break-words"
                >
                  {error}
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  type="button"
                  onClick={() => setShowSimModal(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  type="submit"
                  icon="send"
                  disabled={submitting}
                >
                  {submitting ? 'Saving Request…' : 'Submit Hospital Request'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
