import { expect, test, type Page } from "@playwright/test";

import type { CopilotTestOptions } from "../playwright.config";

/**
 * T-E2E-2 — the critical flow against the real backend. Collected only when `LIVE_SMOKE=1`, and
 * it **creates one real draft in Proposales**, which the owner deletes afterwards; the spec prints
 * the proposal uuid so it can be found. Requires `COPILOT_LIVE_MUTATIONS=enabled` in `.env`.
 *
 * The model is non-deterministic, so the spec accepts either opening move: a clarification round or
 * a proposition straight away. It asserts the shape of the flow, never particular model wording.
 */
const DISPOSABLE_MARKER = "[DISPOSABLE COPILOT E2E]";

const BRIEF =
  "We need a proposal covering consulting and a training workshop for a new team. " +
  "This is a disposable end-to-end test; no real client is involved.";

async function answerAnyQuestions(page: Page) {
  const questions = page.getByRole("region", { name: "Agent questions" });
  if ((await questions.count()) === 0) return;

  const fields = questions.getByRole("textbox");
  for (let index = 0; index < (await fields.count()); index += 1) {
    await fields.nth(index).fill("Use your best judgement; this is a disposable test.");
    const next = questions.getByRole("button", { name: "Next" });
    if ((await next.count()) > 0) await next.click();
  }
  await questions.getByRole("button", { name: /^Send/ }).click();
}

test("T-E2E-2: a real brief becomes a real draft in Proposales", async ({ page }) => {
  test.slow();
  // The origin arrives as a project option; the config reads the environment, this spec does not.
  const { editorOrigin } = test.info().project.use as CopilotTestOptions;
  expect(editorOrigin, "PROPOSALES_EDITOR_ORIGIN must be set for the live run").toBeTruthy();

  await page.goto("/");
  const composer = page.getByRole("textbox", { name: "Message Proposal Copilot" });
  await composer.fill(BRIEF);
  await composer.press("Enter");

  // Either opening move is correct; the model decides whether it has enough to commit.
  await expect(
    page.getByRole("region", { name: "Agent questions" })
      .or(page.getByRole("heading", { level: 1 }))
      .first(),
  ).toBeVisible({ timeout: 180_000 });
  await answerAnyQuestions(page);

  await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible({ timeout: 180_000 });

  // A findable title, so the draft this run creates can be identified and deleted afterwards.
  const disposableTitle = `${DISPOSABLE_MARKER} ${new Date().toISOString()}`;
  await page.getByRole("button", { name: /Edit Title, currently/ }).click();
  const titleInput = page.getByRole("textbox", { name: "Edit Title" });
  await titleInput.fill(disposableTitle);
  await titleInput.press("Enter");
  await expect(page.getByRole("heading", { name: disposableTitle, level: 1 })).toBeVisible({ timeout: 60_000 });

  // One revision, to prove a model turn runs against the real provider after a human edit.
  await page.getByRole("button", { name: "Ask the agent about Title" }).click();
  const ask = page.getByRole("textbox", { name: "Ask the agent about Title" });
  await ask.fill("Keep the title exactly as I set it, and make the introduction warmer.");
  await ask.press("Enter");
  await expect(page.locator('[data-status="working"]')).toHaveCount(0, { timeout: 180_000 });

  await page.getByRole("button", { name: "Approve and create draft" }).click();
  await expect(page.getByRole("heading", { name: "Creating draft in Proposales" })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Draft (created|recovered) in Proposales/, level: 1 }))
    .toBeVisible({ timeout: 180_000 });

  const link = page.getByRole("link", { name: "Open in Proposales (opens in a new tab)" });
  const href = await link.getAttribute("href");
  expect(href, "the editor link must be on the configured Proposales origin").toContain(editorOrigin!);

  const identifier = await page.getByText(/[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-/).first().textContent();
  // Printed so the owner can find and delete the draft this run created.
  console.log(`[live] created proposal uuid: ${identifier?.trim()} — title: ${disposableTitle}`);
});
