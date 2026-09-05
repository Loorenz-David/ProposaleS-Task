import "server-only";

import { serverEnv } from "@/lib/env/server";
import { toCreateProposalRequest } from "@/lib/proposales/mappers";
import type { CompanyInfo, ContentItem, CreatedDraft, CreateProposalDraftInput, ProposalReadback, ProposalesClient, RecoveredProposalSummary } from "@/lib/proposales/index";

type FakeCall =
  | { op: "listContent" }
  | { op: "getCompany" }
  | { op: "getContent"; input: string };

type FakeOperation = "listContent" | "getCompany" | "getContent" | "createProposalDraft" | "findProposalsByGenerationId" | "getProposal";
type CreateFakeCall = { op: "createProposalDraft"; input: CreateProposalDraftInput; request: ReturnType<typeof toCreateProposalRequest> };

type FakeOptions = {
  catalog?: ContentItem[];
  company?: CompanyInfo;
  proposals?: RecoveredProposalSummary[];
  proposalReadbacks?: Record<string, ProposalReadback>;
  proposalReadback?: ProposalReadback;
  editorOrigin?: string;
  now?: () => number;
  newUuid?: () => string;
};

export function createFakeProposalesClient({
  catalog = [],
  company = { companyId: serverEnv.PROPOSALES_COMPANY_ID, currency: "EUR", taxMode: "standard" },
  proposals = [],
  proposalReadbacks = {},
  proposalReadback,
  editorOrigin = "https://proposales.test",
  now = Date.now,
  newUuid = () => crypto.randomUUID(),
}: FakeOptions = {}): ProposalesClient & {
  catalog: ContentItem[];
  company: CompanyInfo;
  calls: Array<FakeCall | CreateFakeCall>;
  writes: number;
  stored: RecoveredProposalSummary[];
  storedReadbacks: Map<string, ProposalReadback>;
  failNext(op: FakeOperation, error: unknown): void;
  assertNoWrites(): void;
} {
  const calls: Array<FakeCall | CreateFakeCall> = [];
  const stored = [...proposals];
  const storedReadbacks = new Map<string, ProposalReadback>(Object.entries(proposalReadbacks));
  const failures = new Map<FakeOperation, unknown>();
  const takeFailure = (op: FakeOperation) => {
    const error = failures.get(op);
    failures.delete(op);
    if (error !== undefined) throw error;
  };
  const fake = {
    catalog,
    company,
    calls,
    writes: 0,
    stored,
    storedReadbacks,
    failNext(op: FakeOperation, error: unknown) {
      failures.set(op, error);
    },
    assertNoWrites() {
      if (fake.writes !== 0) throw new Error("fake write count is non-zero");
    },
    async listContent() {
      takeFailure("listContent");
      calls.push({ op: "listContent" });
      return catalog;
    },
    async getContent(input: string) {
      takeFailure("getContent");
      calls.push({ op: "getContent", input });
      return catalog.find((item) => item.variationId === input) ?? null;
    },
    async getCompany() {
      takeFailure("getCompany");
      calls.push({ op: "getCompany" });
      return company;
    },
    async createProposalDraft(input: CreateProposalDraftInput): Promise<CreatedDraft> {
      takeFailure("createProposalDraft");
      const request = toCreateProposalRequest(input, { companyId: company.companyId, now });
      calls.push({ op: "createProposalDraft", input, request });
      fake.writes += 1;
      const proposalUuid = newUuid();
      if (proposalReadback !== undefined) storedReadbacks.set(proposalUuid, proposalReadback);
      const summary: RecoveredProposalSummary = { proposalUuid, url: `${editorOrigin}/proposals/${proposalUuid}`, generationId: input.generationId };
      stored.push(summary);
      return { proposalUuid, url: summary.url };
    },
    async findProposalsByGenerationId(generationId: string): Promise<RecoveredProposalSummary[]> {
      takeFailure("findProposalsByGenerationId");
      return stored.filter((proposal) => proposal.generationId === generationId);
    },
    async getProposal(uuid: string): Promise<ProposalReadback> {
      takeFailure("getProposal");
      const readback = storedReadbacks.get(uuid);
      if (readback === undefined) throw new Error(`No fake read-back for ${uuid}`);
      return readback;
    },
  };

  return fake;
}
