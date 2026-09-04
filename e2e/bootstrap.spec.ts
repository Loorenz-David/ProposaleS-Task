import { expect, test } from "@playwright/test";

test("renders the bootstrap page", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "Proposal Copilot" }),
  ).toBeVisible();

  await expect(
    page.getByText("Bootstrap is running."),
  ).toBeVisible();
});