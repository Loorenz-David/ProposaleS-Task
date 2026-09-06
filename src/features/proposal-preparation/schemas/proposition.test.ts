import { describe, expect, it } from "vitest";

type AnyRecord = Record<string, any>;

async function propositionModules() {
  return {
    proposition: await import("./proposition"),
    shared: await import("./shared"),
    fixtures: await import("../fixtures/propositions"),
  };
}

function clone<T>(value: T): AnyRecord {
  return structuredClone(value) as AnyRecord;
}

function issuePath(result: AnyRecord): string[] {
  if (result.success) throw new Error("expected parse failure");
  return result.error.issues[0].path.map(String);
}

describe("proposition schema", () => {
  it.each([
    ["C2(a)", ["recipient", "value", "firstName"]],
    ["C2(b)", ["recipient", "value", "lastName"]],
    ["C2(c)", ["recipient", "value", "email"]],
    ["C2(d)", ["recipient", "value", "phone"]],
    ["C2(e)", ["recipient", "value", "companyName"]],
    ["C2(f)", ["blocks", "0", "contentId"]],
    ["C2(g)", ["blocks", "0", "quantity"]],
    ["C2(h)", ["blocks", "0", "optional"]],
    ["C2(i)", ["commercialNotes", "0", "amount"]],
    ["C2(j)", ["commercialNotes", "0", "currency"]],
    ["C2(k)", ["commercialNotes", "0", "taxBasis"]],
    ["C2(l)", ["commercialAssumptions", "0", "statedValue"]],
    ["C2(m)", ["commercialAssumptions", "1", "statedValue"]],
    ["C2(n)", ["commercialAssumptions", "2", "statedValue"]],
    ["C2(o)", ["emptyDraftConfirmation"]],
  ])("%s observes its independent consequential-leaf rejection", async (_id, path) => {
    const { proposition, fixtures } = await propositionModules();
    expect(fixtures.CONSEQUENTIAL_LEAF_DESCRIPTORS).toHaveLength(15);
    const descriptor = fixtures.CONSEQUENTIAL_LEAF_DESCRIPTORS.find((candidate: AnyRecord) => candidate.path.join(".") === (path as string[]).join("."));
    if (!descriptor) throw new Error(`missing descriptor for ${(path as string[]).join(".")}`);
    const result = proposition.propositionSchema.safeParse(fixtures.leafInferred(descriptor));
    expect(result.success).toBe(false);
    expect(issuePath(result)).toEqual([...(path as string[]), "source"]);
  });

  it("C3(a) rejects a brief-sourced content identifier", async () => {
    const { proposition, fixtures } = await propositionModules();
    const value = clone(fixtures.validProposition());
    value.blocks[0].contentId = { value: "9223372036854775807", source: "brief" };
    expect(proposition.propositionSchema.safeParse(value).success).toBe(false);
  });

  it("C3(b) rejects a content-sourced quantity", async () => {
    const { proposition, fixtures } = await propositionModules();
    const value = clone(fixtures.validProposition());
    value.blocks[0].quantity = { known: true, value: 2, source: "proposales_content", ref: { variationId: "188485" } };
    expect(proposition.propositionSchema.safeParse(value).success).toBe(false);
  });

  it("C3(c) rejects a content-sourced optional flag", async () => {
    const { proposition, fixtures } = await propositionModules();
    const value = clone(fixtures.validProposition());
    value.blocks[0].optional = { known: true, value: false, source: "proposales_content", ref: { variationId: "188485" } };
    expect(proposition.propositionSchema.safeParse(value).success).toBe(false);
  });

  it("C3(d) rejects a non-human empty-draft confirmation", async () => {
    const { proposition, fixtures } = await propositionModules();
    const value = clone(fixtures.validProposition());
    value.emptyDraftConfirmation = { known: true, value: true, source: "brief" };
    expect(proposition.propositionSchema.safeParse(value).success).toBe(false);
  });

  it("C3(e) accepts a human empty-draft confirmation", async () => {
    const { proposition, fixtures } = await propositionModules();
    const value = clone(fixtures.validProposition());
    value.emptyDraftConfirmation = { known: true, value: true, source: "human", ref: { editTurn: 1 } };
    expect((proposition.propositionSchema.parse(value) as AnyRecord).emptyDraftConfirmation.source).toBe("human");
  });

  it("C3(f) rejects a human-authored catalog title", async () => {
    const { proposition, fixtures } = await propositionModules();
    const value = clone(fixtures.validProposition());
    value.blocks[0].title = { value: "Authored", source: "human" };
    expect(proposition.propositionSchema.safeParse(value).success).toBe(false);
  });

  it("C3(g) rejects a content-sourced commercial note amount", async () => {
    const { proposition, fixtures } = await propositionModules();
    const value = clone(fixtures.validProposition());
    value.commercialNotes[0].amount = { known: true, value: { amountMinor: 1200000, currency: "EUR" }, source: "proposales_content", ref: { variationId: "188485" } };
    expect(proposition.propositionSchema.safeParse(value).success).toBe(false);
  });

  it("C3(h) permits an inferred other commercial assumption", async () => {
    const { proposition, fixtures } = await propositionModules();
    const value = clone(fixtures.validProposition());
    value.commercialAssumptions.push({ kind: "other", statedValue: { value: "Friendly tone", source: "inferred" } });
    expect(proposition.propositionSchema.parse(value).commercialAssumptions.at(-1)?.kind).toBe("other");
  });

  it("C3(i) enforces the canonical positive-int64 content identifier", async () => {
    const { proposition, fixtures } = await propositionModules();
    for (const [contentId, valid] of [["9223372036854775807", true], ["0", false], ["01", false], ["9223372036854775808", false]] as const) {
      const value = clone(fixtures.validProposition());
      value.blocks[0].contentId.value = contentId;
      expect(proposition.propositionSchema.safeParse(value).success, contentId).toBe(valid);
    }
  });

  it.each([
    ["C4(a)", ["language"]],
    ["C4(b)", ["title"]],
    ["C4(c)", ["descriptionNarrative"]],
    ["C4(d)", ["blocks", "0", "reviewerComment"]],
    ["C4(e)", ["blocks", "0", "alternatives", "0", "reason"]],
    ["C4(f)", ["agentRationale"]],
    ["C4(g)", ["assumptions", "0", "note"]],
  ])("%s permits inferred presentational text", async (_id, path) => {
    const { proposition, fixtures } = await propositionModules();
    const value = clone(fixtures.validProposition());
    const leaf = path as string[];
    if (leaf[0] === "assumptions") value.assumptions[0].note = { value: "Inferred note", source: "inferred" };
    else if (leaf[0] === "blocks" && leaf[2] === "reviewerComment") value.blocks[0].reviewerComment = { known: true, value: "Inferred comment", source: "inferred" };
    else if (leaf[0] === "blocks") value.blocks[0].alternatives[0].reason = { value: "Inferred reason", source: "inferred" };
    else value[leaf[0]] = leaf[0] === "language"
      ? { known: true, value: "en", source: "inferred" }
      : { known: true, value: "Inferred text", source: "inferred" };
    expect(proposition.propositionSchema.safeParse(value).success, leaf.join(".")).toBe(true);
  });

  it("C5(a) rejects a price field on a block", async () => {
    const { proposition, fixtures } = await propositionModules();
    const value = clone(fixtures.validProposition());
    value.blocks[0].unitValue = 1;
    expect(proposition.propositionSchema.safeParse(value).success).toBe(false);
  });

  it("C5(b) rejects a proposal total", async () => {
    const { proposition, fixtures } = await propositionModules();
    const value = clone(fixtures.validProposition());
    value.total = { amountMinor: 1, currency: "EUR" };
    expect(proposition.propositionSchema.safeParse(value).success).toBe(false);
  });

  it("C5(c) rejects a block currency", async () => {
    const { proposition, fixtures } = await propositionModules();
    const value = clone(fixtures.validProposition());
    value.blocks[0].currency = "EUR";
    expect(proposition.propositionSchema.safeParse(value).success).toBe(false);
  });

  it("C5(d) accepts integer money and explicit absent amount", async () => {
    const { proposition, fixtures } = await propositionModules();
    const known = clone(fixtures.validProposition());
    known.commercialNotes[0].amount = { known: true, value: { amountMinor: 1200000, currency: "EUR" }, source: "brief" };
    expect(proposition.propositionSchema.safeParse(known).success).toBe(true);
    const decimal = clone(known);
    decimal.commercialNotes[0].amount.value.amountMinor = 12000.5;
    expect(proposition.propositionSchema.safeParse(decimal).success).toBe(false);
    const absent = clone(fixtures.validProposition());
    absent.commercialNotes[0].amount = { known: false };
    expect(proposition.propositionSchema.safeParse(absent).success).toBe(true);
  });

  it("C5(e) requires an explicit tax basis", async () => {
    const { proposition, fixtures } = await propositionModules();
    const value = clone(fixtures.validProposition());
    value.commercialNotes[0].taxBasis = { value: "unstated", source: "brief" };
    expect(proposition.propositionSchema.safeParse(value).success).toBe(true);
    delete value.commercialNotes[0].taxBasis;
    expect(proposition.propositionSchema.safeParse(value).success).toBe(false);
  });

  it("C5(f) validates note currency or explicit absence", async () => {
    const { proposition, fixtures } = await propositionModules();
    const known = clone(fixtures.validProposition());
    known.commercialNotes[0].currency = { known: true, value: "USD", source: "brief" };
    expect(proposition.propositionSchema.safeParse(known).success).toBe(true);
    const lowercase = clone(known);
    lowercase.commercialNotes[0].currency.value = "usd";
    expect(proposition.propositionSchema.safeParse(lowercase).success).toBe(false);
    const absent = clone(fixtures.validProposition());
    absent.commercialNotes[0].currency = { known: false };
    expect(proposition.propositionSchema.safeParse(absent).success).toBe(true);
  });

  it("C5(g) requires the library pricing literal", async () => {
    const { proposition, fixtures } = await propositionModules();
    const valid = clone(fixtures.validProposition());
    expect(proposition.propositionSchema.safeParse(valid).success).toBe(true);
    const custom = clone(valid);
    custom.blocks[0].pricing = "custom";
    expect(proposition.propositionSchema.safeParse(custom).success).toBe(false);
    const missing = clone(valid);
    delete missing.blocks[0].pricing;
    expect(proposition.propositionSchema.safeParse(missing).success).toBe(false);
  });

  it.each([
    ["C6(a)", ["title"], "MAX_TITLE_CHARS"],
    ["C6(b)", ["descriptionNarrative"], "MAX_NARRATIVE_CHARS"],
    ["C6(c)", ["blocks", "0", "reviewerComment"], "MAX_COMMENT_CHARS"],
    ["C6(d)", ["commercialNotes", "0", "text"], "MAX_NOTE_TEXT_CHARS"],
    ["C6(e)", ["agentRationale"], "MAX_RATIONALE_CHARS"],
    ["C6(f)", ["warnings", "0", "text"], "MAX_WARNING_CHARS"],
    ["C6(g)", ["assumptions", "0", "note"], "MAX_ASSUMPTION_CHARS"],
    ["C6(h)", ["blocks", "0", "alternatives", "0", "reason"], "MAX_ALTERNATIVE_REASON_CHARS"],
  ])("%s enforces its trimmed text bound", async (_id, path, constantName) => {
    const { proposition, fixtures, shared } = await propositionModules();
    const value = clone(fixtures.validProposition());
    const cap = shared[constantName as keyof typeof shared] as number;
    const leaf = path as string[];
    const sourced = (text: string) => ({ value: text, source: "inferred" });
    if (leaf[0] === "title") value.title = { known: true, ...sourced("x".repeat(cap + 1)) };
    else if (leaf[0] === "descriptionNarrative") value.descriptionNarrative = { known: true, ...sourced("x".repeat(cap + 1)) };
    else if (leaf[0] === "blocks" && leaf[2] === "reviewerComment") value.blocks[0].reviewerComment = { known: true, ...sourced("x".repeat(cap + 1)) };
    else if (leaf[0] === "commercialNotes") value.commercialNotes[0].text.value = "x".repeat(cap + 1);
    else if (leaf[0] === "agentRationale") value.agentRationale = { known: true, ...sourced("x".repeat(cap + 1)) };
    else if (leaf[0] === "warnings") value.warnings[0].text = { value: "x".repeat(cap + 1), source: "inferred" };
    else if (leaf[0] === "assumptions") value.assumptions[0].note = { value: "x".repeat(cap + 1), source: "inferred" };
    else value.blocks[0].alternatives[0].reason = { value: "x".repeat(cap + 1), source: "inferred" };
    const result = proposition.propositionSchema.safeParse(value);
    expect(result.success, leaf.join(".")).toBe(false);
    if (!result.success && leaf[0] === "commercialNotes") {
      expect(result.error.issues.some((issue) => issue.code === "too_big" && issue.path.map(String).join(".") === "commercialNotes.0.text.value")).toBe(true);
    }

    const trimmed = clone(fixtures.validProposition());
    if (leaf[0] === "title") trimmed.title = { known: true, value: "  x  ", source: "inferred" };
    else if (leaf[0] === "descriptionNarrative") trimmed.descriptionNarrative = { known: true, value: "  x  ", source: "inferred" };
    else if (leaf[0] === "blocks" && leaf[2] === "reviewerComment") trimmed.blocks[0].reviewerComment = { known: true, value: "  x  ", source: "inferred" };
    else if (leaf[0] === "commercialNotes") trimmed.commercialNotes[0].text.value = "  x  ";
    else if (leaf[0] === "agentRationale") trimmed.agentRationale = { known: true, value: "  x  ", source: "inferred" };
    else if (leaf[0] === "warnings") trimmed.warnings[0].text = { value: "  x  ", source: "inferred" };
    else if (leaf[0] === "assumptions") trimmed.assumptions[0].note = { value: "  x  ", source: "inferred" };
    else trimmed.blocks[0].alternatives[0].reason = { value: "  x  ", source: "inferred" };
    let parsed: AnyRecord = proposition.propositionSchema.parse(trimmed) as AnyRecord;
    for (const segment of leaf) parsed = parsed[segment];
    expect(parsed.value).toBe("x");
  });
});
