export interface PaymentMethod {
  card?: {
    type: string;
    last4: string;
    expiry_year: number;
    expiry_month: number;
    cardholder_name: string;
  };
  type: string;
}

export interface Payment {
  amount: string;
  status: string;
  created_at: string;
  error_code?: string;
  captured_at?: string;
  method_details: PaymentMethod;
  payment_method_id: string;
  payment_attempt_id: string;
  stored_payment_method_id: string;
}

export interface PaymentHistoryItem {
  id: number;
  event_type: string;
  occurred_at?: string;
  created_at: string;
  txn_id?: string;
  origin?: string;
  status: string;
  currency_code: string;
  subscription_id: string;
  customer_id: string;
  collection_mode: string;
  billing_period: {
    ends_at: string;
    starts_at: string;
  };
  payments?: Payment[];
  billed_at?: string;
  invoice_id?: string;
  payout_totals?: {
    fee: string;
    tax: string;
    total: string;
    credit: string;
    balance: string;
    discount: string;
    earnings: string;
    subtotal: string;
    grand_total: string;
    currency_code: string;
  };
  list_items: Array<{
    price: {
      id: string;
      name: string;
      unit_price: {
        amount: string;
        currency_code: string;
      };
    };
    quantity: number;
  }>;
}

export interface PaymentHistoryResponse {
  success: boolean;
  payment_history: PaymentHistoryItem[];
  pagination: {
    page: number;
    page_size: number;
    total_entries: number;
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
  };
} 