import { describe, expect, it } from "vitest";

async function modules() {
  return {
    domain: await import("./approvability"),
    registry: await import("./information-registry"),
  };
}

describe("information item approvability", () => {
  it("C2(a) approves when every item is supplied", async () => {
    const { domain, registry } = await modules();
    const items = registry.initialItems();
    for (const item of Object.values(items)) item.resolution = "supplied";
    expect(domain.evaluateApprovability(items)).toEqual({ approvable: true });
  });

  it("C2(b) refuses an unresolved language", async () => {
    const { domain, registry } = await modules();
    const items = registry.initialItems();
    for (const item of Object.values(items)) item.resolution = "supplied";
    items.language.resolution = "unresolved";
    expect(domain.evaluateApprovability(items)).toEqual({ approvable: false, itemKeys: ["language"] });
  });

  it("C2(c) does not let a deferred optional item block approval", async () => {
    const { domain, registry } = await modules();
    const items = registry.initialItems();
    for (const item of Object.values(items)) item.resolution = "supplied";
    items.recipient_identity.resolution = "deferred_by_user";
    expect(domain.evaluateApprovability(items)).toEqual({ approvable: true });
  });

  it("C2(d) gates only required-to-create items", async () => {
    const { domain, registry } = await modules();
    const items = registry.initialItems();
    for (const item of Object.values(items)) item.resolution = "supplied";
    for (const key of ["sold_scope", "recipient_identity", "quantities", "recipient_contact_detail", "description_narrative", "block_comments", "deadline_and_terms_notes"] as const) {
      items[key].resolution = "unresolved";
    }
    expect(domain.evaluateApprovability(items)).toEqual({ approvable: true });
  });

  it("C2(e) reports an unresolved block selection", async () => {
    const { domain, registry } = await modules();
    const items = registry.initialItems();
    for (const item of Object.values(items)) item.resolution = "supplied";
    items.block_selection.resolution = "unresolved";
    expect(domain.evaluateApprovability(items)).toEqual({ approvable: false, itemKeys: ["block_selection"] });
  });

  it("C2(f) reports an unresolved title", async () => {
    const { domain, registry } = await modules();
    const items = registry.initialItems();
    for (const item of Object.values(items)) item.resolution = "supplied";
    items.title.resolution = "unresolved";
    expect(domain.evaluateApprovability(items)).toEqual({ approvable: false, itemKeys: ["title"] });
  });

  it("C2(g) returns multiple required keys in sorted order", async () => {
    const { domain, registry } = await modules();
    const items = registry.initialItems();
    for (const item of Object.values(items)) item.resolution = "supplied";
    items.title.resolution = "unresolved";
    items.block_selection.resolution = "unresolved";
    expect(domain.evaluateApprovability(items)).toEqual({ approvable: false, itemKeys: ["block_selection", "title"] });
  });
});
