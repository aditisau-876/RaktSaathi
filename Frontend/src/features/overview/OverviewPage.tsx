
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { RiskPulse } from '@/components/common/RiskPulse';
import { Button } from '@/components/common/Button';
import { useIncident } from '@/context/IncidentContext';
import { RadarNetwork3D } from '@/features/radar/RadarNetwork3D';
import { api } from '@/services/api';

type RiskLevel = 'RED' | 'AMBER' | 'GREEN';

interface RadarItem {
  bank_id: string;
  bank_name: string;
  location: string;
  blood_group: string;
  available_units: number;
  safety_floor: number;
  expected_demand_24h: number;
  expected_incoming_units: number;
  projected_gap: number;
  risk: RiskLevel;
  risk_window_hours: number | null;
  method: string;
  is_synthetic: boolean;
}

interface RadarResponse {
  data_mode: string;
  method: string;
  items: RadarItem[];
}

interface DashboardView {
  dataMode: string;
  method: string;
  items: RadarItem[];
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

const normalizeRadarResponse = (payload: unknown): DashboardView => {
  let source: unknown = payload;

  // Accept the direct response or a common API wrapper.
  for (let depth = 0; depth < 3; depth += 1) {
    if (!isRecord(source)) break;

    if (Array.isArray(source.items)) break;

    if (isRecord(source.data)) {
      source = source.data;
      continue;
    }

    if (isRecord(source.radar)) {
      source = source.radar;
      continue;
    }

    break;
  }

  if (!isRecord(source) || !Array.isArray(source.items)) {
    throw new Error(
      'The radar API returned an unexpected response. Expected an items array.',
    );
  }

  const items: RadarItem[] = source.items.map((raw, index) => {
    if (!isRecord(raw)) {
      throw new Error(`Radar record ${index + 1} is invalid.`);
    }

    const requiredStrings = [
      'bank_id',
      'bank_name',
      'location',
      'blood_group',
      'risk',
    ] as const;

    for (const key of requiredStrings) {
      if (typeof raw[key] !== 'string') {
        throw new Error(
          `Radar record ${index + 1} is missing a valid ${key}.`,
        );
      }
    }

    const numericKeys = [
      'available_units',
      'safety_floor',
      'expected_demand_24h',
      'expected_incoming_units',
      'projected_gap',
    ] as const;

    for (const key of numericKeys) {
      if (!isNumber(raw[key])) {
        throw new Error(
          `Radar record ${index + 1} is missing a valid ${key}.`,
        );
      }
    }

    const risk = raw.risk as string;

    if (!['RED', 'AMBER', 'GREEN'].includes(risk)) {
      throw new Error(`Radar record ${index + 1} has an unknown risk level.`);
    }

    const riskWindow = raw.risk_window_hours;

    if (riskWindow !== null && !isNumber(riskWindow)) {
      throw new Error(
        `Radar record ${index + 1} has an invalid risk window.`,
      );
    }

    return {
      bank_id: raw.bank_id as string,
      bank_name: raw.bank_name as string,
      location: raw.location as string,
      blood_group: raw.blood_group as string,
      available_units: raw.available_units as number,
      safety_floor: raw.safety_floor as number,
      expected_demand_24h: raw.expected_demand_24h as number,
      expected_incoming_units: raw.expected_incoming_units as number,
      projected_gap: raw.projected_gap as number,
      risk: risk as RiskLevel,
      risk_window_hours: riskWindow as number | null,
      method:
        typeof raw.method === 'string'
          ? raw.method
          : typeof source.method === 'string'
            ? source.method
            : 'UNKNOWN',
      is_synthetic:
        typeof raw.is_synthetic === 'boolean' ? raw.is_synthetic : false,
    };
  });

  return {
    dataMode:
      typeof source.data_mode === 'string' ? source.data_mode : 'UNKNOWN',
    method:
      typeof source.method === 'string' ? source.method : 'UNKNOWN',
    items,
  };
};

const formatTimestamp = (value: Date | null) => {
  if (!value) return 'No successful sync yet';

  return value.toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
};

const formatNumber = (value: number | null) =>
  value === null ? '—' : value.toLocaleString('en-IN');

const MetricCard: React.FC<{
  label: string;
  value: string;
  detail: string;
  icon: string;
  tone?: 'red' | 'amber' | 'green' | 'neutral';
}> = ({ label, value, detail, icon, tone = 'neutral' }) => {
  const toneClasses = {
    red: 'border-red-200 bg-red-50/80 text-red-700',
    amber: 'border-amber-200 bg-amber-50/80 text-amber-700',
    green: 'border-emerald-200 bg-emerald-50/80 text-emerald-700',
    neutral: 'border-slate-200 bg-white text-slate-700',
  };

  return (
    <div className={`rounded-2xl border p-4 shadow-sm ${toneClasses[tone]}`}>
      <div className="flex items-center justify-between gap-3">
        <span className="text-[10px] font-semibold uppercase tracking-[.13em] opacity-70">
          {label}
        </span>
        <span className="material-symbols-outlined text-[20px]">
          {icon}
        </span>
      </div>
      <div className="mt-3 text-3xl font-black tracking-tight">{value}</div>
      <p className="mt-1 text-xs leading-5 opacity-75">{detail}</p>
    </div>
  );
};

const RiskBadge: React.FC<{ risk: RiskLevel }> = ({ risk }) => {
  const classes = {
    RED: 'border-red-200 bg-red-50 text-red-700',
    AMBER: 'border-amber-200 bg-amber-50 text-amber-800',
    GREEN: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  };

  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-1 text-[10px] font-bold tracking-wide ${classes[risk]}`}
    >
      {risk}
    </span>
  );
};

export const OverviewPage: React.FC = () => {
  const { activeIncident } = useIncident();

  const [dashboard, setDashboard] = useState<DashboardView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Existing backend endpoint: GET /api/v1/radar
      const response = await api.get<RadarResponse>('/radar');
      const normalized = normalizeRadarResponse(response);

      setDashboard(normalized);
      setLastFetched(new Date());
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to load radar data from the backend.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const items = dashboard?.items ?? [];

  const metrics = useMemo(() => {
    const totalUnits = items.reduce(
      (sum, item) => sum + item.available_units,
      0,
    );

    const criticalItems = items.filter((item) => item.risk === 'RED');
    const warningItems = items.filter((item) => item.risk === 'AMBER');
    const greenItems = items.filter((item) => item.risk === 'GREEN');

    const totalFacilities = new Set(items.map((item) => item.bank_id)).size;

    const criticalFacilities = new Set(
      criticalItems.map((item) => item.bank_id),
    ).size;

    return {
      totalUnits,
      criticalItems,
      warningItems,
      greenItems,
      totalFacilities,
      criticalFacilities,
    };
  }, [items]);

  const priorityIncident = useMemo(() => {
    // Prioritise the known O-negative critical record, if present.
    return (
      items.find(
        (item) =>
          item.risk === 'RED' &&
          item.blood_group === 'O-' &&
          item.bank_id === 'BB-DEL-A',
      ) ??
      items.find((item) => item.risk === 'RED') ??
      items.find((item) => item.risk === 'AMBER') ??
      null
    );
  }, [items]);

  const incidentName =
    priorityIncident?.bank_name ?? 'Priority facility';

  const bloodGroup =
    priorityIncident?.blood_group ?? activeIncident.bloodGroup;

  const currentStock =
    priorityIncident?.available_units ?? activeIncident.currentStock;

  const safetyFloor =
    priorityIncident?.safety_floor ?? activeIncident.mandatedFloor;

  const projectedGap = priorityIncident?.projected_gap ?? null;

  const riskWindowHours = priorityIncident?.risk_window_hours ?? null;

  const incidentRisk = priorityIncident?.risk ?? null;

  const isCritical =
    incidentRisk === 'RED' ||
    (priorityIncident === null && currentStock < safetyFloor);

  const isSynthetic =
    dashboard?.dataMode.toUpperCase().includes('SYNTHETIC') === true ||
    items.some((item) => item.is_synthetic);

  const dataSourceLabel = isSynthetic
    ? 'Synthetic demo data'
    : dashboard
      ? 'Backend radar data'
      : 'Awaiting backend data';

  return (
    <div className="animate-fade-in space-y-7 pb-8 text-slate-800">
      {/* Header */}
      <section className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-mono uppercase tracking-[.12em] text-slate-500 shadow-sm">
            <span
              className={`h-2 w-2 rounded-full ${
                error
                  ? 'bg-red-500'
                  : loading
                    ? 'animate-pulse bg-slate-400'
                    : 'bg-emerald-500'
              }`}
            />
            {error
              ? 'Backend connection issue'
              : loading
                ? 'Syncing radar data'
                : 'RaktSaathi operations overview'}
          </div>

          <h1 className="mt-4 font-display text-3xl font-black tracking-tight text-slate-900 sm:text-5xl">
            Shortages need action.
            <span className="block text-red-700">
              Start with the evidence.
            </span>
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">
            Monitor blood inventory, identify high-risk blood groups, and
            coordinate responses across nearby facilities. Confirm stock,
            expiry status, and transfer feasibility with the responsible
            blood-bank team before acting.
          </p>

          {dashboard && (
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600">
                {dataSourceLabel}
              </span>
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-500">
                Method: {dashboard.method}
              </span>
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-500">
                {metrics.totalFacilities} facilities · {items.length} inventory
                records
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => void loadDashboard()}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span
              className={`material-symbols-outlined text-lg ${
                loading ? 'animate-spin' : ''
              }`}
            >
              {loading ? 'progress_activity' : 'refresh'}
            </span>
            {loading ? 'Refreshing…' : 'Refresh data'}
          </button>

          <Link to="/decision-center">
            <Button
              variant="primary"
              size="md"
              icon="arrow_forward"
              iconPosition="right"
            >
              Decision center
            </Button>
          </Link>
        </div>
      </section>

      {/* Connection and data status */}
      {error && (
        <section
          role="alert"
          className="flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p className="font-bold text-red-900">
              Radar data could not be loaded
            </p>
            <p className="mt-1 break-words text-sm text-red-800">{error}</p>
            <p className="mt-1 text-xs leading-5 text-red-800/80">
              Check that FastAPI is running and that the
              {' '}GET /api/v1/radar endpoint is available. Previously loaded
              data, if any, remains visible until a successful refresh.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadDashboard()}
            disabled={loading}
            className="shrink-0 rounded-xl border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-900 hover:bg-red-100 disabled:opacity-60"
          >
            Try again
          </button>
        </section>
      )}

      {isSynthetic && dashboard && (
        <section className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <span className="material-symbols-outlined mt-0.5 text-xl text-amber-700">
            science
          </span>
          <div>
            <p className="font-bold text-amber-900">
              Synthetic data — demonstration only
            </p>
            <p className="mt-1 text-sm leading-6 text-amber-800">
              These figures come from the demo dataset and rule-based risk
              method. They are not confirmed live blood-bank inventory or
              clinically validated predictions.
            </p>
          </div>
        </section>
      )}

      {/* Summary metrics */}
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Units in radar dataset"
          value={dashboard ? formatNumber(metrics.totalUnits) : '—'}
          detail={
            dashboard
              ? `Summed across ${metrics.totalFacilities} facilities`
              : 'Waiting for backend response'
          }
          icon="inventory_2"
        />

        <MetricCard
          label="Critical records"
          value={dashboard ? formatNumber(metrics.criticalItems.length) : '—'}
          detail={
            dashboard
              ? `${metrics.criticalFacilities} distinct facilities affected`
              : 'Waiting for backend response'
          }
          icon="crisis_alert"
          tone={metrics.criticalItems.length > 0 ? 'red' : 'neutral'}
        />

        <MetricCard
          label="Warning records"
          value={dashboard ? formatNumber(metrics.warningItems.length) : '—'}
          detail={
            dashboard
              ? 'Blood groups requiring attention'
              : 'Waiting for backend response'
          }
          icon="warning"
          tone={metrics.warningItems.length > 0 ? 'amber' : 'neutral'}
        />

        <MetricCard
          label="Stable records"
          value={dashboard ? formatNumber(metrics.greenItems.length) : '—'}
          detail={
            dashboard
              ? 'Records currently marked GREEN'
              : 'Waiting for backend response'
          }
          icon="verified"
          tone="green"
        />
      </section>

      {/* Incident and map */}
      <section className="grid gap-5 xl:grid-cols-[minmax(320px,.78fr)_minmax(0,1.22fr)]">
        <div className="relative overflow-hidden rounded-[28px] border border-red-100 bg-white p-5 shadow-[0_18px_60px_rgba(127,29,29,.07)] sm:p-7">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-red-100/60 blur-3xl" />

          <div className="relative flex items-start justify-between gap-3">
            <div className="min-w-0">
              <span className="text-[10px] font-mono font-semibold uppercase tracking-[.14em] text-red-700">
                Priority blood-group record
              </span>
              <h2 className="mt-2 break-words font-display text-xl font-extrabold tracking-tight">
                {incidentName}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {bloodGroup} blood group ·{' '}
                {priorityIncident ? 'Radar API' : 'Local incident fallback'}
              </p>
              {priorityIncident && (
                <p className="mt-1 text-xs text-slate-400">
                  {priorityIncident.location}
                </p>
              )}
            </div>

            <span
              className={`shrink-0 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
                isCritical
                  ? 'bg-red-100 text-red-800'
                  : incidentRisk === 'GREEN'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
              }`}
            >
              {incidentRisk ?? (isCritical ? 'High priority' : 'Review')}
            </span>
          </div>

          <div className="relative flex min-h-[260px] items-center justify-center">
            <RiskPulse
              size="xl"
              severity={activeIncident.severity}
              units={currentStock}
              mandatedFloor={safetyFloor}
              label={`${bloodGroup} PRBC`}
              sublabel={`Safety floor: ${safetyFloor} units`}
            />
          </div>

          <div className="relative grid grid-cols-2 gap-3 border-t border-slate-200 pt-4">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                Available stock
              </p>
              <p className="mt-1 text-2xl font-black text-slate-900">
                {formatNumber(currentStock)}
                <span className="ml-1 text-xs font-medium text-slate-400">
                  units
                </span>
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Safety floor: {formatNumber(safetyFloor)} units
              </p>
            </div>

            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                Projected gap
              </p>
              <p
                className={`mt-1 text-2xl font-black ${
                  projectedGap !== null && projectedGap > 0
                    ? 'text-red-700'
                    : 'text-slate-900'
                }`}
              >
                {projectedGap === null
                  ? '—'
                  : `${projectedGap > 0 ? '+' : ''}${projectedGap}`}
                {projectedGap !== null && (
                  <span className="ml-1 text-xs font-medium">units</span>
                )}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Backend-reported value
              </p>
            </div>
          </div>

          {priorityIncident && (
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  Expected demand
                </p>
                <p className="mt-1 text-lg font-bold text-slate-800">
                  {priorityIncident.expected_demand_24h} units
                </p>
                <p className="text-xs text-slate-500">Next 24 hours</p>
              </div>

              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  Incoming units
                </p>
                <p className="mt-1 text-lg font-bold text-slate-800">
                  {priorityIncident.expected_incoming_units} units
                </p>
                <p className="text-xs text-slate-500">Expected supply</p>
              </div>
            </div>
          )}

          <div className="mt-4 rounded-xl bg-slate-50 px-4 py-3">
            <p className="text-xs leading-5 text-slate-600">
              {priorityIncident
                ? riskWindowHours !== null
                  ? `Backend risk window: ${riskWindowHours} hours. Verify current inventory and demand before initiating a transfer.`
                  : 'No risk-window estimate was supplied for this record. Confirm stock and demand with the facility.'
                : 'No priority record is available from the radar API yet. Refresh the data or check the backend connection.'}
            </p>
          </div>

          <Link
            to="/decision-center"
            className="mt-4 flex items-center justify-between rounded-xl bg-red-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-red-800"
          >
            Review response options
            <span className="material-symbols-outlined">arrow_forward</span>
          </Link>
        </div>

        <div className="min-w-0 overflow-hidden rounded-[28px] border border-slate-800 bg-[#111722] shadow-[0_18px_60px_rgba(15,23,42,.16)]">
          <div className="flex flex-col justify-between gap-3 border-b border-white/10 px-5 py-5 sm:flex-row sm:items-center sm:px-7">
            <div>
              <span className="text-[10px] font-mono font-semibold uppercase tracking-[.14em] text-red-300">
                Spatial response map
              </span>
              <h2 className="mt-1 font-display text-xl font-extrabold tracking-tight text-white">
                Facility network
              </h2>
              <p className="mt-1 text-xs leading-5 text-slate-400">
                Map locations and demo risk indicators do not confirm live
                blood stock.
              </p>
            </div>

            <Link
              to="/radar"
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-300 hover:text-white"
            >
              Open full radar
              <span className="material-symbols-outlined text-base">
                arrow_forward
              </span>
            </Link>
          </div>

          <div className="h-[360px] sm:h-[460px]">
            <RadarNetwork3D
              selectedSerotype={
                priorityIncident?.blood_group === 'O-' ||
                priorityIncident === null
                  ? 'O-'
                  : (priorityIncident.blood_group as
                      | 'A+'
                      | 'A-'
                      | 'B+'
                      | 'B-'
                      | 'AB+'
                      | 'AB-'
                      | 'O+'
                      | 'O-')
              }
              selectedFacilityId={priorityIncident?.bank_id ?? 'BB-DEL-A'}
              onSelectFacility={() => {}}
            />
          </div>
        </div>
      </section>

      {/* Critical and warning inventory records */}
      <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="text-[10px] font-mono font-semibold uppercase tracking-[.14em] text-red-700">
              Live API response
            </span>
            <h2 className="mt-2 font-display text-2xl font-extrabold tracking-tight">
              Shortages requiring attention
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Records marked RED or AMBER by the backend risk engine.
            </p>
          </div>

          <span className="text-xs text-slate-400">
            {dashboard
              ? `${metrics.criticalItems.length + metrics.warningItems.length} records to review`
              : 'Waiting for data'}
          </span>
        </div>

        {!dashboard && loading && (
          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
            Loading inventory records…
          </div>
        )}

        {!dashboard && !loading && (
          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center">
            <p className="font-semibold text-slate-700">
              No radar records loaded
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Check the backend connection and try refreshing.
            </p>
          </div>
        )}

        {dashboard &&
          metrics.criticalItems.length + metrics.warningItems.length ===
            0 && (
            <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
              <p className="font-bold text-emerald-900">
                No RED or AMBER records reported
              </p>
              <p className="mt-1 text-sm text-emerald-800">
                Continue monitoring and verify the latest inventory with
                participating facilities.
              </p>
            </div>
          )}

        {dashboard &&
          [...metrics.criticalItems, ...metrics.warningItems].length > 0 && (
            <div className="mt-5 space-y-3">
              {[...metrics.criticalItems, ...metrics.warningItems].map(
                (item) => {
                  const safetyShortfall = Math.max(
                    0,
                    item.safety_floor - item.available_units,
                  );

                  return (
                    <div
                      key={`${item.bank_id}-${item.blood_group}`}
                      className="flex flex-col gap-4 rounded-2xl border border-slate-200 p-4 transition hover:border-slate-300 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex min-w-0 items-start gap-3">
                        <div
                          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-sm font-black ${
                            item.risk === 'RED'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {item.blood_group}
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-bold text-slate-900">
                              {item.bank_name}
                            </h3>
                            <RiskBadge risk={item.risk} />
                          </div>

                          <p className="mt-1 text-sm text-slate-500">
                            {item.location} · {item.bank_id}
                          </p>

                          <p className="mt-2 text-xs leading-5 text-slate-600">
                            {safetyShortfall > 0
                              ? `${safetyShortfall} units below safety floor`
                              : 'At or above safety floor'}{' '}
                            · Demand: {item.expected_demand_24h} units / 24h
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 border-t border-slate-100 pt-3 sm:min-w-[220px] sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0">
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-slate-400">
                            Stock
                          </p>
                          <p className="mt-1 text-lg font-black text-slate-900">
                            {item.available_units}
                          </p>
                        </div>

                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-slate-400">
                            Floor
                          </p>
                          <p className="mt-1 text-lg font-black text-slate-900">
                            {item.safety_floor}
                          </p>
                        </div>

                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-slate-400">
                            Gap
                          </p>
                          <p className="mt-1 text-lg font-black text-slate-900">
                            {item.projected_gap > 0
                              ? `+${item.projected_gap}`
                              : item.projected_gap}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          )}
      </section>

      {/* Response workflow */}
      <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="text-[10px] font-mono font-semibold uppercase tracking-[.14em] text-red-700">
              Response workflow
            </span>
            <h2 className="mt-2 font-display text-2xl font-extrabold tracking-tight">
              From prediction to action
            </h2>
          </div>

          <p className="max-w-xl text-sm leading-6 text-slate-500">
            Review evidence and compare possible responses in the decision
            center. Transfers, clinical compatibility, and donor outreach
            require human verification.
          </p>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-red-100 bg-red-50/60 p-4">
            <span className="text-xs font-bold text-red-700">
              01 · VERIFY
            </span>
            <h3 className="mt-2 font-bold text-slate-900">
              Confirm the shortage
            </h3>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Validate reported stock, safety floor, expiry status, and
              current demand with the facility.
            </p>
          </div>

          <div className="rounded-2xl border border-amber-100 bg-amber-50/60 p-4">
            <span className="text-xs font-bold text-amber-700">
              02 · COORDINATE
            </span>
            <h3 className="mt-2 font-bold text-slate-900">
              Review nearby supply
            </h3>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Check compatibility, available stock, transfer feasibility,
              cold-chain requirements, and delivery timing.
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
            <span className="text-xs font-bold text-emerald-700">
              03 · RESPOND
            </span>
            <h3 className="mt-2 font-bold text-slate-900">
              Track the response
            </h3>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Record the approved action, assigned team, expected arrival,
              and whether the reported risk has reduced.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <div className="flex flex-col gap-2 border-t border-slate-200 pt-4 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
        <span>
          {loading
            ? 'Retrieving radar data…'
            : error
              ? 'Backend data unavailable'
              : `Connection successful · ${dataSourceLabel}`}
        </span>

        <span>Last successful sync: {formatTimestamp(lastFetched)}</span>
      </div>
    </div>
  );
};

export default OverviewPage;
