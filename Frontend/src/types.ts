export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  date: string;
  category?: string;
  tags?: string[];
  note?: string;
  recurringType?: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  priority?: 'low' | 'medium' | 'high';
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string[];
  }[];
}

export interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
}