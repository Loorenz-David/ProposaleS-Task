import "server-only";

import { ValidationError } from "@/lib/errors/app-error";
import { serverEnv } from "@/lib/env/server";
import type { CompanyInfo, ContentItem, ProposalesClient } from "@/lib/proposales/index";
import { ProposalesError } from "@/lib/proposales/errors";
import { createProposalesHttp, type ProposalesHttp } from "@/lib/proposales/http";
import { toCompanyInfo, toContentItem } from "@/lib/proposales/mappers";
import { companyListResponseSchema, contentListResponseSchema, variationIdSchema } from "@/lib/proposales/schemas";

type ClientOptions = { http: ProposalesHttp; companyId: number };
type FactoryDependencies = {
  fetch?: typeof fetch;
  now?: () => number;
  sleep?: (ms: number) => Promise<void>;
};

export function createProposalesClient({ http, companyId }: ClientOptions): Pick<ProposalesClient, "getCompany" | "listContent" | "getContent"> {
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
    const item = parsed.data.data[0];
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

  return { getCompany, listContent, getContent };
}

export function getProposalesClient(
  dependencies: FactoryDependencies = {},
): Pick<ProposalesClient, "getCompany" | "listContent" | "getContent"> {
  const http = createProposalesHttp({
    fetch: dependencies.fetch,
    now: dependencies.now,
    sleep: dependencies.sleep,
    apiKey: serverEnv.PROPOSALES_API_KEY,
  });
  return createProposalesClient({ http, companyId: serverEnv.PROPOSALES_COMPANY_ID });
}
