import "server-only";

import { formatIsoTimestamp } from "@/lib/values/timestamp";
import type { CompanyListResponse, ContentItemResponse } from "@/lib/proposales/schemas";
import type { CompanyInfo, ContentItem } from "@/lib/proposales/index";

export function toContentItem(wire: ContentItemResponse): ContentItem {
  // Evidence §6 establishes that these vendor Unix timestamps are millisecond-scale.
  const createdAt = formatIsoTimestamp(new Date(wire.created_at));

  return {
    variationId: String(wire.variation_id),
    productId: String(wire.product_id),
    title: wire.title,
    description: wire.description === undefined ? {} : wire.description,
    createdAt,
    ...(wire.images === undefined ? {} : { images: wire.images }),
  };
}

export function toCompanyInfo(wire: CompanyListResponse["data"][number]): CompanyInfo {
  return {
    companyId: wire.id,
    currency: wire.currency,
    taxMode: wire.tax_mode,
  };
}
