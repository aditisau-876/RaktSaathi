import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { GlassPanel } from '@/components/common/GlassPanel';
import { Button } from '@/components/common/Button';
import { SegmentedControl } from '@/components/common/SegmentedControl';

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  'http://127.0.0.1:8000/api/v1'
).replace(/\/$/, '');

type BloodGroup =
  | 'O-'
  | 'O+'
  | 'A-'
  | 'A+'
  | 'B-'
  | 'B+'
  | 'AB-'
  | 'AB+';

type InventoryRow = {
  bank_id: string;
  bank_name: string;
  location: string;
  blood_group: BloodGroup;
  units: number;
  safety_floor: number;
  incoming_units: number;
  collection_date?: string | null;
  expiry_date?: string | null;
};

type Facility = {
  id: string;
  name: string;
  location: string;
  stocks: Partial<Record<BloodGroup, InventoryRow>>;
  totalUnits: number;
  oNegative: number;
  oNegativeFloor: number;
};

type TransferSource = {
  bank_id: string;
  bank_name: string;
  location: string;
  units: number;
  safety_floor: number;
  potential_surplus_units: number;
};

const BLOOD_GROUPS: BloodGroup[] = [
  'O-', 'O+', 'A-', 'A+',
  'B-', 'B+', 'AB-', 'AB+',
];

const FILTER_OPTIONS = [
  { value: 'ALL', label: 'All Facilities' },
  { value: 'O-', label: 'O− Negative Focus', alertDot: true },
  { value: 'SURPLUS', label: 'Surplus Reservoirs' },
];

