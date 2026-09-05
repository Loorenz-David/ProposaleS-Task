import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Button } from "./button";

describe("Button", () => {
    it("renders a native button that does not submit by default", () => {
        render(<Button>Save</Button>);

        const button = screen.getByRole("button", { name: "Save" });
        expect(button.tagName).toBe("BUTTON");
        expect(button).toHaveAttribute("type", "button");
    });

    it("forwards native props and composes className", () => {
        render(
            <Button type="submit" disabled className="extra" aria-describedby="hint">
                Submit
            </Button>,
        );

        const button = screen.getByRole("button", { name: "Submit" });
        expect(button).toHaveAttribute("type", "submit");
        expect(button).toBeDisabled();
        expect(button).toHaveAttribute("aria-describedby", "hint");
        expect(button).toHaveClass("extra");
        expect(button.classList.length).toBeGreaterThan(1);
    });
});
