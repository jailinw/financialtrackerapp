export interface UserProfile {
  id: string;
  email: string;
  stripeConnected: boolean;
  stripeAccountId: string | null;
  subscriptionStatus: string;
}

export interface Metrics {
  revenue: number;
  fees: number;
  expenses: number;
  netProfit: number;
  estimatedTaxesOwed: number;
  suggestedWeeklySavings: number;
  suggestedMonthlySavings: number;
}
