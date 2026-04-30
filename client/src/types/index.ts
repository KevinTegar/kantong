export type AlertLevel = 'WATCH' | 'WARNING' | 'DANGER';
export type TransactionType = 'income' | 'expense';

export interface Category {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  color: string;
  spending_cap: number;
  is_active: boolean;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  category_id: string | null;
  amount: number;
  type: TransactionType;
  description: string | null;
  date: string;
  created_at: string;
  category?: Category;
}

export interface Alert {
  id: string;
  user_id: string;
  category_id: string;
  month: number;
  year: number;
  level: AlertLevel;
  projected_amount: number;
  is_read: boolean;
  created_at: string;
  category?: Category;
}

export interface BurnRateResult {
  category_id: string;
  category_name: string;
  spending_cap: number;
  spent_so_far: number;
  weekly_average: number;
  projected_total: number;
  remaining_budget: number;
  weeksElapsed: number;
  weeksRemaining: number;
  alert_level: AlertLevel | null;
  percentage_used: number;
  percentage_projected: number;
}

export interface TransactionFormData {
  category_id?: string | null;
  amount: number;
  type: TransactionType;
  description?: string | null;
  date: string;
}

export interface CategoryFormData {
  name: string;
  icon: string;
  color: string;
  spending_cap: number;
}

export interface AvailableMonth {
  year: number;
  month: number;
  transaction_count: number;
}
