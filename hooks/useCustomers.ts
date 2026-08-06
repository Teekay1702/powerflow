import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { toast } from '@/hooks/use-toast';
import type { Customer } from '@/types';

interface CustomersResponse {
  data: Customer[];
  meta: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export function useCustomers(search = '', page = 1, pageSize = 20) {
  return useQuery<CustomersResponse>({
    queryKey: ['customers', search, page, pageSize],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      params.set('page', String(page));
      params.set('pageSize', String(pageSize));
      const response = await api.get<CustomersResponse>(`/customers?${params.toString()}`);
      return response;
    },
    staleTime: 30 * 1000,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      type: 'RESIDENTIAL' | 'COMMERCIAL' | 'INDUSTRIAL';
      name: string;
      companyName?: string;
      contactPerson?: string;
      phone: string;
      email?: string;
      propertyType: string;
      gpsCoordinates?: string;
      notes?: string;
      addresses?: Array<{
        street: string;
        city: string;
        province: string;
        postalCode?: string;
        country?: string;
        isPrimary?: boolean;
      }>;
    }) => {
      const response = await api.post('/customers', data);
      return response;
    },
    onSuccess: () => {
      toast({
        title: 'Customer created',
        description: 'The customer has been registered successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to create customer',
        description: error?.response?.data?.error?.message || 'Please try again.',
        variant: 'destructive',
      });
    },
  });
}