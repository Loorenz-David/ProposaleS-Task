import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Home from "./page";

describe("Home", () => {
    it("renders the foundation heading", () => {
        render(<Home />);

        expect(
            screen.getByRole("heading", { level: 1, name: "Application foundation" }),
        ).toBeInTheDocument();
    });

    it("renders labeled primitives", () => {
        render(<Home />);

        expect(screen.getByLabelText("Text input")).toBeInTheDocument();
        expect(screen.getByLabelText("Multiline input")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Primary action" })).toBeEnabled();
        expect(screen.getByRole("button", { name: "Disabled" })).toBeDisabled();
    });
});
