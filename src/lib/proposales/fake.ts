import "server-only";

import { serverEnv } from "@/lib/env/server";
import type { CompanyInfo, ContentItem, ProposalesClient } from "@/lib/proposales/index";

type FakeCall =
  | { op: "listContent" }
  | { op: "getCompany" }
  | { op: "getContent"; input: string };

type FakeOptions = {
  catalog?: ContentItem[];
  company?: CompanyInfo;
};

export function createFakeProposalesClient({
  catalog = [],
  company = { companyId: serverEnv.PROPOSALES_COMPANY_ID, currency: "EUR", taxMode: "standard" },
}: FakeOptions = {}): Pick<ProposalesClient, "getCompany" | "listContent" | "getContent"> & {
  catalog: ContentItem[];
  company: CompanyInfo;
  calls: FakeCall[];
  writes: number;
  assertNoWrites(): void;
} {
  const calls: FakeCall[] = [];
  const fake = {
    catalog,
    company,
    calls,
    writes: 0,
    assertNoWrites() {
      if (fake.writes !== 0) throw new Error("fake write count is non-zero");
    },
    async listContent() {
      calls.push({ op: "listContent" });
      return catalog;
    },
    async getContent(input: string) {
      calls.push({ op: "getContent", input });
      return catalog.find((item) => item.variationId === input) ?? null;
    },
    async getCompany() {
      calls.push({ op: "getCompany" });
      return company;
    },
  };

  return fake;
}
