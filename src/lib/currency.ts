/** Default ISO-like code stored on expenses. */
export const DEFAULT_CURRENCY = "PEN" as const;

export const CURRENCY_OTHER_VALUE = "__other__" as const;

export type CurrencyPresetCode = "PEN" | "USD" | "AUD" | "EUR" | "GBP";

export const CURRENCY_PRESETS: ReadonlyArray<{
  code: CurrencyPresetCode;
  label: string;
  symbol: string;
}> = [
  { code: "PEN", label: "S/. (Soles)", symbol: "S/." },
  { code: "USD", label: "USD $ (Dólares americanos)", symbol: "USD $" },
  { code: "AUD", label: "AUD $ (Dólares australianos)", symbol: "AUD $" },
  { code: "EUR", label: "EUR (Euros)", symbol: "EUR" },
  { code: "GBP", label: "GBP (Libra esterlina)", symbol: "GBP" },
];

const PRESET_CODES = new Set<string>(
  CURRENCY_PRESETS.map((p) => p.code)
);

export function isCurrencyPresetCode(code: string): code is CurrencyPresetCode {
  return PRESET_CODES.has(code);
}

/** Display symbol / short label for a stored currency code. */
export function currencyDisplay(code: string): string {
  const preset = CURRENCY_PRESETS.find((p) => p.code === code);
  if (preset) return preset.symbol;
  const trimmed = code.trim();
  return trimmed || DEFAULT_CURRENCY;
}

export function formatMoney(
  amount: number,
  currency: string = DEFAULT_CURRENCY
): string {
  return `${currencyDisplay(currency)} ${amount.toFixed(2)}`;
}

export function normalizeCurrencyCode(raw: string | null | undefined): string {
  const t = (raw ?? "").trim();
  if (!t) return DEFAULT_CURRENCY;
  return t.slice(0, 12);
}
