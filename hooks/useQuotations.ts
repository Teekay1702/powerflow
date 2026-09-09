import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, type ApiResponse } from '@/services/api';
import { toast } from '@/hooks/use-toast';
import type { Quotation } from '@/types';

interface QuotationsResponse {
  data: any[];
  meta: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export function useQuotations(status?: string, page = 1, pageSize = 20) {
  return useQuery<QuotationsResponse>({
    queryKey: ['quotations', status, page],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (status) params.set('status', status);
      params.set('page', String(page));
      params.set('pageSize', String(pageSize));
      const response = await api.get<QuotationsResponse>(`/quotations?${params.toString()}`);
      return response;
    },
    staleTime: 30 * 1000,
  });
}

export function useQuotationDetail(id: string) {
  return useQuery<Quotation>({
    queryKey: ['quotation', id],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Quotation>>(`/quotations/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useCreateQuotation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      customerId: string;
      electricalLoadId?: string;
      items: Array<{
        itemType: string;
        description: string;
        quantity: number;
        unitPrice: number;
        metadata?: Record<string, unknown>;
      }>;
      labourCost?: number;
      installationCost?: number;
      discountPercentage?: number;
      notes?: string;
    }) => {
      const response = await api.post('/quotations', data);
      return response;
    },
    onSuccess: () => {
      toast({ title: 'Quotation created successfully' });
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to create quotation',
        description: error?.response?.data?.error?.message || 'Please try again.',
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateQuotationStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await api.patch(`/quotations/${id}/status`, { status });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
    },
  });
}

export function useEmailQuotation() {
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.post(`/quotations/${id}/email`);
      return response;
    },
    onSuccess: () => {
      toast({ title: 'Quotation emailed successfully' });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to send email',
        description: error?.response?.data?.error?.message || 'Please try again.',
        variant: 'destructive',
      });
    },
  });
}