import { useQuery } from '@tanstack/react-query';
import Cookies from 'js-cookie';
import { getApiUrl } from '../lib/config';
import type {
  PaymentMethod,
  Payment,
  PaymentHistoryItem,
  PaymentHistoryResponse
} from '@/types/paymentHistory';

interface UsePaymentHistoryOptions {
  userId: string;
  page: number;
  pageSize: number;
}

export function usePaymentHistory({ userId, page, pageSize }: UsePaymentHistoryOptions) {
  return useQuery<PaymentHistoryResponse, Error>({
    queryKey: ['paymentHistory', userId, page, pageSize],
    queryFn: async () => {
      const accessToken = Cookies.get('access_token');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }

      const response = await fetch(getApiUrl('subscription/get-payment-history'), {
        method: 'POST',
        headers,
        // Backend now derives user_id from the access token; only send pagination
        body: JSON.stringify({ page, page_size: pageSize }),
      });
      if (!response.ok) {
        throw new Error('Failed to fetch payment history');
      }
      return response.json();
    },
    enabled: !!userId,
    placeholderData: undefined,
  });
} 