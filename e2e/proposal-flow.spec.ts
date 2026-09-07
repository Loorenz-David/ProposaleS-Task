import { expect, test, type Page } from "@playwright/test";

// Drives the brief-to-proposition flow on whichever session is currently active,
// without navigating. Use this for a session other than the first one in a test —
// a second `page.goto("/")` mid-test reloads the whole page and, since the app has
// no persistence, silently discards every open session (including the one the test
// just switched away from), leaving one fresh default session behind. That is a real
// product behaviour (covered by its own "reload" test) but not what a multi-session
// test intends when it means "now do the same thing in the new tab".
async function driveToReview(page: Page) {
  const composer = page.getByRole("textbox", { name: "Message Proposal Copilot" });
  await composer.fill("Client notes\nRestore the walnut dining set.\nKeep uncertain details visible.");
  await composer.press("Enter");
  await expect(page.locator('[data-status="working"]')).toBeVisible();
  await expect(page.getByRole("region", { name: "Agent questions" })).toBeVisible();
  await page.getByRole("textbox", { name: "How many dining chairs should be included?" }).fill("Six");
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("button", { name: "Skip — leave this for the client" }).click();
  await page.getByRole("button", { name: "Send 2 answers" }).click();
  await expect(page.getByRole("heading", { name: "Walnut dining set for Studio North", level: 1 })).toBeVisible();
}

async function reachReview(page: Page) {
  await page.goto("/");
  await driveToReview(page);
}

async function selectWorkSurface(page: Page, name: "Fields" | "Client Preview") {
  await page.getByRole("radio", { name }).focus();
  await page.keyboard.press("Space");
}

test("empty to created is operable with the real fixture latency", async ({ page }) => {
  test.slow();
  await reachReview(page);

  await page.getByRole("button", { name: "Review the proposition" }).click();
  await expect(
    page.getByRole("heading", { name: "Walnut dining set for Studio North", level: 1 }),
  ).toBeFocused();

  const thought = page.getByRole("button", { name: "How this proposition was prepared" }).first();
  await thought.click();
  await expect(thought).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByText("I matched the stated restoration scope", { exact: false })).toBeVisible();

  await page.getByRole("button", { name: /Edit Title, currently/ }).click();
  const titleInput = page.getByRole("textbox", { name: "Edit Title" });
  await titleInput.fill("Studio North walnut dining collection");
  await titleInput.press("Enter");
  await expect(page.locator('[data-status="working"]')).toBeVisible();
  await expect(page.getByRole("heading", { name: "Studio North walnut dining collection", level: 1 })).toBeVisible();

  await page.getByRole("button", { name: "Ask the agent about Title" }).click();
  const ask = page.getByRole("textbox", { name: "Ask the agent about Title" });
  await expect(ask).toBeFocused();
  await ask.fill("Make the introduction warmer");
  await ask.press("Enter");
  await expect(page.locator('[data-status="working"]')).toBeVisible();
  await expect(page.getByText("We will restore the walnut dining collection", { exact: false })).toBeVisible();

  await selectWorkSurface(page, "Client Preview");
  await expect(page.getByRole("region", { name: "Client preview (approximate)" })).toBeVisible();
  await page.getByRole("button", { name: "Approve and create draft" }).click();
  const creating = page.getByRole("heading", { name: "Creating draft in Proposales" });
  await expect(creating).toBeFocused();
  const created = page.getByRole("heading", { name: "Draft created in Proposales", level: 1 });
  await expect(created).toBeFocused();
  const link = page.getByRole("link", { name: "Open in Proposales (opens in a new tab)" });
  await expect(link).toHaveAttribute("href", /app\.proposales\.example\/proposals\/.+\/edit$/);
  await expect(link).toHaveAttribute("target", "_blank");
  await expect(link).toHaveAttribute("rel", "noopener noreferrer");
});

