import "server-only";

import { ValidationError } from "@/lib/errors/app-error";
import { serverEnv } from "@/lib/env/server";
import type { CompanyInfo, ContentItem, ProposalesClient } from "@/lib/proposales/index";
import { ProposalesError } from "@/lib/proposales/errors";
import { createProposalesHttp, type ProposalesHttp } from "@/lib/proposales/http";
import { toCompanyInfo, toContentItem, toCreateProposalRequest, toCreatedDraft, toProposalReadback, toRecoveredSummary, PROPOSAL_METADATA_KEYS } from "@/lib/proposales/mappers";
import { companyListResponseSchema, contentListResponseSchema, createProposalRequestSchema, proposalMutationResponseSchema, proposalReadbackSchema, proposalSearchResponseSchema, variationIdSchema } from "@/lib/proposales/schemas";

type ClientOptions = { http: ProposalesHttp; companyId: number; now?: () => number };
type FactoryDependencies = {
  fetch?: typeof fetch;
  now?: () => number;
  sleep?: (ms: number) => Promise<void>;
};

export const PROPOSAL_SEARCH_LIMIT = 25;

export function parseCreateProposalRequest(request: unknown) {
  const parsed = createProposalRequestSchema.safeParse(request);
  if (!parsed.success) {
    throw new ValidationError({
      message: "Invalid Proposales create request",
      issues: parsed.error.issues.map((issue) => ({ path: issue.path.map(String), message: issue.message })),
    });
  }
  return parsed.data;
}

export function createProposalesClient({ http, companyId, now = Date.now }: ClientOptions): ProposalesClient {
  async function listContent(): Promise<ContentItem[]> {
    const body = await http.get("/v3/content", { company_id: companyId }, { operation: "listContent", idempotent: true });
    const parsed = contentListResponseSchema.safeParse(body);
    if (!parsed.success) throw ProposalesError.schemaMismatch("listContent", parsed.error);
    return parsed.data.data.map(toContentItem);
  }

  async function getContent(variationId: string): Promise<ContentItem | null> {
    const parsedVariationId = variationIdSchema.safeParse(variationId);
    if (!parsedVariationId.success) {
      throw new ValidationError({
        message: "Invalid variation id",
        issues: parsedVariationId.error.issues.map((issue) => ({ path: issue.path.map(String), message: issue.message })),
      });
    }

    const body = await http.get(
      "/v3/content",
      { company_id: companyId, variation_id: parsedVariationId.data },
      { operation: "getContent", idempotent: true },
    );
    const parsed = contentListResponseSchema.safeParse(body);
    if (!parsed.success) throw ProposalesError.schemaMismatch("getContent", parsed.error);
    const item = parsed.data.data.find((entry) => String(entry.variation_id) === parsedVariationId.data);
    return item === undefined ? null : toContentItem(item);
  }

  async function getCompany(): Promise<CompanyInfo> {
    const body = await http.get("/v3/companies", {}, { operation: "getCompany", idempotent: true });
    const parsed = companyListResponseSchema.safeParse(body);
    if (!parsed.success) throw ProposalesError.schemaMismatch("getCompany", parsed.error);
    const company = parsed.data.data.find((entry) => entry.id === companyId);
    if (company === undefined) throw ProposalesError.notFound("getCompany");
    return toCompanyInfo(company);
  }

  async function createProposalDraft(input: Parameters<ProposalesClient["createProposalDraft"]>[0]) {
    const request = parseCreateProposalRequest(toCreateProposalRequest(input, { companyId, now }));
    const body = await http.post("/v3/proposals", request, { operation: "createProposalDraft" });
    const parsed = proposalMutationResponseSchema.safeParse(body);
    if (!parsed.success) throw ProposalesError.schemaMismatch("createProposalDraft", parsed.error);
    return toCreatedDraft(parsed.data);
  }

  async function findProposalsByGenerationId(generationId: string) {
    const body = await http.get(
      "/v3/proposal-search",
      {
        company_id: companyId,
        [`filter[${PROPOSAL_METADATA_KEYS.generationId}]`]: generationId,
        limit: PROPOSAL_SEARCH_LIMIT,
      },
      { operation: "findProposalsByGenerationId", idempotent: true },
    );
    const parsed = proposalSearchResponseSchema.safeParse(body);
    if (!parsed.success) throw ProposalesError.schemaMismatch("findProposalsByGenerationId", parsed.error);
    return parsed.data.data
      .filter((row) => row.data[PROPOSAL_METADATA_KEYS.generationId] === generationId)
      .map((row) => toRecoveredSummary(row, generationId));
  }

  async function getProposal(uuid: string) {
    const body = await http.get(`/v3/proposals/${encodeURIComponent(uuid)}`, {}, { operation: "getProposal", idempotent: true });
    const parsed = proposalReadbackSchema.safeParse(body);
    if (!parsed.success) throw ProposalesError.schemaMismatch("getProposal", parsed.error);
    return toProposalReadback(parsed.data.data);
  }

  return { getCompany, listContent, getContent, createProposalDraft, findProposalsByGenerationId, getProposal };
}

export function getProposalesClient(
  dependencies: FactoryDependencies = {},
): ProposalesClient {
  const http = createProposalesHttp({
    fetch: dependencies.fetch,
    now: dependencies.now,
    sleep: dependencies.sleep,
    apiKey: serverEnv.PROPOSALES_API_KEY,
  });
  return createProposalesClient({ http, companyId: serverEnv.PROPOSALES_COMPANY_ID, now: dependencies.now });
}