export const BloodBanksPage: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryRow[]>([]);
  const [selectedFilter, setSelectedFilter] =
    useState<'ALL' | 'O-' | 'SURPLUS'>('ALL');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const [transferSources, setTransferSources] =
    useState<TransferSource[]>([]);
  const [transferMessage, setTransferMessage] = useState<string | null>(null);
  const [checkingTransfer, setCheckingTransfer] = useState(false);

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/inventory`);

      if (!response.ok) {
        throw new Error(`Inventory request failed (${response.status}).`);
      }

      const data: InventoryRow[] = await response.json();

      if (!Array.isArray(data)) {
        throw new Error('The backend returned an unexpected inventory format.');
      }

      setInventory(data);
      setLastUpdated(new Date());
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to load blood-bank inventory.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchInventory();
  }, [fetchInventory]);

  const facilities = useMemo<Facility[]>(() => {
    const grouped = new Map<string, Facility>();

    for (const row of inventory) {
      let facility = grouped.get(row.bank_id);

      if (!facility) {
        facility = {
          id: row.bank_id,
          name: row.bank_name,
          location: row.location,
          stocks: {},
          totalUnits: 0,
          oNegative: 0,
          oNegativeFloor: 0,
        };

        grouped.set(row.bank_id, facility);
      }

      facility.stocks[row.blood_group] = row;
      facility.totalUnits += Number(row.units) || 0;

      if (row.blood_group === 'O-') {
        facility.oNegative = Number(row.units) || 0;
        facility.oNegativeFloor = Number(row.safety_floor) || 0;
      }
    }

    return Array.from(grouped.values());
  }, [inventory]);

  const filteredFacilities = useMemo(() => {
    if (selectedFilter === 'O-') {
      return facilities.filter(
        facility => (facility.stocks['O-']?.units ?? 0) > 0,
      );
    }

    if (selectedFilter === 'SURPLUS') {
      return facilities.filter(
        facility =>
          (facility.stocks['O-']?.units ?? 0) >
          (facility.stocks['O-']?.safety_floor ?? 0),
      );
    }

    return facilities;
  }, [facilities, selectedFilter]);

  const totalUnits = inventory.reduce(
    (total, row) => total + (Number(row.units) || 0),
    0,
  );

  const oNegativeUnits = inventory
    .filter(row => row.blood_group === 'O-')
    .reduce((total, row) => total + (Number(row.units) || 0), 0);

  const criticalRows = inventory.filter(
    row => row.units <= row.safety_floor,
  ).length;

  const potentialSurplus = inventory
    .filter(row => row.blood_group === 'O-')
    .reduce(
      (total, row) =>
        total + Math.max(0, row.units - row.safety_floor),
      0,
    );

  const handleReviewTransfer = async () => {
    setCheckingTransfer(true);
    setTransferMessage(null);
    setTransferSources([]);

    try {
      // Use the actual radar-detail endpoint from core.py.
      const destination = facilities.find(
        facility => facility.id === 'BB-DEL-A',
      );

      if (!destination) {
        throw new Error(
          'Destination bank BB-DEL-A was not found in the loaded inventory.',
        );
      }

      const response = await fetch(
        `${API_BASE_URL}/radar/${encodeURIComponent(destination.id)}/O-`,
      );

      if (!response.ok) {
        throw new Error(
          `Transfer recommendations request failed (${response.status}).`,
        );
      }

      const data = await response.json();
      const sources: TransferSource[] =
        data.potential_transfer_sources ?? [];

      setTransferSources(sources);
      setTransferMessage(
        sources.length > 0
          ? 'Potential source banks loaded. Verify stock, expiry, and approved transfer procedures before acting.'
          : 'No potential transfer sources were returned by the risk service.',
      );
    } catch (err) {
      setTransferMessage(
        err instanceof Error
          ? err.message
          : 'Unable to load transfer recommendations.',
      );
    } finally {
      setCheckingTransfer(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="space-y-1.5 max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-mono text-primary font-bold tracking-wider">
            <span className="material-symbols-outlined text-[16px]">
              share_location
            </span>
            <span>OPERATIONAL SUPPLY DIRECTORY • REGIONAL INTELLIGENCE</span>
          </div>

          <h1 className="text-3xl font-display font-extrabold text-ink-main tracking-tight">
            Blood Banks
          </h1>

          <p className="text-sm text-ink-muted leading-relaxed">
            Blood inventory, safety-floor monitoring, and potential
            inter-bank supply options across the network.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="primary"
            size="sm"
            icon="refresh"
            onClick={() => void fetchInventory()}
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh Inventory'}
          </Button>

          <SegmentedControl
            options={[
              { value: 'ALL', label: 'All Facilities', badge: facilities.length },
              { value: 'O-', label: 'O− Negative Focus', alertDot: true },
              { value: 'SURPLUS', label: 'Surplus Reservoirs' },
            ]}
            value={selectedFilter}
            onChange={setSelectedFilter}
            label="Blood banks filter"
          />
        </div>
      </section>

      {/* Error and loading states */}
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
        >
          <strong>Could not load inventory.</strong>
          <p className="mt-1">{error}</p>
          <p className="mt-1">
            Check that FastAPI is running and that VITE_API_BASE_URL
            points to your backend.
          </p>
        </div>
      )}

      {loading && inventory.length === 0 && (
        <GlassPanel className="p-8 text-center">
          <p className="text-sm text-ink-secondary">
            Loading blood-bank inventory from the backend...
          </p>
        </GlassPanel>
      )}

      {/* Inventory summary */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-subtle">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="px-2">
            <span className="text-[10px] font-mono text-ink-secondary uppercase font-bold block">
              Monitored Facilities
            </span>
            <div className="text-2xl font-display font-bold text-ink-main mt-1">
              {facilities.length}
            </div>
            <span className="text-xs text-ink-secondary font-mono">
              Banks in loaded inventory
            </span>
          </div>

          <div className="px-2">
            <span className="text-[10px] font-mono text-ink-secondary uppercase font-bold block">
              Network Inventory
            </span>
            <div className="text-2xl font-display font-bold text-ink-main mt-1">
              {totalUnits.toLocaleString()} Units
            </div>
            <span className="text-xs text-ink-secondary font-mono">
              Across all returned stock rows
            </span>
          </div>

          <div className="px-2">
            <span className="text-[10px] font-mono text-primary uppercase font-bold block">
              At or Below Safety Floor
            </span>
            <div className="text-2xl font-display font-bold text-primary mt-1">
              {criticalRows}
            </div>
            <span className="text-xs text-ink-secondary font-mono">
              Inventory rows requiring review
            </span>
          </div>

          <div className="px-2">
            <span className="text-[10px] font-mono text-emerald-800 uppercase font-bold block">
              O− Inventory
            </span>
            <div className="text-2xl font-display font-bold text-emerald-700 mt-1">
              {oNegativeUnits} Units
            </div>
            <span className="text-xs text-emerald-700 font-mono">
              {potentialSurplus} units above safety floors
            </span>
          </div>
        </div>

        {lastUpdated && (
          <p className="text-[11px] text-ink-secondary font-mono mt-4">
            Last refreshed: {lastUpdated.toLocaleString()}
          </p>
        )}
      </div>

      {/* Potential rebalancing */}
      <GlassPanel elevation={2} className="p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">
                swap_horiz
              </span>
              <h2 className="font-display font-bold text-lg text-ink-main">
                Surplus and Shortage Review
              </h2>
            </div>
            <p className="text-xs text-ink-secondary mt-1">
              Fetch potential O− supply sources for destination bank BB-DEL-A.
            </p>
          </div>

          <Button
            variant="primary"
            size="sm"
            icon="route"
            onClick={() => void handleReviewTransfer()}
            disabled={checkingTransfer || loading || facilities.length === 0}
          >
            {checkingTransfer
              ? 'Checking...'
              : 'Review Transfer Recommendations'}
          </Button>
        </div>

        {transferMessage && (
          <div
            role="status"
            className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-ink-main"
          >
            {transferMessage}
          </div>
        )}

        {transferSources.length > 0 && (
          <div className="space-y-3">
            {transferSources.map(source => (
              <div
                key={source.bank_id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl border border-emerald-200 bg-emerald-50/50 p-4"
              >
                <div>
                  <h3 className="font-display font-bold text-ink-main">
                    {source.bank_name}
                  </h3>
                  <p className="text-xs text-ink-secondary">
                    {source.location} · {source.bank_id}
                  </p>
                </div>

                <div className="text-sm sm:text-right">
                  <div className="font-bold text-emerald-700">
                    {source.units} O− units available
                  </div>
                  <div className="text-xs text-ink-secondary">
                    {source.potential_surplus_units} units above safety floor
                    ({source.safety_floor})
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="text-xs text-ink-secondary">
          Recommendations are demo estimates, not dispatch orders. Authorized
          staff must verify inventory, expiry, compatibility, and cold-chain
          requirements before any transfer.
        </p>
      </GlassPanel>

      {/* Facility directory */}
      <section className="space-y-4" aria-labelledby="facilities-heading">
        <div className="flex items-center justify-between gap-3">
          <h2
            id="facilities-heading"
            className="font-display font-bold text-lg text-ink-main"
          >
            Regional Facility Inventory ({filteredFacilities.length})
          </h2>

          <span className="text-xs text-ink-secondary">
            {selectedFilter === 'ALL'
              ? 'All facilities'
              : selectedFilter === 'O-'
                ? 'O− stock available'
                : 'O− above safety floor'}
          </span>
        </div>

        {!loading && !error && filteredFacilities.length === 0 && (
          <GlassPanel className="p-6">
            <p className="text-sm text-ink-secondary">
              No facilities match this filter, or the backend returned no
              inventory records.
            </p>
          </GlassPanel>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredFacilities.map(facility => (
            <GlassPanel
              key={facility.id}
              className="p-6 space-y-4"
            >
              <div className="flex items-start justify-between gap-4 pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-ink-secondary font-bold uppercase">
                      Blood Bank
                    </span>
                    <span className="text-xs font-mono text-ink-secondary">
                      {facility.id}
                    </span>
                  </div>

                  <h3 className="font-display font-bold text-lg text-ink-main mt-1">
                    {facility.name}
                  </h3>

                  <p className="text-xs text-ink-secondary">
                    {facility.location}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-2xl font-display font-extrabold text-ink-main">
                    {facility.totalUnits}
                  </span>
                  <span className="text-xs text-ink-secondary block font-mono">
                    Total Units
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs font-mono">
                {BLOOD_GROUPS.map(group => {
                  const stock = facility.stocks[group];
                  const units = stock?.units ?? 0;
                  const floor = stock?.safety_floor ?? 0;

                  const isCritical = Boolean(stock && units <= floor);
                  const isWarning = Boolean(
                    stock && units > floor && units <= floor * 1.5,
                  );

                  return (
                    <div
                      key={group}
                      className={`p-2.5 rounded-lg border ${
                        isCritical
                          ? 'bg-red-50 border-red-200 text-primary'
                          : isWarning
                            ? 'bg-amber-50 border-amber-200 text-amber-900'
                            : 'bg-slate-50 border-slate-200 text-ink-main'
                      }`}
                    >
                      <span className="text-[10px] opacity-75 uppercase block">
                        {group}
                      </span>

                      <span className="text-sm font-bold block">
                        {stock ? `${units}u` : '—'}
                      </span>

                      <span className="text-[10px] text-ink-secondary block font-normal">
                        {stock ? `Floor: ${floor}u` : 'No record'}
                      </span>

                      {stock && stock.incoming_units > 0 && (
                        <span className="text-[10px] block mt-1">
                          +{stock.incoming_units} incoming
                        </span>
                      )}
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