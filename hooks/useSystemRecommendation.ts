import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import type { SystemRecommendation } from '@/types';

export interface SystemRecommendationResponse {
  success: boolean;
  data: SystemRecommendation;
}

export function useSystemRecommendation(id: string | null | undefined) {
  return useQuery<SystemRecommendationResponse>({
    queryKey: ['system-recommendation', id],
    queryFn: async () => {
      const response = await api.get<SystemRecommendationResponse>(`/calculations/${id}/recommendation`);
      return response;
    },
    enabled: !!id,
    staleTime: 30 * 1000,
  });
}
