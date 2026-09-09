import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import type { ApplianceCatalogueItem } from '@/types';

interface ApplianceResponse {
  success: boolean;
  data: ApplianceCatalogueItem[];
  meta?: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
}

export function useAppliances(search = '') {
  return useQuery<ApplianceResponse>({
    queryKey: ['appliances', search],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('pageSize', '200');
      if (search) params.set('search', search);
      const response = await api.get<ApplianceResponse>(`/appliances?${params.toString()}`);
      return response;
    },
    staleTime: 60 * 1000,
  });
}
