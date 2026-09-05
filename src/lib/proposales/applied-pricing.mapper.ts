import "server-only";

import type { AppliedPricing, ProposalReadback } from "@/lib/proposales";
import type { Money } from "@/lib/values/money";

function money(amountMinor: number, currency: ProposalReadback["currency"]): Money {
  return { amountMinor, currency };
}

export function toAppliedPricing(readback: ProposalReadback): AppliedPricing {
  const blocks = readback.blocks.map((block) => ({
    contentId: block.contentId,
    quantity: block.quantity,
    ...(block.optional === undefined ? {} : { optional: block.optional }),
    ...(block.blockCurrency === undefined ? {} : { blockCurrency: block.blockCurrency }),
    unitValueWithDiscountWithoutTax: money(block.unitValueWithDiscountWithoutTax, readback.currency),
    unitValueWithDiscountWithTax: money(block.unitValueWithDiscountWithTax, readback.currency),
    unitValueWithoutDiscountWithoutTax: money(block.unitValueWithoutDiscountWithoutTax, readback.currency),
    unitValueWithoutDiscountWithTax: money(block.unitValueWithoutDiscountWithTax, readback.currency),
    ...(block.packageSplit === undefined ? {} : { packageSplit: block.packageSplit.map((split) => ({
      type: split.type,
      ...(split.vat === undefined ? {} : { vat: split.vat }),
      ...(split.valueWithoutTax === undefined ? {} : { valueWithoutTax: money(split.valueWithoutTax, readback.currency) }),
      ...(split.valueWithTax === undefined ? {} : { valueWithTax: money(split.valueWithTax, readback.currency) }),
    })) }),
  }));

  return {
    available: true,
    totalWithoutTax: money(readback.totalWithoutTax, readback.currency),
    totalWithTax: money(readback.totalWithTax, readback.currency),
    currency: readback.currency,
    taxOptions: {
      ...(readback.taxOptions.taxMode === undefined ? {} : { mode: readback.taxOptions.taxMode }),
      ...(readback.taxOptions.taxIncluded === undefined ? {} : { taxIncluded: readback.taxOptions.taxIncluded }),
      ...(readback.taxOptions.taxLabelKey === undefined ? {} : { taxLabelKey: readback.taxOptions.taxLabelKey }),
    },
    blocks,
    warnings: readback.blocks
      .filter((block) => block.blockCurrency !== undefined && block.blockCurrency !== readback.currency)
      .map((block) => ({ kind: "block_currency_differs" as const, contentId: block.contentId })),
  };
}
