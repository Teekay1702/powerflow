import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';

interface DashboardStats {
  totalQuotations: number;
  totalCustomers: number;
  pendingApprovals: number;
  totalEmployees: number;
  totalManagers: number;
}

export function useDashboardStats() {
  return useQuery<DashboardStats>({
    queryKey: ['dashboard', 'stats'],
    queryFn: async () => {
      const response = await api.get<{ data: DashboardStats }>('/users/stats');
      return response.data;
    },
    staleTime: 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
}