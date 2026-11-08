
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  inventoryApi,
  type InventoryMovement,
  type InventoryStock,
  type InventorySummary,
  type BloodGroup,
  type StockStatus,
} from "../../lib/inventoryApi";
import "./InventoryPage.css";

const BLOOD_GROUPS: BloodGroup[] = [
  "O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+",
];

const STATUS_LABELS: Record<StockStatus, string> = {
  EXPIRED: "Expired",
  LOW: "Low stock",
  HEALTHY: "Healthy",
  NO_EXPIRY: "No expiry date",
};

const EMPTY_SUMMARY: InventorySummary = {
  total_records: 0,
  total_units: 0,
  low_stock_records: 0,
  expired_records: 0,
  no_expiry_records: 0,
  last_calculated_at: "",
};

function formatDate(value: string | null | undefined) {
  if (!value) return "Not recorded";

  const date = new Date(`${value.slice(0, 10)}T00:00:00`);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusClass(status: StockStatus) {
  return status.toLowerCase().replace(/_/g, "-");
}

function getFriendlyError(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Something went wrong. Please try again.";
}

function StockStatusBadge({ status }: { status: StockStatus }) {
  return (
    <span className={`inventory-status inventory-status--${getStatusClass(status)}`}>
      <span className="inventory-status__dot" />
      {STATUS_LABELS[status]}
    </span>
  );
}

function MetricCard({
  label,
  value,
  caption,
  icon,
  tone,
}: {
  label: string;
  value: string | number;
  caption: string;
  icon: string;
  tone: string;
}) {
  return (
    <article className="inventory-metric">
      <div className="inventory-metric__top">
        <span className="inventory-metric__label">{label}</span>
        <span className={`inventory-metric__icon inventory-metric__icon--${tone}`}>
          {icon}
        </span>
      </div>
      <div className="inventory-metric__value">{value}</div>
      <div className="inventory-metric__caption">{caption}</div>
    </article>
  );
}

function AdjustmentModal({
  stock,
  busy,
  error,
  onClose,
  onSubmit,
}: {
  stock: InventoryStock;
  busy: boolean;
  error: string;
  onClose: () => void;
  onSubmit: (data: {
    units_delta: number;
    reason: string;
    reference: string;
  }) => Promise<void>;
}) {
  const [direction, setDirection] = useState<"in" | "out">("in");
  const [units, setUnits] = useState("1");
  const [reason, setReason] = useState("");
  const [reference, setReference] = useState("");

  const quantity = Number(units);
  const validQuantity =
    Number.isInteger(quantity) &&
    quantity > 0 &&
    (direction === "in" || quantity <= stock.units);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validQuantity || reason.trim().length < 3) return;

    await onSubmit({
      units_delta: direction === "in" ? quantity : -quantity,
      reason: reason.trim(),
      reference: reference.trim(),
    });
  }

  return (
    <div
      className="inventory-modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) onClose();
      }}
    >
      <section
        className="inventory-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="adjustment-title"
      >
        <div className="inventory-modal__header">
          <div>
            <p className="inventory-eyebrow">INVENTORY CONTROL</p>
            <h2 id="adjustment-title">Adjust stock</h2>
            <p className="inventory-muted">
              {stock.bank_name} · {stock.blood_group}
            </p>
          </div>
          <button
            type="button"
            className="inventory-icon-button"
            onClick={onClose}
            disabled={busy}
            aria-label="Close adjustment form"
          >
            ×
          </button>
        </div>

        <div className="inventory-adjustment-current">
          <span>Current available units</span>
          <strong>{stock.units}</strong>
        </div>

        <form onSubmit={handleSubmit} className="inventory-form">
          <label className="inventory-field">
            <span>Adjustment type</span>
            <div className="inventory-segment">
              <button
                type="button"
                className={direction === "in" ? "is-active" : ""}
                onClick={() => setDirection("in")}
                disabled={busy}
              >
                + Receive units
              </button>
              <button
                type="button"
                className={direction === "out" ? "is-active" : ""}
                onClick={() => setDirection("out")}
                disabled={busy}
              >
                − Issue units
              </button>
            </div>
          </label>

          <label className="inventory-field">
            <span>Number of units</span>
            <input
              type="number"
              min="1"
              max={direction === "out" ? stock.units : 100000}
              step="1"
              value={units}
              onChange={(event) => setUnits(event.target.value)}
              required
            />
            {direction === "out" && (
              <small>Maximum available for this adjustment: {stock.units}</small>
            )}
          </label>

          <label className="inventory-field">
            <span>Reason <b>*</b></span>
            <textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              minLength={3}
              maxLength={500}
              placeholder={
                direction === "in"
                  ? "e.g. Verified receipt from collection drive"
                  : "e.g. Verified issue against an approved request"
              }
              required
              rows={3}
            />
          </label>

          <label className="inventory-field">
            <span>Reference ID <small>(optional)</small></span>
            <input
              value={reference}
              onChange={(event) => setReference(event.target.value)}
              maxLength={100}
              placeholder="e.g. RECEIPT-2026-001"
            />
          </label>

          {error && (
            <div className="inventory-inline-error" role="alert">
              {error}
            </div>
          )}

          <div className="inventory-modal__actions">
            <button
              type="button"
              className="inventory-button inventory-button--secondary"
              onClick={onClose}
              disabled={busy}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inventory-button inventory-button--primary"
              disabled={busy || !validQuantity || reason.trim().length < 3}
            >
              {busy ? "Saving..." : "Save adjustment"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function MovementPanel({
  stock,
  movements,
  loading,
  error,
  onClose,
}: {
  stock: InventoryStock;
  movements: InventoryMovement[];
  loading: boolean;
  error: string;
  onClose: () => void;
}) {
  return (
    <div
      className="inventory-modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="inventory-modal inventory-modal--wide"
        role="dialog"
        aria-modal="true"
        aria-labelledby="movement-title"
      >
        <div className="inventory-modal__header">
          <div>
            <p className="inventory-eyebrow">AUDIT TRAIL</p>
            <h2 id="movement-title">Stock movement history</h2>
            <p className="inventory-muted">
              {stock.bank_name} · {stock.blood_group} · Current units: {stock.units}
            </p>
          </div>
          <button
            type="button"
            className="inventory-icon-button"
            onClick={onClose}
            aria-label="Close movement history"
          >
            ×
          </button>
        </div>

        {loading ? (
          <div className="inventory-state">Loading movement history…</div>
        ) : error ? (
          <div className="inventory-inline-error" role="alert">{error}</div>
        ) : movements.length === 0 ? (
          <div className="inventory-state">
            <div className="inventory-state__icon">↔</div>
            <h3>No recorded movements yet</h3>
            <p>New adjustments will appear here after they are saved.</p>
          </div>
        ) : (
          <div className="inventory-table-wrap inventory-movement-table">
            <table className="inventory-table">
              <thead>
                <tr>
                  <th>Date and time</th>
                  <th>Type</th>
                  <th>Change</th>
                  <th>Before</th>
                  <th>After</th>
                  <th>Reason / reference</th>
                </tr>
              </thead>
              <tbody>
                {movements.map((movement) => (
                  <tr key={movement.id}>
                    <td>{formatDateTime(movement.created_at)}</td>
                    <td>
                      <span className="inventory-table-tag">
                        {movement.movement_type}
                      </span>
                    </td>
                    <td>
                      <strong className={movement.units_delta > 0
                        ? "inventory-positive"
                        : "inventory-negative"
                      }>
                        {movement.units_delta > 0 ? "+" : ""}
                        {movement.units_delta}
                      </strong>
                    </td>
                    <td>{movement.units_before}</td>
                    <td><strong>{movement.units_after}</strong></td>
                    <td>
                      <div>{movement.reason}</div>
                      {movement.reference && (
                        <small className="inventory-muted">
                          Ref: {movement.reference}
                        </small>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default function InventoryPage() {
  const [stocks, setStocks] = useState<InventoryStock[]>([]);
  const [summary, setSummary] = useState<InventorySummary>(EMPTY_SUMMARY);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pageError, setPageError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [search, setSearch] = useState("");
  const [bloodGroup, setBloodGroup] = useState<BloodGroup | "">("");
  const [status, setStatus] = useState<StockStatus | "">("");

  const [adjustmentStock, setAdjustmentStock] =
    useState<InventoryStock | null>(null);
  const [adjustmentBusy, setAdjustmentBusy] = useState(false);
  const [adjustmentError, setAdjustmentError] = useState("");

  const [movementStock, setMovementStock] =
    useState<InventoryStock | null>(null);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [movementLoading, setMovementLoading] = useState(false);
  const [movementError, setMovementError] = useState("");

  const loadInventory = useCallback(async (initial = false) => {
    if (initial) setLoading(true);
    else setRefreshing(true);

    setPageError("");

    try {
      const [stockResult, summaryResult] = await Promise.all([
        inventoryApi.getStocks(),
        inventoryApi.getSummary(),
      ]);

      setStocks(stockResult);
      setSummary(summaryResult);
    } catch (error) {
      setPageError(getFriendlyError(error));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadInventory(true);
  }, [loadInventory]);

  const filteredStocks = useMemo(() => {
    const query = search.trim().toLowerCase();

    return stocks.filter((stock) => {
      const matchesSearch =
        !query ||
        stock.bank_name.toLowerCase().includes(query) ||
        stock.bank_location.toLowerCase().includes(query) ||
        stock.bank_id.toLowerCase().includes(query) ||
        stock.blood_group.toLowerCase().includes(query);

      const matchesGroup = !bloodGroup || stock.blood_group === bloodGroup;
      const matchesStatus = !status || stock.stock_status === status;

      return matchesSearch && matchesGroup && matchesStatus;
    });
  }, [stocks, search, bloodGroup, status]);

  const clearFilters = () => {
    setSearch("");
    setBloodGroup("");
    setStatus("");
  };

  async function submitAdjustment(data: {
    units_delta: number;
    reason: string;
    reference: string;
  }) {
    if (!adjustmentStock) return;

    setAdjustmentBusy(true);
    setAdjustmentError("");
    setSuccessMessage("");

    try {
      await inventoryApi.adjustStock(adjustmentStock.id, data);
      setAdjustmentStock(null);
      setSuccessMessage("Stock adjustment saved successfully.");
      await loadInventory();
    } catch (error) {
      setAdjustmentError(getFriendlyError(error));
    } finally {
      setAdjustmentBusy(false);
    }
  }

  async function openMovementHistory(stock: InventoryStock) {
    setMovementStock(stock);
    setMovements([]);
    setMovementError("");
    setMovementLoading(true);

    try {
      const result = await inventoryApi.getMovements(stock.id);
      setMovements(result);
    } catch (error) {
      setMovementError(getFriendlyError(error));
    } finally {
      setMovementLoading(false);
    }
  }

  const activeFilters = Boolean(search || bloodGroup || status);

  return (
    <main className="inventory-page">
      <header className="inventory-page__header">
        <div>
          <div className="inventory-breadcrumb">
            <span>Blood Operations</span>
            <span>/</span>
            <strong>Inventory Management</strong>
          </div>
          <div className="inventory-title-row">
            <div>
              <h1>Inventory Management</h1>
              <p>
                Monitor blood component stock, expiry dates and recorded stock movements.
              </p>
            </div>
            <button
              type="button"
              className="inventory-button inventory-button--secondary"
              onClick={() => void loadInventory()}
              disabled={loading || refreshing}
            >
              <span className={refreshing ? "inventory-refresh-spin" : ""}>↻</span>
              {refreshing ? "Refreshing..." : "Refresh data"}
            </button>
          </div>
        </div>
      </header>

      {pageError && (
        <div className="inventory-banner inventory-banner--error" role="alert">
          <div>
            <strong>Unable to load inventory</strong>
            <p>{pageError}</p>
            <small>
              Check that the FastAPI server is running and the inventory router is registered.
            </small>
          </div>
          <button
            type="button"
            className="inventory-button inventory-button--secondary"
            onClick={() => void loadInventory(true)}
          >
            Try again
          </button>
        </div>
      )}

      {successMessage && (
        <div className="inventory-banner inventory-banner--success" role="status">
          <span>✓ {successMessage}</span>
          <button
            type="button"
            className="inventory-icon-button"
            onClick={() => setSuccessMessage("")}
            aria-label="Dismiss message"
          >
            ×
          </button>
        </div>
      )}

      <section className="inventory-metrics" aria-label="Inventory summary">
        <MetricCard
          label="Total available units"
          value={loading ? "—" : summary.total_units.toLocaleString("en-IN")}
          caption="Across inventory records"
          icon="▤"
          tone="red"
        />
        <MetricCard
          label="Inventory records"
          value={loading ? "—" : summary.total_records}
          caption="Tracked bank and blood-group entries"
          icon="◫"
          tone="blue"
        />
        <MetricCard
          label="Low-stock records"
          value={loading ? "—" : summary.low_stock_records}
          caption="Below configured safety floor"
          icon="!"
          tone="amber"
        />
        <MetricCard
          label="Expired records"
          value={loading ? "—" : summary.expired_records}
          caption="Past the recorded expiry date"
          icon="⌁"
          tone="slate"
        />
      </section>

      <section className="inventory-panel">
        <div className="inventory-panel__heading">
          <div>
            <h2>Blood stock records</h2>
            <p>Search, review and manage recorded stock at each blood bank.</p>
          </div>
          <span className="inventory-record-count">
            {loading ? "Loading…" : `${filteredStocks.length} records`}
          </span>
        </div>

        <div className="inventory-filters">
          <label className="inventory-search">
            <span aria-hidden="true">⌕</span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search blood bank, location or group..."
              aria-label="Search inventory"
            />
          </label>

          <select
            value={bloodGroup}
            onChange={(event) => setBloodGroup(event.target.value as BloodGroup | "")}
            aria-label="Filter by blood group"
          >
            <option value="">All blood groups</option>
            {BLOOD_GROUPS.map((group) => (
              <option value={group} key={group}>{group}</option>
            ))}
          </select>

          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as StockStatus | "")}
            aria-label="Filter by stock status"
          >
            <option value="">All statuses</option>
            {(Object.keys(STATUS_LABELS) as StockStatus[]).map((key) => (
              <option value={key} key={key}>{STATUS_LABELS[key]}</option>
            ))}
          </select>

          {activeFilters && (
            <button
              type="button"
              className="inventory-clear-button"
              onClick={clearFilters}
            >
              Clear filters
            </button>
          )}
        </div>

        <div className="inventory-table-wrap">
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Blood bank</th>
                <th>Blood group</th>
                <th>Available units</th>
                <th>Safety floor</th>
                <th>Incoming</th>
                <th>Expiry date</th>
                <th>Stock status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8}>
                    <div className="inventory-state">Loading inventory records…</div>
                  </td>
                </tr>
              ) : filteredStocks.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <div className="inventory-state">
                      <div className="inventory-state__icon">▤</div>
                      <h3>{stocks.length === 0 ? "No inventory records found" : "No matching records"}</h3>
                      <p>
                        {stocks.length === 0
                          ? "When inventory records are available in the backend, they will appear here."
                          : "Try changing your search or filters."}
                      </p>
                      {activeFilters && (
                        <button
                          type="button"
                          className="inventory-button inventory-button--secondary"
                          onClick={clearFilters}
                        >
                          Clear filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredStocks.map((stock) => (
                  <tr key={stock.id}>
                    <td>
                      <div className="inventory-bank-cell">
                        <span className="inventory-bank-avatar">+</span>
                        <div>
                          <strong>{stock.bank_name}</strong>
                          <small>{stock.bank_location}</small>
                          <small className="inventory-bank-id">ID: {stock.bank_id}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="inventory-blood-group">{stock.blood_group}</span>
                    </td>
                    <td>
                      <strong className="inventory-units">{stock.units}</strong>
                    </td>
                    <td>{stock.safety_floor}</td>
                    <td>{stock.incoming_units}</td>
                    <td>
                      <div>{formatDate(stock.expiry_date)}</div>
                      {stock.expiry_date && stock.expiry_date < new Date().toISOString().slice(0, 10) && (
                        <small className="inventory-negative">Past expiry</small>
                      )}
                    </td>
                    <td><StockStatusBadge status={stock.stock_status} /></td>
                    <td>
                      <div className="inventory-row-actions">
                        <button
                          type="button"
                          className="inventory-action-button"
                          onClick={() => {
                            setAdjustmentError("");
                            setAdjustmentStock(stock);
                          }}
                          title="Adjust available stock"
                        >
                          Adjust
                        </button>
                        <button
                          type="button"
                          className="inventory-action-button inventory-action-button--quiet"
                          onClick={() => void openMovementHistory(stock)}
                          title="View stock movement history"
                        >
                          History
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <footer className="inventory-table-footer">
          <span>
            Showing {loading ? 0 : filteredStocks.length} of {loading ? "…" : stocks.length} records
          </span>
          <span>Data provided by the RaktSaathi API</span>
        </footer>
      </section>

      <section className="inventory-note">
        <div className="inventory-note__icon">i</div>
        <div>
          <strong>Inventory data quality</strong>
          <p>
            Stock counts and statuses depend on the records currently stored by the backend.
            Verify expiry dates and physical stock before making operational decisions.
            This screen does not independently validate blood-product suitability.
          </p>
        </div>
      </section>

      {adjustmentStock && (
        <AdjustmentModal
          stock={adjustmentStock}
          busy={adjustmentBusy}
          error={adjustmentError}
          onClose={() => {
            if (!adjustmentBusy) {
              setAdjustmentStock(null);
              setAdjustmentError("");
            }
          }}
          onSubmit={submitAdjustment}
        />
      )}

      {movementStock && (
        <MovementPanel
          stock={movementStock}
          movements={movements}
          loading={movementLoading}
          error={movementError}
          onClose={() => setMovementStock(null)}
        />
      )}
    </main>
  );
}
