import "server-only";

import type { KnownOrAbsent } from "@/lib/values/absence";
import { currencyCodeSchema } from "@/lib/values/money";
import { createProposalesClient, getProposalesClient } from "@/lib/proposales/client";
import { createFakeProposalesClient } from "@/lib/proposales/fake";

export type ContentItem = {
  variationId: string;
  productId: string;
  title: Record<string, string>;
  description: Record<string, string>;
  createdAt: string;
  images?: string[];
};

export type CompanyInfo = {
  companyId: number;
  currency: import("zod").infer<typeof currencyCodeSchema>;
  taxMode: string;
};

export type CreateProposalDraftInput = {
  language: string;
  titleMd?: string;
  descriptionMd?: string;
  recipient: KnownOrAbsent<{
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    companyName?: string;
  }>;
  blocks: Array<{
    contentId: string;
    quantity: KnownOrAbsent<number>;
    optional: KnownOrAbsent<boolean>;
  }>;
  generationId: string;
};

export type CreatedDraft = { proposalUuid: string; url: string };
export type RecoveredProposalSummary = { proposalUuid: string; seriesUuid?: string; status?: string; url: string; generationId: string };

export type ProposalPackageSplit = {
  type: string;
  vat?: number;
  valueWithoutTax?: number;
  valueWithTax?: number;
};

export type ProposalReadback = {
  proposalUuid: string;
  seriesUuid?: string;
  status?: string;
  currency: import("zod").infer<typeof currencyCodeSchema>;
  totalWithoutTax: number;
  totalWithTax: number;
  taxOptions: { mode?: string; taxIncluded?: boolean; taxLabelKey?: string };
  blocks: Array<{
    contentId: string;
    quantity: number;
    optional?: boolean;
    blockCurrency?: import("zod").infer<typeof currencyCodeSchema>;
    unitValueWithDiscountWithoutTax: number;
    unitValueWithDiscountWithTax: number;
    unitValueWithoutDiscountWithoutTax: number;
    unitValueWithoutDiscountWithTax: number;
    packageSplit?: ProposalPackageSplit[];
  }>;
};

export type AppliedPricing = {
  available: true;
  totalWithoutTax: import("@/lib/values/money").Money;
  totalWithTax: import("@/lib/values/money").Money;
  currency: import("zod").infer<typeof currencyCodeSchema>;
  taxOptions: { mode?: string; taxIncluded?: boolean; taxLabelKey?: string };
  blocks: Array<{
    contentId: string;
    quantity: number;
    optional?: boolean;
    blockCurrency?: string;
    unitValueWithDiscountWithoutTax: import("@/lib/values/money").Money;
    unitValueWithDiscountWithTax: import("@/lib/values/money").Money;
    unitValueWithoutDiscountWithoutTax: import("@/lib/values/money").Money;
    unitValueWithoutDiscountWithTax: import("@/lib/values/money").Money;
    packageSplit?: Array<{ type: string; vat?: number; valueWithoutTax?: import("@/lib/values/money").Money; valueWithTax?: import("@/lib/values/money").Money }>;
  }>;
  warnings: Array<{ kind: "block_currency_differs"; contentId: string }>;
};

export interface ProposalesClient {
  getCompany(): Promise<CompanyInfo>;
  listContent(): Promise<ContentItem[]>;
  getContent(variationId: string): Promise<ContentItem | null>;
  createProposalDraft(input: CreateProposalDraftInput): Promise<CreatedDraft>;
  findProposalsByGenerationId(generationId: string): Promise<RecoveredProposalSummary[]>;
  getProposal(uuid: string): Promise<ProposalReadback>;
}

export { createProposalesClient, createFakeProposalesClient, getProposalesClient };
export type { ProposalesHttp } from "@/lib/proposales/http";
