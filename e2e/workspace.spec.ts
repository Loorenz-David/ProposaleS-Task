import { readFileSync } from "node:fs";
import path from "node:path";

import { expect, test, type Page } from "@playwright/test";

import {
  AGENT_PANE_DEFAULT_PX,
  AGENT_PANE_MAX_PX,
  AGENT_PANE_MIN_PX,
  DIVIDER_KEYBOARD_LARGE_STEP_PX,
  DIVIDER_KEYBOARD_STEP_PX,
  MAIN_PANE_MIN_PX,
  NARROW_WIDTH_TEST_SET,
} from "@/features/proposal-preparation/components/workspace/constants";
import { getEffectiveDividerMax } from "@/features/proposal-preparation/hooks/use-divider-width";

const REPO_ROOT = path.resolve(__dirname, "..");
const GLOBALS_CSS = readFileSync(path.join(REPO_ROOT, "src/styles/globals.css"), "utf8");
const THEME_CSS = readFileSync(path.join(REPO_ROOT, "src/styles/theme.css"), "utf8");

function expectedWidth(requested: number, containerWidth: number): number {
  return Math.round(Math.min(getEffectiveDividerMax(containerWidth), Math.max(AGENT_PANE_MIN_PX, requested)));
}

async function accessibleRoles(page: Page, selector: string): Promise<string[]> {
  const client = await page.context().newCDPSession(page);
  const document = await client.send("DOM.getDocument", { depth: -1 });
  const queried = await client.send("DOM.querySelector", {
    nodeId: document.root.nodeId,
    selector,
  });
  const described = await client.send("DOM.describeNode", { nodeId: queried.nodeId });
  const accessibility = await client.send("Accessibility.getFullAXTree");
  const nodes = accessibility.nodes as Array<{
    backendDOMNodeId?: number;
    nodeId: string;
    parentId?: string;
    role?: { value?: string };
  }>;
  const backendNodeId = described.node.backendNodeId;
  const root = nodes.find((node) => node.backendDOMNodeId === backendNodeId);
  if (!root) throw new Error(`Accessibility node is missing for ${selector}`);
  const subtree = new Set([root.nodeId]);
  let expanded = true;
  while (expanded) {
    expanded = false;
    for (const node of nodes) {
      if (node.parentId && subtree.has(node.parentId) && !subtree.has(node.nodeId)) {
        subtree.add(node.nodeId);
        expanded = true;
      }
    }
  }
  const ignoredRoles = new Set(["generic", "paragraph", "StaticText", "InlineTextBox", "none", "RootWebArea"]);
  const roles = new Set(
    nodes
      .filter((node) => subtree.has(node.nodeId))
      .map((node) => node.role?.value)
      .filter((role): role is string => role !== undefined && !ignoredRoles.has(role)),
  );
  await client.detach();
  return [...roles].sort();
}

async function installAnnouncementCounter(page: Page) {
  await page.evaluate(() => {
    const live = document.querySelector("[data-divider-announcement]");
    if (!live) throw new Error("Announcement live region is missing");
    let count = 0;
    const observer = new MutationObserver((records) => {
      count += records.length;
    });
    observer.observe(live, { childList: true, characterData: true, subtree: true });
    const testWindow = window as unknown as {
      __announcementCount: () => number;
      __stopAnnouncementCounter: () => void;
    };
    testWindow.__announcementCount = () => count;
    testWindow.__stopAnnouncementCounter = () => observer.disconnect();
  });
}

async function announcementCount(page: Page) {
  return page.evaluate(() => (window as unknown as { __announcementCount: () => number }).__announcementCount());
}

async function stopAnnouncementCounter(page: Page) {
  await page.evaluate(() => (window as unknown as { __stopAnnouncementCounter: () => void }).__stopAnnouncementCounter());
}

