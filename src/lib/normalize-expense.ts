import { DEFAULT_CURRENCY, normalizeCurrencyCode } from "./currency";
import type { Expense } from "./types";

/** Ensures taxAmount / currency exist (legacy rows or inbound sync). */
export function normalizeExpenseFields<T extends Partial<Expense>>(
  expense: T
): T & Pick<Expense, "taxAmount" | "currency"> {
  return {
    ...expense,
    taxAmount:
      typeof expense.taxAmount === "number" && Number.isFinite(expense.taxAmount)
        ? Math.max(0, expense.taxAmount)
        : 0,
    currency: normalizeCurrencyCode(expense.currency ?? DEFAULT_CURRENCY),
  };
}
