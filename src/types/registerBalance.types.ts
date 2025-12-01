type Currency = "COP" | "USD" | "BS";

interface RegisterExpense {
  amount: number;
  currency: Currency;
  reason?: string;
}

interface RegisterBalance {
  id: string;
  cashier_id: string; // relation to cashier employee ID
  checkout_number: number;
  is_fiscal: false;
  fiscal_money: 0; // Value in USD to use to calc the IVA value
  money: {
    cop: {
      cash: number;
      system: number;
    };
    usd: {
      cash: number;
      system: number;
    };
    bs?: {
      cash: number;
      system: number;
      batch_number: number;
    };
  };
  expenses: RegisterExpense[];
}