test.describe("phase 01 evidence relocated from bootstrap", () => {
  test("C2(a): :focus-visible produces a visible indicator on an injected native control", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      const probe = document.createElement("button");
      probe.id = "__c2a-focus-probe";
      probe.textContent = "focus probe";
      document.body.appendChild(probe);
    });
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    const outline = await page.locator("#__c2a-focus-probe").evaluate((element) => {
      const style = getComputedStyle(element);
      return { style: style.outlineStyle, width: style.outlineWidth, color: style.outlineColor, offset: style.outlineOffset };
    });
    await expect(page.locator("#__c2a-focus-probe")).toBeFocused();
    expect(outline).toEqual({ style: "solid", width: "2px", color: "rgb(122, 169, 255)", offset: "2px" });
  });

  test.describe("under prefers-reduced-motion: reduce", () => {
    test.use({ contextOptions: { reducedMotion: "reduce" } });

    test("C2(b): reduced motion collapses transition and animation durations", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      const probe = document.createElement("div");
      probe.id = "__c2b-motion-probe";
      probe.style.transitionDuration = "300ms";
      probe.style.transitionProperty = "opacity";
      probe.style.animationDuration = "300ms";
      document.body.appendChild(probe);
    });
    const durations = await page.locator("#__c2b-motion-probe").evaluate((element) => {
      const style = getComputedStyle(element);
      return { transition: Number.parseFloat(style.transitionDuration), animation: Number.parseFloat(style.animationDuration) };
    });
    expect(durations.transition).toBeLessThan(0.001);
      expect(durations.animation).toBeLessThan(0.001);
    });
  });

  const referenced = [...new Set([...GLOBALS_CSS.matchAll(/var\((--[\w-]+)/g)].map((match) => match[1]))];

  test("C3: the custom-property scan has a subject", () => {
    expect(referenced.length).toBeGreaterThan(0);
    expect(referenced).toEqual(expect.arrayContaining([
      "--color-bg",
      "--color-fg",
      "--color-fg-muted",
      "--color-focus",
      "--space-4",
      "--space-8",
    ]));
  });

  for (const property of referenced) {
    test(`C3(a): ${property} resolves`, async ({ page }) => {
      await page.goto("/");
      await expect.poll(() => page.evaluate((name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim(), property)).not.toBe("");
    });
  }

  test.describe("C7(a): design corrections remain landed", () => {
    test("correction 1: muted ink is lightened", async ({ page }) => {
      await page.goto("/");
      await expect.poll(() => page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--color-fg-quiet").trim().toLowerCase())).toBe("#84868c");
    });

    test("correction 2: unreadable ask-glyph ink is not exposed", async ({ page }) => {
      await page.goto("/");
      const names = [...THEME_CSS.matchAll(/(--color-fg-[\w-]+)\s*:/g)].map((match) => match[1]);
      expect(names.length).toBeGreaterThan(0);
      const values = await page.evaluate((properties) => properties.map((name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim().toLowerCase()), names);
      expect(values).not.toContain("#3a3c41");
    });

    test("correction 3: no darkened accent value was introduced", async ({ page }) => {
      await page.goto("/");
      await expect.poll(() => page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--color-accent").trim().toLowerCase())).toBe("#3b82f6");
    });

    test("correction 4: accent is not rendered as text on dark surfaces", async ({ page }) => {
      await page.goto("/");
      await page.evaluate(() => {
        const link = document.createElement("a");
        link.href = "#";
        link.id = "__c7a-link-probe";
        link.textContent = "probe";
        document.body.appendChild(link);
      });
      await expect(page.locator("#__c7a-link-probe")).toHaveCSS("color", "rgb(122, 169, 255)");
    });

    test("correction 5: global focus ring uses the corrected colour", async ({ page }) => {
      await page.goto("/");
      await page.evaluate(() => {
        const probe = document.createElement("button");
        probe.id = "__c7a-focus-probe";
        document.body.appendChild(probe);
      });
      await page.locator("#__c7a-focus-probe").focus();
      await expect(page.locator("#__c7a-focus-probe")).toBeFocused();
      await expect(page.locator("#__c7a-focus-probe")).toHaveCSS("outline-color", "rgb(122, 169, 255)");
    });

    test.describe("under prefers-reduced-motion: reduce", () => {
      test.use({ contextOptions: { reducedMotion: "reduce" } });

      test("correction 6: reduced motion collapses a non-none animation", async ({ page }) => {
      await page.goto("/");
      await page.evaluate(() => {
        const probe = document.createElement("div");
        probe.id = "__c7a-motion-probe";
        probe.style.animationName = "spin";
        probe.style.animationDuration = "300ms";
        document.body.appendChild(probe);
      });
        await expect(page.locator("#__c7a-motion-probe")).not.toHaveCSS("animation-name", "none");
        await expect.poll(() => page.locator("#__c7a-motion-probe").evaluate((element) => Number.parseFloat(getComputedStyle(element).animationDuration))).toBeLessThan(0.001);
      });
    });

    test("correction 6: no-preference preserves a non-none animation duration", async ({ page }) => {
      await page.goto("/");
      await page.evaluate(() => {
        const probe = document.createElement("div");
        probe.id = "__c7a-motion-probe-no-preference";
        probe.style.animationName = "spin";
        probe.style.animationDuration = "300ms";
        document.body.appendChild(probe);
      });
      await expect(page.locator("#__c7a-motion-probe-no-preference")).not.toHaveCSS("animation-name", "none");
      await expect.poll(() => page.locator("#__c7a-motion-probe-no-preference").evaluate((element) => Number.parseFloat(getComputedStyle(element).animationDuration))).toBeGreaterThan(0.001);
    });
  });
});

test("inherited phase 01 evidence: renders the document title with no client or server error", async ({ page }) => {
  const pageErrors: Error[] = [];
  page.on("pageerror", (error) => pageErrors.push(error));
  const response = await page.goto("/");
  expect(response?.ok()).toBe(true);
  await expect(page).toHaveTitle("Proposal Copilot");
  expect(pageErrors).toEqual([]);
});

test("C1(d): the skip link is the first tab stop and becomes visible", async ({ page }) => {
  await page.goto("/");
  const skipLink = page.getByRole("link", { name: "Skip to main content" });
  await page.keyboard.press("Tab");
  await expect(skipLink).toBeFocused();
  await expect(skipLink).toBeVisible();
});

test("C1(e): activating the skip link moves focus into main", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("main")).toBeFocused();
});

test("C1(a): exactly one named complementary region", async ({ page }) => {
  await page.goto("/");
  const regions = page.getByRole("complementary");
  await expect(regions).toHaveCount(1);
  await expect(regions).toHaveAccessibleName("Proposal agent");
  await expect(page.getByRole("main")).toHaveAccessibleName("Proposal preparation");
});

test("C1(b): exactly one main", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("main")).toHaveCount(1);
});

