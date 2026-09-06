import { describe, expect, it } from "vitest";

async function modules() {
  return {
    domain: await import("./bump-version"),
    fixtures: await import("../../fixtures/states"),
    propositions: await import("../../fixtures/propositions"),
  };
}

describe("proposal version", () => {
  it("C8(a) accepts lowercase generation identity and rejects uppercase", async () => {
    const { fixtures } = await modules();
    const { proposalWorkflowStateSchemaFor } = await import("../../schemas/workflow-state");
    const valid = proposalWorkflowStateSchemaFor("https://proposales.test").safeParse(fixtures.validState());
    expect(valid.success).toBe(true);
    const uppercase = proposalWorkflowStateSchemaFor("https://proposales.test").safeParse({ ...fixtures.validState(), generationId: fixtures.validState().generationId.toUpperCase() });
    expect(uppercase.success).toBe(false);
    if (!uppercase.success) expect(uppercase.error.issues.some((issue) => issue.path.join(".") === "generationId")).toBe(true);
  });

  it("C8(b) starts at version one without a current proposition", async () => {
    const { domain, fixtures } = await modules();
    expect(domain.nextVersion(fixtures.validState() as never)).toBe(1);
  });

  it("C8(c) increments the current proposition version exactly once", async () => {
    const { domain, fixtures, propositions } = await modules();
    const { propositionSchema } = await import("../../schemas/proposition");
    const currentProposition = propositions.validProposition({ version: 4 });
    expect(propositionSchema.parse(currentProposition)).toEqual(currentProposition);
    expect(domain.nextVersion(fixtures.validState({ currentProposition }) as never)).toBe(5);
  });

  it("C8(d) accepts only the caller-held state argument", async () => {
    const { domain } = await modules();
    expect(domain.nextVersion.length).toBe(1);
  });
});
