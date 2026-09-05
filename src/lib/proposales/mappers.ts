import "server-only";

import { formatIsoTimestamp } from "@/lib/values/timestamp";
import type { CompanyListResponse, ContentItemResponse, CreateProposalRequest, ProposalMutationResponse, ProposalReadbackResponse, ProposalSearchResponse } from "@/lib/proposales/schemas";
import type { CompanyInfo, ContentItem, CreateProposalDraftInput, CreatedDraft, ProposalReadback, RecoveredProposalSummary } from "@/lib/proposales/index";

export const PROPOSAL_METADATA_KEYS = {
  source: "proposal_copilot_source",
  generationId: "proposal_copilot_generation_id",
  createdAt: "proposal_copilot_created_at",
} as const;
export const PROPOSAL_COPILOT_SOURCE_MARKER = "proposal-copilot";

function quantityField(field: CreateProposalDraftInput["blocks"][number]["quantity"]): { quantity: number } | Record<string, never> {
  return field.known ? { quantity: field.value } : {};
}

function optionalField(field: CreateProposalDraftInput["blocks"][number]["optional"]): { optional: boolean } | Record<string, never> {
  return field.known ? { optional: field.value } : {};
}

function recipientField(input: CreateProposalDraftInput["recipient"]): { recipient: Record<string, string> } | Record<string, never> {
  if (!input.known) return {};
  const recipient = {
    ...(input.value.firstName === undefined ? {} : { first_name: input.value.firstName }),
    ...(input.value.lastName === undefined ? {} : { last_name: input.value.lastName }),
    ...(input.value.email === undefined ? {} : { email: input.value.email }),
    ...(input.value.phone === undefined ? {} : { phone: input.value.phone }),
    ...(input.value.companyName === undefined ? {} : { company_name: input.value.companyName }),
  };
  return Object.keys(recipient).length === 0 ? {} : { recipient };
}

function blockField(block: CreateProposalDraftInput["blocks"][number]) {
  // content_id is an int64 on the wire; this is a type conversion, not arithmetic.
  return {
    content_id: Number(block.contentId),
    type: "product-block" as const,
    ...quantityField(block.quantity),
    ...optionalField(block.optional),
  };
}

export function toCreateProposalRequest(input: CreateProposalDraftInput, ctx: { companyId: number; now: () => number }): CreateProposalRequest {
  return {
    company_id: ctx.companyId,
    language: input.language,
    ...recipientField(input.recipient),
    ...(input.titleMd === undefined ? {} : { title_md: input.titleMd }),
    ...(input.descriptionMd === undefined ? {} : { description_md: input.descriptionMd }),
    blocks: input.blocks.map(blockField),
    data: {
      [PROPOSAL_METADATA_KEYS.source]: PROPOSAL_COPILOT_SOURCE_MARKER,
      [PROPOSAL_METADATA_KEYS.generationId]: input.generationId,
      [PROPOSAL_METADATA_KEYS.createdAt]: formatIsoTimestamp(new Date(ctx.now())),
    },
  };
}

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

export function toCreatedDraft(wire: ProposalMutationResponse): CreatedDraft {
  return { proposalUuid: wire.proposal.uuid, url: wire.proposal.url };
}

function mappedStatus(status: string | null | undefined): string | undefined {
  return status === undefined || status === null ? undefined : ["accepted", "replaced", "active", "draft", "expired", "rejected", "template", "withdrawn"].includes(status) ? status : "unknown";
}

export function toRecoveredSummary(wire: ProposalSearchResponse["data"][number], generationId: string): RecoveredProposalSummary {
  const status = mappedStatus(wire.status);
  return {
    proposalUuid: wire.uuid,
    url: wire.url,
    generationId,
    ...(wire.series_uuid === undefined || wire.series_uuid === null ? {} : { seriesUuid: wire.series_uuid }),
    ...(status === undefined ? {} : { status }),
  };
}

export function toProposalReadback(wire: ProposalReadbackResponse["data"]): ProposalReadback {
  const status = mappedStatus(wire.status);
  return {
    proposalUuid: wire.uuid,
    currency: wire.currency,
    totalWithoutTax: wire.value_without_tax,
    totalWithTax: wire.value_with_tax,
    taxOptions: wire.tax_options === undefined || wire.tax_options === null ? {} : {
      ...(wire.tax_options.tax_mode === undefined || wire.tax_options.tax_mode === null ? {} : { taxMode: wire.tax_options.tax_mode }),
      ...(wire.tax_options.tax_included === undefined || wire.tax_options.tax_included === null ? {} : { taxIncluded: wire.tax_options.tax_included }),
      ...(wire.tax_options.tax_label_key === undefined || wire.tax_options.tax_label_key === null ? {} : { taxLabelKey: wire.tax_options.tax_label_key }),
    },
    blocks: wire.blocks.map((block) => ({
      contentId: String(block.content_id),
      quantity: block.quantity,
      ...(block.optional === undefined || block.optional === null ? {} : { optional: block.optional }),
      ...(block.currency === undefined || block.currency === null ? {} : { blockCurrency: block.currency }),
      unitValueWithDiscountWithoutTax: block.unit_value_with_discount_without_tax,
      unitValueWithDiscountWithTax: block.unit_value_with_discount_with_tax,
      unitValueWithoutDiscountWithoutTax: block.unit_value_without_discount_without_tax,
      unitValueWithoutDiscountWithTax: block.unit_value_without_discount_with_tax,
      ...(block.package_split === undefined || block.package_split === null ? {} : { packageSplit: block.package_split.map((split) => ({
        type: split.type,
        ...(split.vat === undefined || split.vat === null ? {} : { vat: split.vat }),
        ...(split.value_without_tax === undefined || split.value_without_tax === null ? {} : { valueWithoutTax: split.value_without_tax }),
        ...(split.value_with_tax === undefined || split.value_with_tax === null ? {} : { valueWithTax: split.value_with_tax }),
      })) }),
    })),
    ...(wire.series_uuid === undefined || wire.series_uuid === null ? {} : { seriesUuid: wire.series_uuid }),
    ...(status === undefined ? {} : { status }),
  };
}