test("C1(f): landmarks retain node identity after a keyboard resize", async ({ page }) => {
  await page.goto("/");
  const divider = page.getByRole("separator");
  const beforeWidth = await divider.getAttribute("aria-valuenow");
  const beforeComplementary = await page.evaluateHandle(() => document.querySelector("aside"));
  const beforeMain = await page.evaluateHandle(() => document.querySelector("main"));
  await divider.focus();
  await page.keyboard.press("ArrowRight");
  await expect.poll(() => divider.getAttribute("aria-valuenow")).not.toBe(beforeWidth);
  const afterComplementary = await page.evaluateHandle(() => document.querySelector("aside"));
  const afterMain = await page.evaluateHandle(() => document.querySelector("main"));
  expect(await beforeComplementary.evaluate((node, current) => node === current, afterComplementary)).toBe(true);
  expect(await beforeMain.evaluate((node, current) => node === current, afterMain)).toBe(true);
  await beforeComplementary.dispose();
  await beforeMain.dispose();
  await afterComplementary.dispose();
  await afterMain.dispose();
});

test("C2(a): divider exposes separator semantics and values", async ({ page }) => {
  await page.goto("/");
  const divider = page.getByRole("separator");
  await expect(divider).toHaveAttribute("aria-orientation", "vertical");
  await expect(divider).toHaveAccessibleName("Resize agent panel");
  await expect(divider).toHaveAttribute("aria-valuenow");
  await expect(divider).toHaveAttribute("aria-valuemin", String(AGENT_PANE_MIN_PX));
  await expect(divider).toHaveAttribute("aria-valuemax");
  const values = await divider.evaluate((element) => ({
    now: Number(element.getAttribute("aria-valuenow")),
    min: Number(element.getAttribute("aria-valuemin")),
    max: Number(element.getAttribute("aria-valuemax")),
  }));
  expect(values.now).toBeGreaterThanOrEqual(values.min);
  expect(values.now).toBeLessThanOrEqual(values.max);
});

