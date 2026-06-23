import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api';

const API_URL = '/finance';

// ===== BILLING HOOKS =====

export const useBillings = (page = 1, limit = 10, filters = {}) => {
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...filters,
  });

  return useQuery({
    queryKey: ['billings', page, filters],
    queryFn: async () => {
      return apiClient.get(`${API_URL}/billing?${queryParams}`);
    },
  });
};

export const useBillingDetail = (id) => {
  return useQuery({
    queryKey: ['billing', id],
    queryFn: async () => {
      return apiClient.get(`${API_URL}/${id}`);
    },
    enabled: !!id,
  });
};

export const useCreateBilling = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (billData) => {
      return apiClient.post(`${API_URL}/billing`, billData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billings'] });
    },
  });
};

export const useUpdateBilling = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }) => {
      return apiClient.put(`${API_URL}/billing/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billings'] });
    },
  });
};

// ===== INSURANCE HOOKS =====

export const useInsuranceClaims = (page = 1, limit = 10, filters = {}) => {
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...filters,
  });

  return useQuery({
    queryKey: ['insurance-claims', page, filters],
    queryFn: async () => {
      return apiClient.get(`${API_URL}/insurance?${queryParams}`);
    },
  });
};

export const useCreateInsuranceClaim = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (claimData) => {
      return apiClient.post(`${API_URL}/insurance`, claimData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insurance-claims'] });
    },
  });
};

// ===== ACCOUNTS RECEIVABLE HOOKS =====

export const useAccountsReceivable = (page = 1, limit = 10, filters = {}) => {
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...filters,
  });

  return useQuery({
    queryKey: ['accounts-receivable', page, filters],
    queryFn: async () => {
      return apiClient.get(`${API_URL}/accounts-receivable?${queryParams}`);
    },
  });
};

export const useCreateAR = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (arData) => {
      return apiClient.post(`${API_URL}/accounts-receivable`, arData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts-receivable'] });
    },
  });
};

// ===== ACCOUNTS PAYABLE HOOKS =====

export const useAccountsPayable = (page = 1, limit = 10, filters = {}) => {
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...filters,
  });

  return useQuery({
    queryKey: ['accounts-payable', page, filters],
    queryFn: async () => {
      return apiClient.get(`${API_URL}/accounts-payable?${queryParams}`);
    },
  });
};

export const useCreateAP = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (apData) => {
      return apiClient.post(`${API_URL}/accounts-payable`, apData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts-payable'] });
    },
  });
};

// ===== GENERAL LEDGER HOOKS =====

export const useGeneralLedger = (page = 1, limit = 10, filters = {}) => {
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...filters,
  });

  return useQuery({
    queryKey: ['general-ledger', page, filters],
    queryFn: async () => {
      return apiClient.get(`${API_URL}/general-ledger?${queryParams}`);
    },
  });
};

export const useCreateGLEntry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (glData) => {
      return apiClient.post(`${API_URL}/general-ledger`, glData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['general-ledger'] });
    },
  });
};

// ===== CASH OFFICE HOOKS =====

export const useCashOffice = (page = 1, limit = 10) => {
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  return useQuery({
    queryKey: ['cash-office', page],
    queryFn: async () => {
      return apiClient.get(`${API_URL}/cash-office?${queryParams}`);
    },
  });
};

export const useCreateCashOfficeRecord = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (cashData) => {
      return apiClient.post(`${API_URL}/cash-office`, cashData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cash-office'] });
    },
  });
};

// ===== ASSET MANAGEMENT HOOKS =====

export const useAssets = (page = 1, limit = 10, filters = {}) => {
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...filters,
  });

  return useQuery({
    queryKey: ['assets', page, filters],
    queryFn: async () => {
      return apiClient.get(`${API_URL}/assets?${queryParams}`);
    },
  });
};

export const useCreateAsset = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (assetData) => {
      return apiClient.post(`${API_URL}/assets`, assetData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
  });
};

// ===== BUDGET MANAGEMENT HOOKS =====

export const useBudgets = (page = 1, limit = 10, filters = {}) => {
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...filters,
  });

  return useQuery({
    queryKey: ['budgets', page, filters],
    queryFn: async () => {
      return apiClient.get(`${API_URL}/budgets?${queryParams}`);
    },
  });
};

export const useCreateBudget = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (budgetData) => {
      return apiClient.post(`${API_URL}/budgets`, budgetData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });
};

// ===== FINANCE SUMMARY HOOKS =====

export const useFinanceSummary = () => {
  return useQuery({
    queryKey: ['finance-summary'],
    queryFn: async () => {
      return apiClient.get(`${API_URL}/reports/summary`);
    },
  });
};

// ===== GENERIC FINANCE HOOKS =====

export const useFinanceRecords = (page = 1, limit = 10, filters = {}) => {
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...filters,
  });

  return useQuery({
    queryKey: ['finance-records', page, filters],
    queryFn: async () => {
      return apiClient.get(`${API_URL}?${queryParams}`);
    },
  });
};

export const useDeleteFinanceRecord = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      return apiClient.delete(`${API_URL}/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance-records'] });
    },
  });
};
