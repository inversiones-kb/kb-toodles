type Currency = "COP" | "USD" | "BS";

export interface RegisterExpense {
  id: number;
  amount: number;
  currency: Currency;
  reason: string;
}

export const REGISTER_BALANCE_STATUSES = [
  "OPEN",
  "PENDING",
  "CHECKED",
] as const;
export type RegisterBalanceStatus = (typeof REGISTER_BALANCE_STATUSES)[number];
export const REGISTER_BALANCE_STATUS_MAP: Record<
  RegisterBalanceStatus,
  { title: string }
> = {
  OPEN: { title: "Abierto" },
  PENDING: { title: "Pendiente" },
  CHECKED: { title: "Revisado" },
};
export const REGISTER_BALANCE_STATUS_OPTIONS = REGISTER_BALANCE_STATUSES.map(
  (key) => ({
    key, // Lo usaremos para el 'key' y 'value' del SelectItem
    ...REGISTER_BALANCE_STATUS_MAP[key], // Extraemos el title (y futuros iconos)
  }),
);

export interface NewRegisterBalance {
  status: RegisterBalanceStatus;
  employee_id: string; // relation to cashier employee ID
  checkout_number: number;
  is_fiscal: boolean;
  fiscal_money?: number; // Value in USD to use to calc the IVA value
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

export interface RegisterBalanceEmployee {
  id: string;
  name: string;
}

export interface RegisterBalance extends NewRegisterBalance {
  id: string;
  employee: RegisterBalanceEmployee;
}