test("C2(b): effective maximum changes with the viewport", async ({ page }) => {
  const threshold = AGENT_PANE_MAX_PX + MAIN_PANE_MIN_PX;
  const widths = [threshold - 1, threshold - AGENT_PANE_MIN_PX];
  const preObserverMax = getEffectiveDividerMax(threshold);
  const settled = [];
  for (const width of widths) {
    await page.setViewportSize({ width, height: 800 });
    await page.goto("/");
    const divider = page.getByRole("separator");
    await expect.poll(() => divider.getAttribute("aria-valuemax")).not.toBe(String(preObserverMax));
    const value = Number(await divider.getAttribute("aria-valuemax"));
    expect(value).toBe(getEffectiveDividerMax(width));
    settled.push(value);
  }
  expect(settled[0]).not.toBe(settled[1]);
});

const keyboardRows = [
  ["arrow decrease", "ArrowLeft", false, AGENT_PANE_DEFAULT_PX - DIVIDER_KEYBOARD_STEP_PX],
  ["arrow increase", "ArrowRight", false, AGENT_PANE_DEFAULT_PX + DIVIDER_KEYBOARD_STEP_PX],
  ["shifted decrease", "ArrowLeft", true, AGENT_PANE_DEFAULT_PX - DIVIDER_KEYBOARD_LARGE_STEP_PX],
  ["shifted increase", "ArrowRight", true, AGENT_PANE_DEFAULT_PX + DIVIDER_KEYBOARD_LARGE_STEP_PX],
  ["Home", "Home", false, 0],
  ["End", "End", false, Number.NaN],
  ["Enter reset", "Enter", false, AGENT_PANE_DEFAULT_PX],
  ["Space reset", " ", false, AGENT_PANE_DEFAULT_PX],
] as const;

for (const [label, key, shiftKey, requested] of keyboardRows) {
  test(`C2(c): ${label} changes width and retains focus`, async ({ page }) => {
    await page.setViewportSize({ width: 1100, height: 800 });
    await page.goto("/");
    const divider = page.getByRole("separator");
    await expect(divider).toHaveAttribute("aria-valuemax", String(getEffectiveDividerMax(1100)));
    await divider.focus();
    if (shiftKey) await page.keyboard.down("Shift");
    await page.keyboard.press(key);
    if (shiftKey) await page.keyboard.up("Shift");
    const containerWidth = await page.locator("[data-workspace-root]").evaluate((element) => element.clientWidth);
    const expected = label === "End" ? Number(await divider.getAttribute("aria-valuemax")) : expectedWidth(requested, containerWidth);
    await expect(divider).toHaveAttribute("aria-valuenow", String(expected));
    await expect(divider).toBeFocused();
  });
}

test("C2(d): reset announces once and drag announces nothing", async ({ page }) => {
  await page.goto("/");
  const divider = page.getByRole("separator");
  const live = page.locator("[data-divider-announcement]");
  await expect(live).toHaveText("");
  await installAnnouncementCounter(page);
  await divider.focus();
  for (const key of ["ArrowLeft", "ArrowRight", "Home", "End"]) {
    await page.keyboard.press(key);
    await expect.poll(() => announcementCount(page)).toBe(0);
  }
  const box = await divider.boundingBox();
  if (!box) throw new Error("Divider has no browser box");
  await page.mouse.move(box.x + box.width / 2, box.y + 20);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 20, box.y + 20);
  await page.mouse.up();
  await expect.poll(() => announcementCount(page)).toBe(0);
  await page.keyboard.press("Enter");
  await expect(live).toHaveAttribute("aria-live", "polite");
  await expect.poll(() => announcementCount(page)).toBe(1);
  await stopAnnouncementCounter(page);
});

test("C2(e): divider is reachable from the document start", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("separator")).toBeFocused();
});

test("C2(f): double-click resets and announces once", async ({ page }) => {
  await page.goto("/");
  const divider = page.getByRole("separator");
  await installAnnouncementCounter(page);
  await divider.dblclick();
  await expect(divider).toHaveAttribute("aria-valuenow", String(AGENT_PANE_DEFAULT_PX));
  await expect.poll(() => announcementCount(page)).toBe(1);
  await stopAnnouncementCounter(page);
});

test("C2(g): two consecutive resets produce two announcements", async ({ page }) => {
  await page.goto("/");
  const divider = page.getByRole("separator");
  await installAnnouncementCounter(page);
  await divider.focus();
  await page.keyboard.press("Enter");
  await page.keyboard.press("Enter");
  await expect.poll(() => announcementCount(page)).toBe(2);
  await stopAnnouncementCounter(page);
});

