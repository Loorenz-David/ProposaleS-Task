import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Textarea } from "./textarea";

describe("Textarea", () => {
    it("is a native textarea reachable by its label", () => {
        render(
            <>
                <label htmlFor="notes">Notes</label>
                <Textarea id="notes" name="notes" rows={6} className="extra" />
            </>,
        );

        const textarea = screen.getByLabelText("Notes");
        expect(textarea.tagName).toBe("TEXTAREA");
        expect(textarea).toHaveAttribute("rows", "6");
        expect(textarea).toHaveClass("extra");
    });
});
