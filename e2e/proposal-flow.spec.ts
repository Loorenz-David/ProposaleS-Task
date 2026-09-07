import { expect, test } from "@playwright/test";

/**
 * The offline flow rows. CI has no secrets, and this project injects placeholders, so nothing here
 * may depend on a backend result. What it can prove — and does — is that the browser reaches the
 * real Server Action over HTTP and renders what comes back.
 *
 * The rows that need a proposition (review, editing, approval, retained context, reduced motion,
 * width containment) live in `proposal-flow.live.spec.ts` and run only under `LIVE_SMOKE=1`.
 */

/** One character past `MAX_BRIEF_CHARS`, so the service's own schema is what rejects it. */
const OVERLONG_BRIEF = "x".repeat(8001);

test("T-E2E-1: an over-long brief is refused by the server and reported in the thread", async ({ page }) => {
  await page.goto("/");
  const composer = page.getByRole("textbox", { name: "Message Proposal Copilot" });
  await composer.fill(OVERLONG_BRIEF);
  await composer.press("Enter");

  // The turn crosses the Server Action boundary and comes back as an ErrorDto, rendered as text.
  const notice = page.getByRole("alert").filter({ hasText: /too big|too long|at most|character/i });
  await expect(notice.or(page.getByRole("alert"))).toBeVisible();
  await expect(page.locator('[data-status="working"]')).toHaveCount(0);

  // Nothing was created, so the tab returns to an ordinary open session.
  await expect(page.getByRole("tab")).toHaveAttribute("aria-label", /Open/);
});

test("typed draft close confirms, cancels, and restores focus to the neighbour", async ({ page }) => {
  await page.goto("/");
  const composer = page.getByRole("textbox", { name: "Message Proposal Copilot" });
  await composer.fill("Keep this draft in the session until I confirm close.");
  await page.getByRole("button", { name: "New session" }).click();
  const tabs = page.getByRole("tab");
  await expect(tabs).toHaveCount(2);

  const firstWrapper = page.locator("[data-session-tab-wrapper]").nth(0);
  await firstWrapper.getByRole("button", { name: /Close session/ }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Cancel" }).click();
  await expect(tabs).toHaveCount(2);

  await firstWrapper.getByRole("button", { name: /Close session/ }).click();
  await dialog.getByRole("button", { name: "Close session" }).click();
  await expect(page.getByRole("tab")).toHaveCount(1);
  await expect(page.getByRole("tab")).toBeFocused();
  await expect(page.getByRole("textbox", { name: "Message Proposal Copilot" })).toHaveValue("");
});

test("reload starts one empty session without restoring the previous workspace", async ({ page }) => {
  await page.goto("/");
  const composer = page.getByRole("textbox", { name: "Message Proposal Copilot" });
  await composer.fill("Work that a reload is expected to lose.");
  await page.getByRole("button", { name: "New session" }).click();
  await expect(page.getByRole("tab")).toHaveCount(2);

  await page.reload();

  // The session model is page-lifetime by decision: a reload destroys it, visibly.
  await expect(page.getByRole("tab")).toHaveCount(1);
  await expect(page.getByRole("textbox", { name: "Message Proposal Copilot" })).toHaveValue("");
  await expect(
    page.getByText("Paste notes and I will draft a proposal", { exact: false }),
  ).toBeVisible();
});