test.describe("C4: narrow-width conditions", () => {
  for (const width of NARROW_WIDTH_TEST_SET) {
    test(`C4(${width}-1): document has no horizontal overflow`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto("/");
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    });

    test(`C4(${width}-2): panes have no undeclared horizontal overflow`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto("/");
      for (const pane of [page.getByRole("complementary"), page.getByRole("main")]) {
        const overflowNodes = await pane.evaluate((element) => {
          const nodes = [element as HTMLElement, ...element.querySelectorAll<HTMLElement>("*")];
          return nodes.map((node) => ({
            scrollWidth: node.scrollWidth,
            clientWidth: node.clientWidth,
            authoredHorizontalScroll:
              node.classList.contains("overflow-x-auto") ||
              node.classList.contains("overflow-x-scroll") ||
              ["auto", "scroll"].includes(node.style.overflowX) ||
              node.hasAttribute("data-horizontal-scroll"),
          }));
        });
        expect(overflowNodes.every((node) => node.scrollWidth <= node.clientWidth || node.authoredHorizontalScroll)).toBe(true);
      }
      for (const pane of [page.getByRole("complementary"), page.getByRole("main")]) {
        const dimensions = await Promise.all([
          pane.locator("div").evaluateAll((elements) => elements.map((element) => element.getBoundingClientRect().width)),
          pane.evaluate((element) => element.clientWidth),
        ]);
        expect(dimensions[0].every((width) => width <= dimensions[1])).toBe(true);
      }
    });

    test(`C4(${width}-3): every phase control is keyboard reachable`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto("/");
      await page.keyboard.press("Tab");
      await expect(page.getByRole("link", { name: "Skip to main content" })).toBeFocused();
      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab");
      await expect(page.getByRole("separator")).toBeFocused();
    });

    test(`C4(${width}-4): text is rendered and elided names retain their full value`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto("/");
      const elided = page.locator("[data-elided]");
      const subjects = await elided.evaluateAll((elements) => elements.map((element, index) => ({
        index,
        width: element.scrollWidth,
        clientWidth: element.clientWidth,
        text: element.textContent ?? "",
      })).filter((element) => element.width > element.clientWidth));
      if (subjects.length === 0) {
        test.info().annotations.push({
          type: "unmeasured",
          description: `No product text elides at ${width}px in the phase-02 shell`,
        });
        return;
      }
      expect(subjects.length).toBeGreaterThan(0);
      for (const subject of subjects) {
        const element = elided.nth(subject.index);
        expect(subject.text).not.toBe("");
        await expect(element).toHaveAccessibleName(subject.text);
      }
    });

    test(`C4(${width}-5): agent pane stays above its minimum`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto("/");
      await page.getByRole("separator").focus();
      await page.keyboard.press("ArrowLeft");
      const agent = page.getByRole("complementary");
      expect(await agent.evaluate((element) => element.getBoundingClientRect().width)).toBeGreaterThanOrEqual(AGENT_PANE_MIN_PX);
    });
  }
});

test("C6(a): idle subtree contains no proposition, list, statistics, or navigation", async ({ page }) => {
  await page.goto("/");
  const idle = page.getByTestId("proposal-preparation-idle");
  expect(await accessibleRoles(page, '[data-testid="proposal-preparation-idle"]')).toEqual(["heading"]);
  await expect(idle.getByRole("heading")).toHaveCount(1);
});

test("C6(b): idle content is inside the one main", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("main").getByTestId("proposal-preparation-idle")).toBeVisible();
});

test("C6(c): idle subtree has no navigation affordance", async ({ page }) => {
  await page.goto("/");
  const idle = page.getByTestId("proposal-preparation-idle");
  await expect(idle.locator("a[href]")).toHaveCount(0);
});

test("C6(d): idle first render moves no focus into itself", async ({ page }) => {
  await page.goto("/");
  expect(await page.getByTestId("proposal-preparation-idle").evaluate((node) => node.contains(document.activeElement))).toBe(false);
});

test("C6(e): idle first render carries no live announcement", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("proposal-preparation-idle").locator("[aria-live], [role=status], [role=alert]")).toHaveCount(0);
});
