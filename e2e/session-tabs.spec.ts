import { expect, test, type Page } from "@playwright/test";

import { ACTIVE_TAB_REVEAL_MARGIN_PX } from "@/features/proposal-preparation/components/session-tabs/session-tabs-constants";

import { openWorkspace } from "./support/workspace";

async function expectActiveTabVisible(page: Page) {
  const region = page.locator("[data-session-tab-scroll-region]");
  const active = page.locator('[role="tab"][aria-selected="true"]');
  await expect.poll(async () => region.evaluate((element, margin) => {
    const tab = element.querySelector('[role="tab"][aria-selected="true"]');
    if (!tab) return false;
    const regionBox = element.getBoundingClientRect();
    const tabBox = tab.getBoundingClientRect();
    return {
      overflowing: element.scrollWidth > element.clientWidth,
      left: tabBox.left - regionBox.left,
      right: regionBox.right - tabBox.right,
      margin,
    };
  }, ACTIVE_TAB_REVEAL_MARGIN_PX)).toEqual(expect.objectContaining({
    overflowing: true,
    left: expect.any(Number),
    right: expect.any(Number),
    margin: ACTIVE_TAB_REVEAL_MARGIN_PX,
  }));
  await expect.poll(async () => region.evaluate((element, margin) => {
    const tab = element.querySelector('[role="tab"][aria-selected="true"]');
    if (!tab) return false;
    const regionBox = element.getBoundingClientRect();
    const tabBox = tab.getBoundingClientRect();
    return tabBox.left - regionBox.left >= margin && regionBox.right - tabBox.right >= margin;
  }, ACTIVE_TAB_REVEAL_MARGIN_PX)).toBe(true);
  await expect(active).toBeVisible();
}

test.describe("session tabs", () => {
  test("C4(b): keeps the active tab inside the visible strip after every movement operation", async ({ page }) => {
    await openWorkspace(page);
    const add = page.locator("button[data-new-session]");
    for (let index = 0; index < 7; index += 1) await add.click();
    await expectActiveTabVisible(page);

    await page.locator('[role="tab"]').first().click();
    await expectActiveTabVisible(page);

    const last = page.locator('[role="tab"][aria-selected="true"]');
    await last.press("Control+Shift+ArrowLeft");
    await expectActiveTabVisible(page);

    await page.locator('[role="tab"][aria-selected="true"] + button[data-session-close]').click();
    await expectActiveTabVisible(page);

    await add.click();
    await expectActiveTabVisible(page);

    await page.setViewportSize({ width: 780, height: 720 });
    await expectActiveTabVisible(page);
  });

  test("C5(e,f,g): exposes focus indicators, a usable close target and the full elided title", async ({ page }) => {
    await openWorkspace(page);
    const add = page.locator("button[data-new-session]");
    for (let index = 0; index < 5; index += 1) await add.click();
    const tab = page.locator('[role="tab"]').first();
    await tab.evaluate((element) => (element as HTMLElement).focus({ focusVisible: true }));
    await expect(tab).toBeFocused();
    await expect.poll(() => tab.evaluate((element) => getComputedStyle(element).outlineStyle)).toBe("solid");
    const close = tab.locator("xpath=following-sibling::button[@data-session-close]");
    const closeBox = await close.boundingBox();
    expect(closeBox?.width).toBeGreaterThanOrEqual(24);
    expect(closeBox?.height).toBeGreaterThanOrEqual(24);
    const title = tab.locator("[data-elided]");
    const titleText = await title.textContent();
    const titleBox = await title.boundingBox();
    expect(titleText).toBeTruthy();
    if (titleBox && titleBox.width < (await title.evaluate((element) => element.scrollWidth))) {
      await expect(title).toHaveAccessibleName(titleText as string);
    }
  });

  test("C6(c): session operations do not change URL or history", async ({ page }) => {
    await openWorkspace(page);
    const before = { url: page.url(), history: await page.evaluate(() => history.length) };
    const add = page.locator("button[data-new-session]");
    await add.click();
    await page.locator('[role="tab"]').first().click();
    await page.locator('[role="tab"][aria-selected="true"] + button[data-session-close]').click();
    await expect(page).toHaveURL(before.url);
    await expect.poll(() => page.evaluate(() => history.length)).toBe(before.history);
  });
});
