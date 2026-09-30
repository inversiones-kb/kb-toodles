import { RegisterBalance } from "@/validations/registerBalance.validations";

// 3.000 COP grace interval — small rounding differences between the
// cashier's count and ADN's system total don't count as a real mismatch.
export const RECONCILIATION_GRACE_COP = 3000;

/**
 * Cash-counted total vs. what ADN's system reported for the same shift.
 * Only meaningful once `status === "CHECKED"` (the system side isn't
 * populated before that) — callers should check status themselves.
 */
export function computeRegisterBalanceDiff(balance: RegisterBalance) {
  const usd1 = balance.money.usd.cash1 * balance.money.usd.rate1;
  const usd2 = balance.money.usd.cash2 * balance.money.usd.rate2;
  const usd3 = balance.money.usd.cash3 * balance.money.usd.rate3;

  const totalCop =
    balance.money.cop.cash + usd1 + usd2 + usd3 + balance.total_expenses;
  // Cashiers sometimes ring COP cash under "EFECTIVO BOLIVARES"; the admin
  // sets a per-doc COP-per-Bs rate to fold that amount back into the COP side.
  const misfiledCop =
    (balance.money.bs.cash_system ?? 0) * (balance.money.bs.cash_cop_rate ?? 0);
  const diff = totalCop - (balance.money.cop.system + misfiledCop);

  return {
    totalCop,
    diff,
    isBalanced: Math.abs(diff) <= RECONCILIATION_GRACE_COP,
  };
}
