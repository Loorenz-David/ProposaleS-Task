import { describe, expect, it } from "vitest";

import { cx } from "./cx";

describe("cx", () => {
    it("joins truthy class names and drops the rest", () => {
        expect(cx("a", undefined, false, null, "b")).toBe("a b");
        expect(cx()).toBe("");
    });
});
