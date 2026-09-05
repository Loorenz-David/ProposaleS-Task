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
export type RecoveredProposalSummary = { proposalUuid: string; seriesUuid?: string; status: string; url: string; generationId: string };
export type ProposalReadback = { seriesUuid?: string; status: string; [key: string]: unknown };

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
