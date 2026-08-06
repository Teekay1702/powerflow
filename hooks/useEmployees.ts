import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, type ApiResponse } from '@/services/api';
import { toast } from '@/hooks/use-toast';

export interface Employee {
  id: string;
  email: string;
  name: string;
  surname: string;
  roleName: string;
  status: string;
  position: string | null;
  branchId: string | null;
  createdAt: string;
}

interface EmployeesResponse {
  data: Employee[];
  meta: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export function useEmployees(search = '', page = 1, pageSize = 20) {
  return useQuery<EmployeesResponse>({
    queryKey: ['employees', search, page, pageSize],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      params.set('page', String(page));
      params.set('pageSize', String(pageSize));
      const response = await api.get<EmployeesResponse>(`/users?${params.toString()}`);
      return response;
    },
    staleTime: 30 * 1000,
  });
}

export function useResendVerification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (email: string) => {
      const response = await api.post('/auth/resend-verification', { email });
      return response;
    },
    onSuccess: () => {
      toast({
        title: 'Verification email sent',
        description: 'The employee will receive a new activation link.',
      });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to resend',
        description: error?.response?.data?.error?.message || 'Please try again.',
        variant: 'destructive',
      });
    },
  });
}

interface CreateEmployeeResponse {
  id: string;
  email: string;
  name: string;
  status: string;
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<CreateEmployeeResponse>, Error, {
    email: string;
    name: string;
    surname: string;
    phone?: string;
    position?: string;
    role: 'MANAGER' | 'EMPLOYEE';
    branchId?: string;
  }>({
    mutationFn: async (data) => {
      const response = await api.post<ApiResponse<CreateEmployeeResponse>>('/auth/register-employee', data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
}
