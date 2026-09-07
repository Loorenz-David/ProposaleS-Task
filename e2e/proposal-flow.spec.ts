import { expect, test, type Page } from "@playwright/test";

async function reachReview(page: Page) {
  await page.goto("/");
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

  await page.getByRole("radio", { name: "Client Preview" }).focus();
  await page.keyboard.press("Space");
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
