import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createOtcSale,
  createStockMovement,
  fetchInventoryLite,
  fetchOtcSales,
  fetchStockMovements,
  fetchStockSummary,
} from "@/lib/pharmacyOpsService";

const keys = {
  inventory: ["inventory-lite"] as const,
  otcSales: ["otc-sales"] as const,
  stockMoves: ["stock-movements"] as const,
  stockSummary: ["stock-summary"] as const,
};

export function useInventoryLite() {
  return useQuery({ queryKey: keys.inventory, queryFn: fetchInventoryLite, refetchInterval: 10000 });
}

export function useOtcSales() {
  return useQuery({ queryKey: keys.otcSales, queryFn: fetchOtcSales, refetchInterval: 10000 });
}

export function useStockMovements(inventoryId?: string) {
  return useQuery({
    queryKey: [...keys.stockMoves, inventoryId ?? "all"],
    queryFn: () => fetchStockMovements(inventoryId),
    refetchInterval: 10000,
  });
}

export function useStockSummary() {
  return useQuery({ queryKey: keys.stockSummary, queryFn: fetchStockSummary, refetchInterval: 10000 });
}

export function useCreateOtcSale() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createOtcSale,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.otcSales });
      qc.invalidateQueries({ queryKey: keys.inventory });
      qc.invalidateQueries({ queryKey: keys.stockMoves });
      qc.invalidateQueries({ queryKey: keys.stockSummary });
    },
  });
}

export function useCreateStockMovement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createStockMovement,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.inventory });
      qc.invalidateQueries({ queryKey: keys.stockMoves });
      qc.invalidateQueries({ queryKey: keys.stockSummary });
    },
  });
}