test("a resolved turn stays with its origin session and marks that tab unread", async ({ page }) => {
  await page.goto("/");
  const composer = page.getByRole("textbox", { name: "Message Proposal Copilot" });
  await composer.fill("A brief that resolves after switching sessions.");
  await composer.press("Enter");
  await expect(page.locator('[data-status="working"]')).toBeVisible();

  await page.getByRole("button", { name: "New session" }).click();
  const tabs = page.getByRole("tab");
  await expect(tabs).toHaveCount(2);
  await expect(page.getByRole("region", { name: "Agent questions" })).toHaveCount(0);

  await expect(tabs.nth(0)).toHaveAttribute("aria-label", /1 unread/);
  await tabs.nth(0).click();
  await expect(page.getByRole("region", { name: "Agent questions" })).toBeVisible();
  await expect(tabs.nth(0)).not.toHaveAttribute("aria-label", /unread/);
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

test("closing while a draft is creating is refused", async ({ page }) => {
  test.slow();
  await reachReview(page);
  await page.getByRole("button", { name: "Approve and create draft" }).click();
  await expect(page.getByRole("heading", { name: "Creating draft in Proposales" })).toBeFocused();

  await page.getByRole("button", { name: /Close session/ }).click();
  await expect(page.locator("[data-session-status-announcement]")).toHaveText(
    "This session cannot be closed while its draft is being created.",
  );
  await expect(page.getByRole("tab")).toHaveCount(1);
});

test("session work surface and opened block context are restored independently", async ({ page }) => {
  test.slow();
  await reachReview(page);
  await page.getByRole("button", { name: "Replace" }).first().click();
  await expect(page.getByRole("region", { name: "Replace line item" })).toBeVisible();
  await selectWorkSurface(page, "Client Preview");
  await expect(page.getByRole("radio", { name: "Client Preview" })).toBeChecked();

  await page.getByRole("button", { name: "New session" }).click();
  await driveToReview(page);
  await expect(page.getByRole("radio", { name: "Fields" })).toBeChecked();

  const tabs = page.getByRole("tab");
  await expect(tabs).toHaveCount(2);
  await tabs.nth(0).click();
  await expect(page.getByRole("radio", { name: "Client Preview" })).toBeChecked();
  await expect(page.getByRole("region", { name: "Replace line item" })).toHaveCount(0);
  await selectWorkSurface(page, "Fields");
  await expect(page.getByRole("region", { name: "Replace line item" })).toBeVisible();

  await tabs.nth(1).click();
  await expect(page.getByRole("radio", { name: "Fields" })).toBeChecked();
});

test("reload starts one empty session without restoring the previous workspace", async ({ page }) => {
  await reachReview(page);
  await page.reload();
  await expect(page.getByRole("tab")).toHaveCount(1);
  await expect(
    page.getByText("Paste notes and I will draft a proposal", { exact: false }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Walnut dining set for Studio North", level: 1 })).toHaveCount(0);
});

test.describe("reduced motion", () => {
  test.use({ contextOptions: { reducedMotion: "reduce" } });

  test("creating spinner is static and focus advances to both state headings", async ({ page }) => {
    test.slow();
    await reachReview(page);
    await page.getByRole("button", { name: "Approve and create draft" }).click();
    const creating = page.getByRole("heading", { name: "Creating draft in Proposales" });
    await expect(creating).toBeFocused();
    await expect(page.getByRole("status").locator("svg")).toHaveCSS("animation-name", "none");
    await expect(page.getByRole("heading", { name: "Draft created in Proposales", level: 1 })).toBeFocused();
  });

  test("the complete clarification, review, ask, and creation loop remains operable", async ({ page }) => {
    test.slow();
    await reachReview(page);
    await page.getByRole("button", { name: /Edit Title, currently/ }).click();
    const titleInput = page.getByRole("textbox", { name: "Edit Title" });
    await titleInput.fill("Reduced motion dining collection");
    await titleInput.press("Enter");
    await expect(page.locator('[data-status="working"]')).toBeVisible();
    // The scripted fixture adapter never reads submitted text (Pass A decision: no
    // client-side intelligence); an edit turn always resolves to the fixture's V2
    // proposition. The semantic behaviour this row protects is that the server's
    // returned title replaces the prior one, not that the typed text round-trips.
    await expect(
      page.getByRole("heading", { name: "Studio North walnut dining collection", level: 1 }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Ask the agent about Title" }).click();
    const ask = page.getByRole("textbox", { name: "Ask the agent about Title" });
    await ask.fill("Keep the introduction warm");
    await ask.press("Enter");
    await expect(page.locator('[data-status="working"]')).toBeVisible();
    await expect(page.getByText("We will restore the walnut dining collection", { exact: false })).toBeVisible();

    await page.getByRole("button", { name: "Approve and create draft" }).click();
    await expect(page.getByRole("heading", { name: "Creating draft in Proposales" })).toBeFocused();
    await expect(page.getByRole("heading", { name: "Draft created in Proposales", level: 1 })).toBeFocused();
  });
});

for (const width of [1440, 1100, 780]) {
  test(`review remains contained at ${width}px with divider min and max`, async ({ page }) => {
    test.slow();
    await page.setViewportSize({ width, height: 900 });
    await reachReview(page);
    const divider = page.getByRole("separator");
    for (const key of ["Home", "End"]) {
      await divider.focus();
      await page.keyboard.press(key);
      await expect(page.getByRole("button", { name: "Approve and create draft" })).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      const main = page.getByRole("main");
      expect(await main.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
      const overflow = await main.locator("table").evaluateAll((tables) => tables.every((table) => table.getBoundingClientRect().right <= table.closest("section")!.getBoundingClientRect().right + 1));
      expect(overflow).toBe(true);
    }
  });
}
