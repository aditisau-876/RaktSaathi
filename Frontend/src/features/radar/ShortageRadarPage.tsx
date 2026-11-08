
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { GlassPanel } from '@/components/common/GlassPanel';
import { Button } from '@/components/common/Button';
import { Stepper } from '@/components/common/Stepper';
import { SegmentedControl } from '@/components/common/SegmentedControl';
import { BloodGroup } from '@/core/types/inventory';
import { useIncident } from '@/context/IncidentContext';
import { api } from '@/services/api';
import { RadarNetwork3D } from './RadarNetwork3D';

const SEROTYPES: BloodGroup[] = [
  'O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+',
];

type ApiRisk = 'RED' | 'AMBER' | 'GREEN';

interface RadarApiItem {
  bank_id: string;
  bank_name: string;
  location: string;
  blood_group: BloodGroup;
  available_units: number;
  safety_floor: number;
  expected_demand_24h: number;
  expected_incoming_units: number;
  projected_gap: number;
  risk: ApiRisk;
  risk_window_hours: number;
  method: string;
  is_synthetic: boolean;
}

interface RadarApiResponse {
  data_mode: string;
  method: string;
  items: RadarApiItem[];
}

interface RadarFacility {
  facilityId: string;
  facilityName: string;
  shortName: string;
  location: string;
  activeAlertCount: number;
  stocks: Record<
    BloodGroup,
    {
      units: number;
      safetyFloor: number;
      expectedDemand24h: number;
      expectedIncomingUnits: number;
      projectedGap: number;
      risk: ApiRisk;
      riskWindowHours: number;
      status: 'critical' | 'warning' | 'normal';
      isSynthetic: boolean;
    }
  >;
}

type ViewMode = 'both' | '3d' | 'matrix';

const emptyStock = {
  units: 0,
  safetyFloor: 0,
  expectedDemand24h: 0,
  expectedIncomingUnits: 0,
  projectedGap: 0,
  risk: 'GREEN' as ApiRisk,
  riskWindowHours: 0,
  status: 'normal' as const,
  isSynthetic: true,
};

const riskToStatus = (
  risk: ApiRisk,
): 'critical' | 'warning' | 'normal' => {
  if (risk === 'RED') return 'critical';
  if (risk === 'AMBER') return 'warning';
  return 'normal';
};

const formatRisk = (risk: ApiRisk) => {
  if (risk === 'RED') return 'Critical';
  if (risk === 'AMBER') return 'Warning';
  return 'Stable';
};

const getRiskClasses = (risk: ApiRisk) => {
  if (risk === 'RED') {
    return 'bg-red-50 text-primary border-red-200';
  }

  if (risk === 'AMBER') {
    return 'bg-amber-50 text-amber-800 border-amber-200';
  }

  return 'bg-emerald-50 text-emerald-800 border-emerald-200';
};

const getRiskDot = (risk: ApiRisk) => {
  if (risk === 'RED') return 'bg-primary animate-beacon';
  if (risk === 'AMBER') return 'bg-amber-500';
  return 'bg-emerald-600';
};

const mapApiItemsToFacilities = (
  items: RadarApiItem[],
): RadarFacility[] => {
  const facilityMap = new Map<string, RadarFacility>();

  for (const item of items) {
    let facility = facilityMap.get(item.bank_id);

    if (!facility) {
      facility = {
        facilityId: item.bank_id,
        facilityName: item.bank_name,
        shortName: item.bank_name,
        location: item.location,
        activeAlertCount: 0,
        stocks: {
          'O-': { ...emptyStock },
          'O+': { ...emptyStock },
          'A-': { ...emptyStock },
          'A+': { ...emptyStock },
          'B-': { ...emptyStock },
          'B+': { ...emptyStock },
          'AB-': { ...emptyStock },
          'AB+': { ...emptyStock },
        },
      };

      facilityMap.set(item.bank_id, facility);
    }

    const risk = item.risk;

    facility.stocks[item.blood_group] = {
      units: item.available_units,
      safetyFloor: item.safety_floor,
      expectedDemand24h: item.expected_demand_24h,
      expectedIncomingUnits: item.expected_incoming_units,
      projectedGap: item.projected_gap,
      risk,
      riskWindowHours: item.risk_window_hours,
      status: riskToStatus(risk),
      isSynthetic: item.is_synthetic,
    };
  }

  for (const facility of facilityMap.values()) {
    facility.activeAlertCount = SEROTYPES.filter((group) => {
      const risk = facility.stocks[group].risk;
      return risk === 'RED' || risk === 'AMBER';
    }).length;
  }

  return Array.from(facilityMap.values());
};

