import { expect, type Page, type Response } from "@playwright/test";

/**
 * The reviewer intro is a native modal `<dialog>` opened with `showModal()` on every page load
 * — nothing persists, so a reviewer meets it each time. It therefore owns focus and makes the
 * rest of the page inert, which is the correct behaviour and is why no spec may interact with
 * the workspace before dismissing it. A reviewer's first act is to dismiss it; so is a spec's.
 *
 * Closing the dialog leaves focus on the control that closed it. The rows below assert tab
 * order from the document start, so the sequence is reset explicitly rather than inherited
 * from the dismissal — the intro should not be able to change what the workspace's first tab
 * stop is.
 */
export async function dismissIntro(page: Page) {
  const intro = page.locator("[data-intro-dialog]");
  await expect(intro).toBeVisible();
  // Escape, not the "Skip intro" button: a click would make the pointer the browser's last
  // interaction modality, and `:focus-visible` — which the focus-ring rows assert on — would
  // then stop matching programmatic focus. Dismissal must not change what the rows measure.
  await page.keyboard.press("Escape");
  await expect(intro).toBeHidden();
  await page.evaluate(() => {
    // Blurring is not enough: Chrome keeps the sequential focus navigation starting point where
    // the dialog left it, so the next Tab walks off the end of the document instead of reaching
    // the skip link. Focusing the body moves that starting point back to the document start.
    document.body.setAttribute("tabindex", "-1");
    document.body.focus();
    document.body.removeAttribute("tabindex");
  });
}

/**
 * Navigate to the workspace and dismiss the intro, leaving the page as a reviewer first uses
 * it. Returns the navigation response, so a row can still assert on it.
 */
export async function openWorkspace(page: Page): Promise<Response | null> {
  const response = await page.goto("/");
  await dismissIntro(page);
  return response;
}
