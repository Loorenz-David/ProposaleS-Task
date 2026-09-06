import { readFileSync } from "node:fs";
import path from "node:path";

import { expect, test } from "@playwright/test";

/**
 * Phase 01's browser-measured rows (C2, C3, C7(a)) live here rather than in Vitest: master
 * plan §10.3A establishes that no configured Vitest project can measure a rendered document's
 * computed style in this repository (jsdom does not resolve `var()`, has no media-query
 * facility, and never receives the processed stylesheet at all). The application renders no
 * component of its own yet (task 6) — the subject of these rows is a native control each test
 * injects into the running `/` document and disposes with the page, inheriting the real,
 * PostCSS-processed global stylesheet.
 */

const REPO_ROOT = path.resolve(__dirname, "..");
const GLOBALS_CSS = readFileSync(path.join(REPO_ROOT, "src/styles/globals.css"), "utf-8");
const THEME_CSS = readFileSync(path.join(REPO_ROOT, "src/styles/theme.css"), "utf-8");

test("renders the document title with no client or server error", async ({ page }) => {
  const pageErrors: Error[] = [];
  page.on("pageerror", (error) => pageErrors.push(error));

  const response = await page.goto("/");

  expect(response?.ok()).toBe(true);
  await expect(page).toHaveTitle("Proposal Copilot");
  expect(pageErrors).toEqual([]);
});

test.describe("C2: global accessibility treatment, reachable by the shipped default configuration", () => {
  test("C2(a): :focus-visible produces a visible indicator on an injected native control", async ({
    page,
  }) => {
    await page.goto("/");
    await page.evaluate(() => {
      const probe = document.createElement("button");
      probe.id = "__c2a-focus-probe";
      probe.textContent = "focus probe";
      document.body.appendChild(probe);
    });

    // The injected control is the page's only focusable element (page.tsx renders null), so
    // one Tab reaches it via real keyboard navigation — the same mechanism :focus-visible
    // is designed to distinguish from pointer interaction.
    await page.keyboard.press("Tab");
    const probe = page.locator("#__c2a-focus-probe");
    await expect(probe).toBeFocused();

    const outline = await probe.evaluate((el) => {
      const style = getComputedStyle(el);
      return {
        style: style.outlineStyle,
        width: style.outlineWidth,
        color: style.outlineColor,
        offset: style.outlineOffset,
      };
    });

    expect(outline.style).toBe("solid");
    expect(outline.width).toBe("2px");
    expect(outline.offset).toBe("2px");
    expect(outline.color).toBe("rgb(122, 169, 255)"); // #7aa9ff, design 01 §5 correction 5

    await page.evaluate(() => document.getElementById("__c2a-focus-probe")?.remove());
  });

  test.describe("under prefers-reduced-motion: reduce", () => {
    test.use({ contextOptions: { reducedMotion: "reduce" } });

    test("C2(b): transition and animation durations collapse for every element", async ({ page }) => {
      await page.goto("/");
      await page.evaluate(() => {
        const probe = document.createElement("div");
        probe.id = "__c2b-motion-probe";
        probe.style.transitionDuration = "300ms";
        probe.style.transitionProperty = "opacity";
        probe.style.animationDuration = "300ms";
        probe.style.animationName = "none";
        document.body.appendChild(probe);
      });

      const durations = await page
        .locator("#__c2b-motion-probe")
        .evaluate((el) => {
          const style = getComputedStyle(el);
          return {
            transition: style.transitionDuration,
            animation: style.animationDuration,
          };
        });

      // Browsers normalize computed time values to seconds; 0.01ms == 0.00001s. Compared as
      // a parsed float (tolerant of unit formatting) rather than an exact string, since this
      // is a continuous measured value, not a choice between qualitatively different outcomes.
      expect(Number.parseFloat(durations.transition)).toBeLessThan(0.001);
      expect(Number.parseFloat(durations.animation)).toBeLessThan(0.001);

      await page.evaluate(() => document.getElementById("__c2b-motion-probe")?.remove());
    });
  });
});