export const ShortageRadarPage: React.FC = () => {
  const { setActiveIncident } = useIncident();

  const [radarItems, setRadarItems] = useState<RadarApiItem[]>([]);
  const [dataMode, setDataMode] = useState('SYNTHETIC_DEMO');
  const [method, setMethod] = useState('DEMO_RULE_BASED');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedSerotype, setSelectedSerotype] =
    useState<BloodGroup>('O-');
  const [selectedFacilityId, setSelectedFacilityId] =
    useState('BB-DEL-A');
  const [viewMode, setViewMode] = useState<ViewMode>('both');

  const loadRadar = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get<RadarApiResponse>('/radar');

      if (!response || !Array.isArray(response.items)) {
        throw new Error(
          'The radar API returned an unexpected response format.',
        );
      }

      setRadarItems(response.items);
      setDataMode(response.data_mode || 'UNKNOWN');
      setMethod(response.method || 'UNKNOWN');

      setSelectedFacilityId((currentId) => {
        const exists = response.items.some(
          (item) => item.bank_id === currentId,
        );

        return exists
          ? currentId
          : response.items[0]?.bank_id || '';
      });

      setSelectedSerotype((currentGroup) => {
        const exists = response.items.some(
          (item) =>
            item.blood_group === currentGroup &&
            response.items.some(
              (candidate) => candidate.bank_id === selectedFacilityId,
            ),
        );

        return exists ? currentGroup : 'O-';
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to load radar inventory.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [selectedFacilityId]);

  useEffect(() => {
    void loadRadar();
  }, [loadRadar]);

  const facilities = useMemo(
    () => mapApiItemsToFacilities(radarItems),
    [radarItems],
  );

  const selectedFacility =
    facilities.find(
      (facility) => facility.facilityId === selectedFacilityId,
    ) || facilities[0];

  const selectedStock = selectedFacility
    ? selectedFacility.stocks[selectedSerotype]
    : undefined;

  const totals = useMemo(() => {
    const totalUnits = radarItems.reduce(
      (sum, item) => sum + item.available_units,
      0,
    );

    const redCount = radarItems.filter(
      (item) => item.risk === 'RED',
    ).length;

    const amberCount = radarItems.filter(
      (item) => item.risk === 'AMBER',
    ).length;

    const greenCount = radarItems.filter(
      (item) => item.risk === 'GREEN',
    ).length;

    return {
      totalUnits,
      redCount,
      amberCount,
      greenCount,
      recordCount: radarItems.length,
      facilityCount: new Set(
        radarItems.map((item) => item.bank_id),
      ).size,
    };
  }, [radarItems]);

  const handleCellClick = (
    facilityId: string,
    bloodGroup: BloodGroup,
  ) => {
    setSelectedFacilityId(facilityId);
    setSelectedSerotype(bloodGroup);

    const facility = facilities.find(
      (item) => item.facilityId === facilityId,
    );

    if (!facility) return;

    const stock = facility.stocks[bloodGroup];

    // Only open a shortage incident for a backend RED/AMBER record.
    if (stock.risk === 'GREEN') return;

    setActiveIncident({
      incidentId: `DEMO-${facilityId}-${bloodGroup.replace('-', 'NEG').replace('+', 'POS')}`,
      facilityId: facility.facilityId,
      facilityName: facility.facilityName,
      bloodGroup,
      currentStock: stock.units,
      mandatedFloor: stock.safetyFloor,

      // This is the API's projected gap. It is NOT the
      // difference between available units and the safety floor.
      projectedGap: stock.projectedGap,

      // The API provides a risk window, not a confirmed
      // depletion/breach time. Keep the legacy field neutral.
      breachHorizonIST: 'Not available from current API',
      hoursUntilBreach: 0,

      severity: stock.risk === 'RED' ? 'CRITICAL' : 'WARNING',
      modelIdentifier: method,
      burnVelocityUnitsPerHour: 0,
    });
  };

  const handleFacilitySelect = (facilityId: string) => {
    handleCellClick(facilityId, selectedSerotype);
  };

  const serotypeOptions = SEROTYPES.map((bloodGroup) => ({
    value: bloodGroup,
    label: bloodGroup,
    alertDot: radarItems.some(
      (item) =>
        item.blood_group === bloodGroup &&
        (item.risk === 'RED' || item.risk === 'AMBER'),
    ),
  }));

  const viewModeOptions = [
    { value: 'both', label: 'Unified View' },
    { value: '3d', label: '3D Spatial Grid' },
    { value: 'matrix', label: 'Inventory Matrix' },
  ];

  const handleViewModeChange = (value: string) => {
    if (value === 'both' || value === '3d' || value === 'matrix') {
      setViewMode(value);
    }
  };

  const isSynthetic =
    dataMode.toUpperCase().includes('SYNTHETIC') ||
    radarItems.some((item) => item.is_synthetic);

  const safetyFloorDifference =
    selectedStock
      ? selectedStock.units - selectedStock.safetyFloor
      : 0;

  return (
    <div className="space-y-8">
      {/* 1. Page Header */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="space-y-1.5 max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-mono text-primary font-bold tracking-wider">
            <span
              className="w-2 h-2 rounded-full bg-primary animate-beacon"
              aria-hidden="true"
            />
            <span>STAGE 01/04: REGIONAL SHORTAGE SURVEILLANCE</span>
          </div>

          <h1 className="text-3xl font-display font-extrabold text-ink-main tracking-tight">
            Blood Shortage Radar
          </h1>

          <p className="text-sm text-ink-muted leading-relaxed">
            Monitor inventory levels, safety floors and backend-assessed
            risk across the available facilities and eight blood groups.
            Select a matrix cell to inspect its inventory details.
          </p>
        </div>

        <Stepper currentStep={1} />
      </section>

      {/* Data provenance banner */}
      <div
        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border p-4 ${
          isSynthetic
            ? 'border-amber-200 bg-amber-50'
            : 'border-emerald-200 bg-emerald-50'
        }`}
        role="status"
      >
        <div className="flex items-start gap-3">
          <span
            className={`mt-0.5 material-symbols-outlined ${
              isSynthetic ? 'text-amber-700' : 'text-emerald-700'
            }`}
            aria-hidden="true"
          >
            {isSynthetic ? 'science' : 'verified'}
          </span>

          <div>
            <p
              className={`text-sm font-bold ${
                isSynthetic ? 'text-amber-900' : 'text-emerald-900'
              }`}
            >
              {isSynthetic
                ? 'Synthetic demo data'
                : 'Radar data loaded'}
            </p>
            <p className="text-xs text-ink-secondary mt-0.5">
              Data mode: {dataMode} · Method: {method}
              {isSynthetic
                ? ' · These records are for demonstration, not verified live blood-bank inventory.'
                : ''}
            </p>
          </div>
        </div>

        <Button
          variant="secondary"
          size="sm"
          icon="refresh"
          onClick={() => void loadRadar()}
          disabled={isLoading}
        >
          {isLoading ? 'Refreshing…' : 'Refresh data'}
        </Button>
      </div>

      {/* Loading state */}
      {isLoading && radarItems.length === 0 && (
        <GlassPanel className="p-10 text-center">
          <span className="material-symbols-outlined text-3xl text-primary animate-spin">
            progress_activity
          </span>
          <p className="mt-3 font-semibold text-ink-main">
            Loading regional inventory…
          </p>
          <p className="mt-1 text-sm text-ink-secondary">
            Fetching the latest response from the radar API.
          </p>
        </GlassPanel>
      )}

      {/* API error state */}
      {error && (
        <GlassPanel className="p-5 border border-red-200">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-primary">
              error
            </span>
            <div className="flex-1">
              <h2 className="font-bold text-ink-main">
                Radar data could not be loaded
              </h2>
              <p className="mt-1 text-sm text-ink-secondary break-words">
                {error}
              </p>
              <p className="mt-2 text-xs text-ink-secondary">
                Check that FastAPI is running and that the frontend API
                base URL points to the correct backend.
              </p>
              <button
                type="button"
                onClick={() => void loadRadar()}
                className="mt-3 text-sm font-bold text-primary underline underline-offset-4"
              >
                Try again
              </button>
            </div>
          </div>
        </GlassPanel>
      )}

      {/* Render data-dependent sections only when data exists */}
      {radarItems.length > 0 && selectedFacility && selectedStock && (
        <>
          {/* Summary metrics */}
          <section className="grid grid-cols-2 xl:grid-cols-4 gap-3">
            <GlassPanel className="p-4">
              <p className="text-[11px] font-mono uppercase tracking-wider text-ink-secondary">
                Available units
              </p>
              <p className="mt-1 text-3xl font-display font-extrabold text-ink-main tabular-nums">
                {totals.totalUnits}
              </p>
              <p className="text-xs text-ink-secondary mt-1">
                Across {totals.recordCount} inventory records
              </p>
            </GlassPanel>

            <GlassPanel className="p-4">
              <p className="text-[11px] font-mono uppercase tracking-wider text-ink-secondary">
                Critical records
              </p>
              <p className="mt-1 text-3xl font-display font-extrabold text-primary tabular-nums">
                {totals.redCount}
              </p>
              <p className="text-xs text-ink-secondary mt-1">
                Backend risk: RED
              </p>
            </GlassPanel>

            <GlassPanel className="p-4">
              <p className="text-[11px] font-mono uppercase tracking-wider text-ink-secondary">
                Warning records
              </p>
              <p className="mt-1 text-3xl font-display font-extrabold text-amber-700 tabular-nums">
                {totals.amberCount}
              </p>
              <p className="text-xs text-ink-secondary mt-1">
                Backend risk: AMBER
              </p>
            </GlassPanel>

            <GlassPanel className="p-4">
              <p className="text-[11px] font-mono uppercase tracking-wider text-ink-secondary">
                Facilities
              </p>
              <p className="mt-1 text-3xl font-display font-extrabold text-ink-main tabular-nums">
                {totals.facilityCount}
              </p>
              <p className="text-xs text-ink-secondary mt-1">
                Present in the API response
              </p>
            </GlassPanel>
          </section>

          {/* 2. Filters and view controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-slate-200/90 p-3.5 rounded-xl shadow-subtle">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs font-mono font-bold text-ink-secondary uppercase">
                Blood group:
              </span>

              <SegmentedControl
                options={serotypeOptions}
                value={selectedSerotype}
                onChange={(value) =>
                  setSelectedSerotype(value as BloodGroup)
                }
                label="Blood group selector"
              />
            </div>

            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-ink-secondary uppercase">
                  View:
                </span>

                <SegmentedControl
                  options={viewModeOptions}
                  value={viewMode}
                  onChange={handleViewModeChange}
                  label="Radar view mode selector"
                  size="sm"
                />
              </div>

              <div className="flex items-center gap-3 text-xs font-mono text-ink-secondary">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-primary" />
                  RED
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" />
                  AMBER
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600" />
                  GREEN
                </span>
              </div>
            </div>
          </div>

          {/* 3. Existing 3D radar component */}
          {(viewMode === 'both' || viewMode === '3d') && (
            <RadarNetwork3D
              selectedSerotype={selectedSerotype}
              selectedFacilityId={selectedFacilityId}
              onSelectFacility={handleFacilitySelect}
            />
          )}

          {/* 4. API-backed inventory matrix */}
          {(viewMode === 'both' || viewMode === 'matrix') && (
            <GlassPanel className="p-0 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200/80 flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-slate-50/50">
                <div>
                  <h2 className="font-display font-bold text-base text-ink-main">
                    Regional Blood Inventory Matrix
                  </h2>
                  <p className="text-xs text-ink-secondary mt-0.5">
                    {totals.facilityCount} facilities · {SEROTYPES.length} blood groups.
                    Select any inventory cell to inspect its risk and stock details.
                  </p>
                </div>

                <span className="text-xs font-mono bg-white border border-slate-200 px-3 py-2 rounded-md text-ink-secondary font-semibold shadow-subtle">
                  Active focus:{' '}
                  <strong className="text-primary">
                    {selectedFacility.shortName} × {selectedSerotype}
                  </strong>
                </span>
              </div>

              <div className="overflow-x-auto">
                <table
                  className="w-full text-left text-xs font-mono border-collapse"
                  aria-label="Regional blood inventory matrix"
                >
                  <thead>
                    <tr className="bg-slate-50/80 text-ink-secondary border-b border-slate-200/80">
                      <th className="py-3.5 px-6 font-bold uppercase tracking-wider sticky left-0 bg-slate-50/95 z-20 min-w-[230px]">
                        Facility
                      </th>

                      {SEROTYPES.map((group) => (
                        <th
                          key={group}
                          scope="col"
                          className={`py-3.5 px-3 text-center font-bold uppercase tracking-wider min-w-[78px] ${
                            selectedSerotype === group
                              ? 'bg-red-50/60 text-primary border-x border-red-200/60'
                              : ''
                          }`}
                        >
                          {group}
                        </th>
                      ))}

                      <th
                        scope="col"
                        className="py-3.5 px-5 text-center font-bold uppercase tracking-wider min-w-[115px]"
                      >
                        Risk status
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {facilities.map((facility) => {
                      const isSelectedFacility =
                        facility.facilityId === selectedFacilityId;

                      const facilityHighestRisk: ApiRisk =
                        SEROTYPES.some(
                          (group) =>
                            facility.stocks[group].risk === 'RED',
                        )
                          ? 'RED'
                          : SEROTYPES.some(
                              (group) =>
                                facility.stocks[group].risk === 'AMBER',
                            )
                          ? 'AMBER'
                          : 'GREEN';

                      return (
                        <tr
                          key={facility.facilityId}
                          className={`transition-colors ${
                            isSelectedFacility
                              ? 'bg-red-50/20'
                              : 'hover:bg-slate-50/50'
                          }`}
                        >
                          <th
                            scope="row"
                            className={`py-3.5 px-6 font-sans text-left sticky left-0 z-10 ${
                              isSelectedFacility
                                ? 'bg-slate-50'
                                : 'bg-white'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <span
                                className={`w-2 h-2 rounded-full flex-shrink-0 ${getRiskDot(
                                  facilityHighestRisk,
                                )}`}
                                aria-hidden="true"
                              />

                              <div className="min-w-0">
                                <span className="font-bold text-ink-main block leading-tight text-[13px]">
                                  {facility.facilityName}
                                </span>
                                <span className="text-[11px] text-ink-secondary font-mono block mt-0.5">
                                  {facility.location}
                                </span>
                                <span className="text-[10px] text-ink-secondary font-mono block mt-0.5">
                                  {facility.facilityId}
                                </span>
                              </div>
                            </div>
                          </th>

                          {SEROTYPES.map((group) => {
                            const stock = facility.stocks[group];
                            const isActive =
                              isSelectedFacility &&
                              selectedSerotype === group;

                            const fillPercent =
                              stock.safetyFloor > 0
                                ? Math.min(
                                    100,
                                    Math.round(
                                      (stock.units / stock.safetyFloor) *
                                        100,
                                    ),
                                  )
                                : stock.units > 0
                                ? 100
                                : 0;

                            const barColor =
                              stock.risk === 'RED'
                                ? 'bg-primary'
                                : stock.risk === 'AMBER'
                                ? 'bg-amber-500'
                                : 'bg-emerald-600';

                            return (
                              <td
                                key={group}
                                className={`p-0 text-center ${
                                  selectedSerotype === group
                                    ? 'bg-slate-50/40'
                                    : ''
                                }`}
                              >
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleCellClick(
                                      facility.facilityId,
                                      group,
                                    )
                                  }
                                  aria-pressed={isActive}
                                  aria-label={`${facility.facilityName}, ${group}: ${stock.units} units, safety floor ${stock.safetyFloor}, risk ${stock.risk}. Select inventory record.`}
                                  className={`w-full min-h-[76px] py-2.5 px-2 flex flex-col items-center justify-center gap-1 transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset ${
                                    isActive
                                      ? 'bg-red-100/70 ring-2 ring-primary ring-inset font-bold text-primary'
                                      : stock.risk === 'RED'
                                      ? 'bg-red-50/80 text-primary hover:bg-red-100/60'
                                      : stock.risk === 'AMBER'
                                      ? 'bg-amber-50/60 text-amber-900 hover:bg-amber-100/60'
                                      : 'text-ink-main hover:bg-slate-100/60'
                                  }`}
                                >
                                  <span className="font-bold text-[13px] tabular-nums leading-none">
                                    {stock.units}u
                                  </span>

                                  <span className="w-12 h-1 bg-slate-200/80 rounded-full overflow-hidden">
                                    <span
                                      className={`block h-full rounded-full ${barColor}`}
                                      style={{
                                        width: `${fillPercent}%`,
                                      }}
                                    />
                                  </span>

                                  <span className="text-[10px] text-ink-secondary font-mono leading-none">
                                    Floor: {stock.safetyFloor}u
                                  </span>
                                </button>
                              </td>
                            );
                          })}

                          <td className="py-3.5 px-4 text-center">
                            <span
                              className={`inline-flex px-2.5 py-1 rounded-full border text-[10px] font-mono font-bold uppercase tracking-wider ${getRiskClasses(
                                facilityHighestRisk,
                              )}`}
                            >
                              {formatRisk(facilityHighestRisk)}
                            </span>
                            <p className="text-[10px] text-ink-secondary mt-1">
                              {facility.activeAlertCount} flagged
                            </p>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="px-5 py-3 border-t border-slate-200/80 bg-slate-50/60">
                <p className="text-[11px] text-ink-secondary leading-relaxed">
                  The stock bar represents available units relative to the
                  safety floor, capped at 100%. A safety-floor shortfall
                  is not the same as the API's projected demand gap.
                </p>
              </div>
            </GlassPanel>
          )}

          {/* 5. Selected inventory triage */}
          <GlassPanel
            isCritical={selectedStock.risk === 'RED'}
            elevation={2}
            className="p-6 lg:p-8 space-y-6"
          >
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
              <div>
                <div className="flex items-center gap-2 text-[11px] font-mono font-bold text-primary uppercase tracking-wider">
                  <span
                    className={`w-2 h-2 rounded-full ${getRiskDot(
                      selectedStock.risk,
                    )}`}
                  />
                  <span>Selected Inventory Record</span>
                </div>

                <h2 className="font-display font-bold text-xl text-ink-main mt-1">
                  {selectedFacility.facilityName} · {selectedSerotype}
                </h2>

                <p className="text-xs text-ink-secondary mt-1">
                  {selectedFacility.location} · {selectedFacility.facilityId}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={`inline-flex px-3 py-1.5 rounded-full border text-xs font-mono font-bold uppercase ${getRiskClasses(
                    selectedStock.risk,
                  )}`}
                >
                  {selectedStock.risk} risk
                </span>

                <Link to="/decision-center">
                  <Button
                    variant="primary"
                    size="sm"
                    icon="rule"
                    iconPosition="right"
                  >
                    Open Decision Center
                  </Button>
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Inventory metrics */}
              <div className="lg:col-span-5 space-y-4">
                <div className="p-5 rounded-xl bg-red-50/50 border border-red-200/90">
                  <span className="text-[11px] font-mono uppercase text-ink-secondary font-bold tracking-wider">
                    Available stock vs safety floor
                  </span>

                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-4xl font-display font-extrabold text-primary tabular-nums">
                      {selectedStock.units}
                    </span>
                    <span className="text-lg font-display font-bold text-ink-secondary tabular-nums">
                      / {selectedStock.safetyFloor} units
                    </span>
                  </div>

                  <div className="mt-3 text-sm font-semibold flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-primary">
                      {safetyFloorDifference < 0
                        ? 'warning'
                        : 'inventory_2'}
                    </span>

                    <span
                      className={
                        safetyFloorDifference < 0
                          ? 'text-primary'
                          : 'text-emerald-800'
                      }
                    >
                      {safetyFloorDifference < 0
                        ? `${Math.abs(safetyFloorDifference)} units below safety floor`
                        : safetyFloorDifference === 0
                        ? 'Exactly at safety floor'
                        : `${safetyFloorDifference} units above safety floor`}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-mono uppercase text-ink-secondary font-bold">
                      Expected demand
                    </span>
                    <div className="text-2xl font-display font-bold text-ink-main mt-1 tabular-nums">
                      {selectedStock.expectedDemand24h}
                    </div>
                    <span className="text-[11px] text-ink-secondary">
                      Next 24 hours · API value
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-mono uppercase text-ink-secondary font-bold">
                      Expected incoming
                    </span>
                    <div className="text-2xl font-display font-bold text-ink-main mt-1 tabular-nums">
                      {selectedStock.expectedIncomingUnits}
                    </div>
                    <span className="text-[11px] text-ink-secondary">
                      Units · API value
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-mono uppercase text-ink-secondary font-bold">
                      Projected gap
                    </span>
                    <div className={`text-2xl font-display font-bold mt-1 tabular-nums ${
                      selectedStock.projectedGap > 0
                        ? 'text-primary'
                        : 'text-ink-main'
                    }`}>
                      {selectedStock.projectedGap > 0 ? '+' : ''}
                      {selectedStock.projectedGap}
                    </div>
                    <span className="text-[11px] text-ink-secondary">
                      As returned by the API
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-mono uppercase text-ink-secondary font-bold">
                      Risk window
                    </span>
                    <div className="text-2xl font-display font-bold text-ink-main mt-1 tabular-nums">
                      {selectedStock.riskWindowHours > 0
                        ? `${selectedStock.riskWindowHours}h`
                        : '—'}
                    </div>
                    <span className="text-[11px] text-ink-secondary">
                      Not a confirmed runout time
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white">
                  <h3 className="text-sm font-bold text-ink-main">
                    Interpreting this record
                  </h3>
                  <p className="mt-1.5 text-xs text-ink-secondary leading-relaxed">
                    The safety-floor difference is calculated from current
                    stock and the required floor. The projected gap and
                    risk window are supplied independently by the backend.
                    They are not interchangeable measures.
                  </p>
                </div>
              </div>

              {/* Honest forecast panel */}
              <div className="lg:col-span-7">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div>
                    <h3 className="font-bold text-ink-main text-sm">
                      Inventory forecast
                    </h3>
                    <p className="text-xs text-ink-secondary mt-1">
                      Forecast chart awaiting time-series data
                    </p>
                  </div>

                  <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-full border border-amber-200 bg-amber-50 text-amber-800">
                    Not yet available
                  </span>
                </div>

                <div className="min-h-[300px] h-full rounded-xl border border-slate-200 bg-slate-50/70 p-6 flex flex-col items-center justify-center text-center">
                  <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center">
                    <span className="material-symbols-outlined text-3xl text-ink-secondary">
                      monitoring
                    </span>
                  </div>

                  <h4 className="mt-4 font-display font-bold text-ink-main">
                    Time-series forecast not provided
                  </h4>

                  <p className="mt-2 max-w-md text-sm text-ink-secondary leading-relaxed">
                    The current radar endpoint provides inventory, expected
                    24-hour demand, expected incoming units, a projected gap
                    and a risk window. It does not provide hourly inventory
                    points needed to draw a verified 72-hour depletion curve.
                  </p>

                  <div className="mt-5 grid grid-cols-2 gap-3 w-full max-w-sm text-left">
                    <div className="p-3 rounded-lg bg-white border border-slate-200">
                      <p className="text-[10px] font-mono uppercase text-ink-secondary">
                        Current stock
                      </p>
                      <p className="text-xl font-bold text-ink-main mt-1">
                        {selectedStock.units} units
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-white border border-slate-200">
                      <p className="text-[10px] font-mono uppercase text-ink-secondary">
                        Safety floor
                      </p>
                      <p className="text-xl font-bold text-ink-main mt-1">
                        {selectedStock.safetyFloor} units
                      </p>
                    </div>
                  </div>

                  <p className="mt-4 text-[11px] text-ink-secondary">
                    Method: {method}
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <p className="text-xs text-ink-secondary leading-relaxed">
                    Recommended next step: review this inventory record
                    before deciding on a transfer or donor mobilization.
                  </p>

                  <Link to="/decision-center" className="shrink-0">
                    <Button
                      variant="primary"
                      size="sm"
                      icon="arrow_forward"
                      iconPosition="right"
                    >
                      Proceed to Decision Center
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </GlassPanel>
        </>
      )}
    </div>
  );
};
