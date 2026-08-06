import { useQuery } from '@tanstack/react-query';
import { api, ApiResponse } from '@/services/api';

interface ProductResponse {
  data: any[];
  meta?: {
    totalCount: number;
    totalPages: number;
  };
}

export function useProducts(type: 'panels' | 'batteries' | 'inverters' | 'accessories', search = '', page = 1, pageSize = 20) {
  return useQuery<ProductResponse>({
    queryKey: ['products', type, search, page],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      params.set('page', String(page));
      params.set('pageSize', String(pageSize));
      const response = await api.get<ProductResponse>(`/products/${type}?${params.toString()}`);
      return response;
    },
    staleTime: 60 * 1000,
  });
}

export function useProductDetail(type: string, id: string) {
  return useQuery<ApiResponse<any>>({
    queryKey: ['product', type, id],
    queryFn: async () => {
      const response = await api.get<ApiResponse<any>>(`/products/${type}/${id}`);
      return response;
    },
    enabled: !!id,
  });
}