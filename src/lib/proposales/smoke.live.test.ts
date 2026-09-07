import { describe, expect, it } from "vitest";

import { serverEnv } from "@/lib/env/server";
import { getProposalesClient } from "@/lib/proposales";
import { toAppliedPricing } from "@/lib/proposales/applied-pricing.mapper";

/**
 * Opt-in live smoke against the real Proposales API. It is the only thing in this repository that
 * writes to a real account, so it runs only under `LIVE_SMOKE=1 npm run test:live` and creates
 * exactly one draft, prefixed so a human can find and delete it.
 *
 * Its purpose is to confirm the three facts the offline suite cannot: that the vendored request
 * shape is accepted, that library pricing really does apply on creation, and what the editor-URL
 * origin actually is. The last one is unverified configuration today, so the observed value is
 * printed for `PROPOSALES_EDITOR_ORIGIN`.
 */
const enabled = process.env.LIVE_SMOKE === "1";
const describeLive = enabled ? describe : describe.skip;

const DISPOSABLE_PREFIX = "[DISPOSABLE COPILOT SMOKE]";

describeLive("proposales live smoke", () => {
  it("L1 reads the catalog, creates one disposable draft, and reads back applied pricing", async () => {
    const client = getProposalesClient();

    const [catalog, company] = await Promise.all([client.listContent(), client.getCompany()]);
    expect(catalog.length).toBeGreaterThan(0);

    const languages = [...new Set(catalog.flatMap((item) => Object.keys(item.title)))].sort();
    expect(languages.length).toBeGreaterThan(0);

    const block = catalog[0];
    const language = Object.keys(block.title)[0];

    const created = await client.createProposalDraft({
      language,
      titleMd: `${DISPOSABLE_PREFIX} ${new Date().toISOString()}`,
      recipient: { known: false },
      blocks: [{ contentId: block.variationId, quantity: { known: true, value: 1 }, optional: { known: false } }],
      generationId: crypto.randomUUID(),
    });

    expect(created.proposalUuid).toMatch(/[0-9a-f-]{36}/i);

    const readback = await client.getProposal(created.proposalUuid);
    const applied = toAppliedPricing(readback);

    expect(applied.available).toBe(true);
    expect(applied.currency).toBe(company.currency);
    expect(applied.blocks.map((entry) => entry.contentId)).toContain(block.variationId);

    const observedOrigin = new URL(created.url).origin;

    console.log([
      "",
      "  live smoke results",
      `    disposable draft uuid   ${created.proposalUuid}   <- delete this manually`,
      `    editor url              ${created.url}`,
      `    observed editor origin  ${observedOrigin}`,
      `    configured origin       ${serverEnv.PROPOSALES_EDITOR_ORIGIN}`,
      `    origins match           ${observedOrigin === serverEnv.PROPOSALES_EDITOR_ORIGIN}`,
      `    catalog items           ${catalog.length}`,
      `    catalog languages       ${languages.join(", ")}`,
      `    company currency        ${company.currency}`,
      `    total without tax       ${applied.totalWithoutTax.amountMinor} ${applied.totalWithoutTax.currency} (minor units)`,
      `    total with tax          ${applied.totalWithTax.amountMinor} ${applied.totalWithTax.currency} (minor units)`,
      "",
    ].join("\n"));

    // Deliberately not an assertion: a mismatch is a configuration finding for the owner, and
    // failing here would hide the printed value that resolves it.
    if (observedOrigin !== serverEnv.PROPOSALES_EDITOR_ORIGIN) {
      console.warn(`  PROPOSALES_EDITOR_ORIGIN should be set to ${observedOrigin}`);
    }
  });
});
