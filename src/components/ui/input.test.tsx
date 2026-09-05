import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Input } from "./input";

describe("Input", () => {
    it("is a native input reachable by its label", () => {
        render(
            <>
                <label htmlFor="email">Email</label>
                <Input id="email" name="email" type="email" className="extra" />
            </>,
        );

        const input = screen.getByLabelText("Email");
        expect(input.tagName).toBe("INPUT");
        expect(input).toHaveAttribute("type", "email");
        expect(input).toHaveAttribute("name", "email");
        expect(input).toHaveClass("extra");
    });
});
