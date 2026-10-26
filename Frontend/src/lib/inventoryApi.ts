
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  "http://127.0.0.1:8000/api/v1";

export type BloodGroup =
  | "O-"
  | "O+"
  | "A-"
  | "A+"
  | "B-"
  | "B+"
  | "AB-"
  | "AB+";

export type StockStatus =
  | "EXPIRED"
  | "LOW"
  | "HEALTHY"
  | "NO_EXPIRY";

export interface InventoryStock {
  id: number;
  bank_id: string;
  bank_name: string;
  bank_location: string;
  blood_group: BloodGroup;
  units: number;
  safety_floor: number;
  incoming_units: number;
  collection_date: string | null;
  expiry_date: string | null;
  stock_status: StockStatus;
}

export interface InventorySummary {
  total_records: number;
  total_units: number;
  low_stock_records: number;
  expired_records: number;
  no_expiry_records: number;
  last_calculated_at: string;
}

export interface InventoryMovement {
  id: number;
  stock_id: number;
  movement_type: string;
  units_delta: number;
  units_before: number;
  units_after: number;
  reason: string;
  reference: string;
  created_at: string;
}

export interface InventoryFilters {
  bank_id?: string;
  blood_group?: BloodGroup | "";
  status?: StockStatus | "";
  search?: string;
}

export interface InventoryMetadataUpdate {
  safety_floor?: number;
  collection_date?: string | null;
  expiry_date?: string | null;
}

export interface InventoryAdjustment {
  units_delta: number;
  reason: string;
  reference?: string;
}

async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      Accept: "application/json",
      ...(options.body
        ? { "Content-Type": "application/json" }
        : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    let message = `Request failed (${response.status})`;

    try {
      const errorBody = await response.json();
      const detail = errorBody?.detail;

      if (typeof detail === "string") {
        message = detail;
      } else if (Array.isArray(detail)) {
        message = detail
          .map((item: { msg?: string }) => item.msg ?? "Invalid input")
          .join(", ");
      }
    } catch {
      // Keep the HTTP error message if the response is not JSON.
    }

    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export const inventoryApi = {
  async getStocks(
    filters: InventoryFilters = {},
  ): Promise<InventoryStock[]> {
    const params = new URLSearchParams();

    if (filters.bank_id) {
      params.set("bank_id", filters.bank_id);
    }

    if (filters.blood_group) {
      params.set("blood_group", filters.blood_group);
    }

    if (filters.status) {
      params.set("status", filters.status);
    }

    if (filters.search?.trim()) {
      params.set("search", filters.search.trim());
    }

    const query = params.toString();

    return apiRequest<InventoryStock[]>(
      `/inventory-management/stocks${query ? `?${query}` : ""}`,
    );
  },

  getSummary(): Promise<InventorySummary> {
    return apiRequest<InventorySummary>(
      "/inventory-management/summary",
    );
  },

  updateStock(
    stockId: number,
    changes: InventoryMetadataUpdate,
  ): Promise<InventoryStock> {
    return apiRequest<InventoryStock>(
      `/inventory-management/stocks/${stockId}`,
      {
        method: "PATCH",
        body: JSON.stringify(changes),
      },
    );
  },

  adjustStock(
    stockId: number,
    adjustment: InventoryAdjustment,
  ): Promise<InventoryMovement> {
    return apiRequest<InventoryMovement>(
      `/inventory-management/stocks/${stockId}/adjustments`,
      {
        method: "POST",
        body: JSON.stringify(adjustment),
      },
    );
  },

  getMovements(
    stockId: number,
    limit = 50,
  ): Promise<InventoryMovement[]> {
    const params = new URLSearchParams({
      limit: String(limit),
    });

    return apiRequest<InventoryMovement[]>(
      `/inventory-management/stocks/${stockId}/movements?${params}`,
    );
  },
};
