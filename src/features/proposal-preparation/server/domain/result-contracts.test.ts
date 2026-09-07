import { describe, expect, expectTypeOf, it } from "vitest";

import type { RunFailureReason } from "@/lib/agent/types";
import type { AppliedPricing } from "@/lib/proposales";
import { toAppliedPricing } from "@/lib/proposales/applied-pricing.mapper";
import { toProposalReadback } from "@/lib/proposales/mappers";
import { proposalReadbackSchema } from "@/lib/proposales/schemas";

import { appliedPricingSchema } from "../../schemas/draft-result";
import { runFailureReasonSchema, type DomainResult } from "../../schemas/turn-result";
import type { RenderableResult } from "./conversation";

const consistent = (await import("@/lib/proposales/fixtures/proposal-readback.consistent.json")).default;
const inconsistent = (await import("@/lib/proposales/fixtures/proposal-readback.inconsistent.json")).default;

/**
 * `schemas/` stays runtime-neutral, so two contracts it declares are copies of shapes that live in
 * server-only modules. These are the assertions that stop the copies drifting; each fails at
 * typecheck or at run, not at review.
 */
describe("result contracts", () => {
  it("the run failure reasons the result schema admits are exactly the runtime's", () => {
    type SchemaReason = typeof runFailureReasonSchema extends { options: readonly (infer T)[] } ? T : never;
    expectTypeOf<SchemaReason>().toEqualTypeOf<RunFailureReason>();
    expectTypeOf<RunFailureReason>().toEqualTypeOf<SchemaReason>();
  });

  it("every domain result that reaches the conversation is renderable", () => {
    // Approval and execution carry no conversation, so `created` and `recovered` never reach the
    // renderer; the Extract is what makes the claim true rather than aspirational.
    type Renderable = Extract<DomainResult, { status: "clarification" | "proposition" | "failed" }>;
    expectTypeOf<Renderable>().toExtend<RenderableResult>();
    expectTypeOf<RenderableResult["status"]>().toEqualTypeOf<Renderable["status"]>();
  });

  it("the feature's applied-pricing schema accepts exactly what the lib mapper produces", () => {
    for (const [name, fixture] of [["consistent", consistent], ["inconsistent", inconsistent]] as const) {
      const readback = toProposalReadback(proposalReadbackSchema.parse(fixture).data);
      const mapped: AppliedPricing = toAppliedPricing(readback);
      const parsed = appliedPricingSchema.safeParse(mapped);
      expect({ name, ok: parsed.success }).toEqual({ name, ok: true });
      expect(parsed.success && parsed.data).toEqual(mapped);
    }
  });

  it("the mapper's output type is assignable to the schema's available arm", () => {
    type SchemaAvailable = Extract<ReturnType<typeof appliedPricingSchema.parse>, { available: true }>;
    expectTypeOf<AppliedPricing>().toExtend<SchemaAvailable>();
  });
});