test.describe("C3: every custom property globals.css references resolves", () => {
  const referenced = [...new Set([...GLOBALS_CSS.matchAll(/var\((--[\w-]+)/g)].map((m) => m[1]))];
  const caveatPropertiesStillReferenced = [
    "--color-bg",
    "--color-fg",
    "--color-fg-muted",
    "--color-focus",
    "--space-4",
    "--space-8",
  ];

  test("the file references at least one custom property (the scan has a subject)", () => {
    expect(referenced.length).toBeGreaterThan(0);
    expect(referenced).toEqual(expect.arrayContaining(caveatPropertiesStillReferenced));
  });

  // Enumerated, not sampled: one test per property this file actually references, derived
  // from the file itself so the count is never typed forward.
  for (const property of referenced) {
    test(`C3(a): ${property} resolves to a non-empty computed value`, async ({ page }) => {
      await page.goto("/");
      const value = await page.evaluate(
        (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim(),
        property,
      );
      expect(value).not.toBe("");
    });
  }
});

test.describe("C7(a): design 01 §5's required corrections are the values that landed", () => {
  test("correction 1: the muted ink ramp is lightened (--color-fg-quiet)", async ({ page }) => {
    await page.goto("/");
    const value = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue("--color-fg-quiet").trim(),
    );
    expect(value.toLowerCase()).toBe("#84868c");
  });

  test("correction 2: no ink custom property exposes the un-readable ask-glyph value (#3a3c41)", async ({
    page,
  }) => {
    await page.goto("/");
    const inkPropertyNames = [...THEME_CSS.matchAll(/(--color-fg-[\w-]+)\s*:/g)].map(
      (match) => match[1],
    );
    expect(inkPropertyNames.length).toBeGreaterThan(0);
    const inkValues = await page.evaluate((propertyNames) => {
      const style = getComputedStyle(document.documentElement);
      return propertyNames.map((name) => style.getPropertyValue(name).trim().toLowerCase());
    }, inkPropertyNames);
    expect(inkValues).not.toContain("#3a3c41");
  });

  test("correction 3: no separate darkened accent value was introduced (--color-accent unchanged)", async ({
    page,
  }) => {
    await page.goto("/");
    const value = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue("--color-accent").trim(),
    );
    expect(value.toLowerCase()).toBe("#3b82f6");
  });

  test("correction 4: the accent is never rendered as text on a dark surface", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      const link = document.createElement("a");
      link.id = "__c7a-link-probe";
      link.href = "#";
      link.textContent = "probe";
      document.body.appendChild(link);
    });
    const color = await page.locator("#__c7a-link-probe").evaluate((el) => getComputedStyle(el).color);
    expect(color).toBe("rgb(122, 169, 255)"); // accent-ink-on-dark, never rgb(59, 130, 246)
    await page.evaluate(() => document.getElementById("__c7a-link-probe")?.remove());
  });

  test("correction 5: the global focus ring (measured directly; shares its subject with C2(a))", async ({
    page,
  }) => {
    await page.goto("/");
    await page.evaluate(() => {
      const probe = document.createElement("button");
      probe.id = "__c7a-focus-probe";
      document.body.appendChild(probe);
    });
    const focusProbe = page.locator("#__c7a-focus-probe");
    await focusProbe.focus();
    await expect(focusProbe).toBeFocused();
    const color = await focusProbe.evaluate((el) => getComputedStyle(el).outlineColor);
    expect(color).toBe("rgb(122, 169, 255)");
    await page.evaluate(() => document.getElementById("__c7a-focus-probe")?.remove());
  });

  test.describe("correction 6: per-animation reduced motion treatment", () => {
    test.describe("under prefers-reduced-motion: reduce", () => {
      test.use({ contextOptions: { reducedMotion: "reduce" } });

      test("collapses a non-none animation on the running document", async ({ page }) => {
        await page.goto("/");
        await page.evaluate(() => {
          const probe = document.createElement("div");
          probe.id = "__c7a-motion-probe";
          probe.style.animationName = "spin";
          probe.style.animationDuration = "300ms";
          document.body.appendChild(probe);
        });

        const animation = await page.locator("#__c7a-motion-probe").evaluate((el) => {
          const style = getComputedStyle(el);
          return { name: style.animationName, duration: style.animationDuration };
        });
        expect(animation.name).not.toBe("none");
        expect(Number.parseFloat(animation.duration)).toBeLessThan(0.001);
        await page.evaluate(() => document.getElementById("__c7a-motion-probe")?.remove());
      });
    });

    test.describe("under no-preference", () => {
      test.use({ contextOptions: { reducedMotion: "no-preference" } });

      test("does not collapse a non-none animation on the running document", async ({ page }) => {
        await page.goto("/");
        await page.evaluate(() => {
          const probe = document.createElement("div");
          probe.id = "__c7a-motion-probe";
          probe.style.animationName = "spin";
          probe.style.animationDuration = "300ms";
          document.body.appendChild(probe);
        });

        const animation = await page.locator("#__c7a-motion-probe").evaluate((el) => {
          const style = getComputedStyle(el);
          return { name: style.animationName, duration: style.animationDuration };
        });
        expect(animation.name).not.toBe("none");
        expect(Number.parseFloat(animation.duration)).toBeGreaterThan(0.001);
        await page.evaluate(() => document.getElementById("__c7a-motion-probe")?.remove());
      });
    });
  });
});
