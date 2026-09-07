import type { Money } from "@/lib/values/money";

export function toMoneyDisplay(money: Money, locale?: string): string {
  const formatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: money.currency,
  });
  const exponent = formatter.resolvedOptions().maximumFractionDigits;
  if (exponent === undefined) throw new Error("Currency fraction digits are unavailable.");
  const majorAmount = money.amountMinor / 10 ** exponent;
  return formatter.format(majorAmount);
}
