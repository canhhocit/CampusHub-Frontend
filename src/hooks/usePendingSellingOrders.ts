import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../api/axios';
import { useAuth } from '../contexts/AuthContext';

export interface PendingOrdersCountResponse {
  pendingCount: number;
}

export const usePendingSellingOrdersCount = () => {
  const { isAuthenticated } = useAuth();

  return useQuery<PendingOrdersCountResponse>({
    queryKey: ['selling-pending-count'],
    queryFn: () =>
      axiosInstance
        .get<PendingOrdersCountResponse>('/api/v1/orders/selling/pending-count')
        .then((res) => res.data),
    enabled: isAuthenticated,
    refetchInterval: 15000,
    staleTime: 10000,
  });
};
