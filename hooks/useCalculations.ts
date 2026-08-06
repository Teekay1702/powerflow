import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { toast } from '@/hooks/use-toast';

export interface LoadProfile {
  id: string;
  name: string;
  customerId: string;
  propertyType: string;
  totalConnectedLoad: number;
  peakLoad: number;
  averageLoad: number;
  dailyConsumption: number;
  monthlyConsumption: number;
  annualConsumption: number;
  surgeRequirements: number;
  demandFactor: number;
  coincidenceFactor: number;
  loadDiversity: number;
  continuousLoad: number;
  criticalLoad: number;
  status: string;
  createdAt: string;
}

interface CalculationsResponse {
  data: LoadProfile[];
  meta: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export function useCalculations(page = 1, pageSize = 20) {
  return useQuery<CalculationsResponse>({
    queryKey: ['calculations', page, pageSize],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('pageSize', String(pageSize));
      const response = await api.get<CalculationsResponse>(`/calculations?${params.toString()}`);
      return response;
    },
    staleTime: 30 * 1000,
  });
}

export function useCreateCalculation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      customerId: string;
      name: string;
      propertyType: string;
      appliances: Array<{
        applianceName: string;
        quantity: number;
        powerRating: number;
        startingSurge?: number;
        dailyHours: number;
        peakHours?: number;
        isEssential: boolean;
      }>;
    }) => {
      const response = await api.post('/calculations', data);
      return response;
    },
    onSuccess: () => {
      toast({
        title: 'Calculation saved',
        description: 'The load profile has been created.',
      });
      queryClient.invalidateQueries({ queryKey: ['calculations'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Calculation failed',
        description: error?.response?.data?.error?.message || 'Please try again.',
        variant: 'destructive',
      });
    },
  });
}

export function useCalculateBattery() {
  return useMutation({
    mutationFn: async ({
      id,
      chemistry,
      backupHours,
    }: {
      id: string;
      chemistry?: string;
      backupHours?: number;
    }) => {
      const response = await api.post(`/calculations/${id}/battery`, {
        chemistry,
        backupHours,
      });
      return response;
    },
  });
}

export function useCalculateSolar() {
  return useMutation({
    mutationFn: async ({ id, panelId }: { id: string; panelId?: string }) => {
      const response = await api.post(`/calculations/${id}/solar`, { panelId });
      return response;
    },
  });
}

export function useCalculateInverter() {
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.post(`/calculations/${id}/inverter`);
      return response;
    },
  });
}