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
      const response = await fetch(getApiUrl('subscription/get-payment-history'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId, page, page_size: pageSize }),
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