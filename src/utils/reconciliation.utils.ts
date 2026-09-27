import { RegisterBalance } from "@/validations/registerBalance.validations";

// 100 COP grace interval — small rounding differences between the
// cashier's count and ADN's system total don't count as a real mismatch.
export const RECONCILIATION_GRACE_COP = 100;

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
  const diff = totalCop - balance.money.cop.system;

  return {
    totalCop,
    diff,
    isBalanced: Math.abs(diff) <= RECONCILIATION_GRACE_COP,
  };
}
