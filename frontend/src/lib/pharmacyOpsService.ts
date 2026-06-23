import apiClient, { ApiResponse } from "@/lib/api";

export interface InventoryItemLite {
  _id: string;
  itemId: string;
  name: string;
  currentStock: number;
  unitCost: number;
  reorderPoint: number;
}

export interface OtcSaleItemInput {
  inventoryId: string;
  quantity: number;
  unitPrice: number;
}

export interface OtcSale {
  _id: string;
  saleNumber: string;
  saleDate: string;
  customerName?: string;
  customerPhone?: string;
  paymentMethod: string;
  subtotal: number;
  discount: number;
  tax: number;
  totalAmount: number;
  notes?: string;
  items: Array<{
    inventoryId: string;
    itemCode: string;
    itemName: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }>;
}

export interface StockMovement {
  id: string;
  inventory_id: string;
  movement_type: "RECEIVE" | "ADJUSTMENT" | "ISSUE";
  quantity: number;
  unit_cost?: number;
  reason?: string;
  balance_before: number;
  balance_after: number;
  created_at: string;
  item_name: string;
  item_code: string;
}

const unwrap = <T,>(response: ApiResponse<T> & T): T =>
  response && typeof response === "object" && "data" in response && response.data !== undefined
    ? (response.data as T)
    : (response as T);

export async function fetchInventoryLite(): Promise<InventoryItemLite[]> {
  const resp = await apiClient.get<ApiResponse<InventoryItemLite[]>>("/inventory?limit=200");
  return unwrap(resp);
}

export async function fetchOtcSales(): Promise<OtcSale[]> {
  const resp = await apiClient.get<ApiResponse<OtcSale[]>>("/pharmacy-ops/otc-sales");
  return unwrap(resp);
}

export async function createOtcSale(payload: {
  customerName?: string;
  customerPhone?: string;
  paymentMethod: string;
  discount?: number;
  tax?: number;
  notes?: string;
  items: OtcSaleItemInput[];
}) {
  const resp = await apiClient.post<ApiResponse<{ _id: string; saleNumber: string }>>("/pharmacy-ops/otc-sales", payload);
  return unwrap(resp);
}

export async function fetchStockMovements(inventoryId?: string): Promise<StockMovement[]> {
  const qs = inventoryId ? `?inventoryId=${encodeURIComponent(inventoryId)}` : "";
  const resp = await apiClient.get<ApiResponse<StockMovement[]>>(`/pharmacy-ops/stock/movements${qs}`);
  return unwrap(resp);
}

export async function createStockMovement(payload: {
  inventoryId: string;
  movementType: "RECEIVE" | "ADJUSTMENT" | "ISSUE";
  quantity: number;
  unitCost?: number;
  direction?: "INCREASE" | "DECREASE";
  reason?: string;
}) {
  const resp = await apiClient.post<ApiResponse<StockMovement>>("/pharmacy-ops/stock/movements", payload);
  return unwrap(resp);
}

export async function fetchStockSummary(): Promise<{ totalItems: number; lowStockItems: number; outOfStockItems: number }> {
  const resp = await apiClient.get<ApiResponse<{ totalItems: number; lowStockItems: number; outOfStockItems: number }>>("/pharmacy-ops/stock/summary");
  return unwrap(resp);
}
