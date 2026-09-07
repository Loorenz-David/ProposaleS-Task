import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { WorkSurfaceToggle } from "./work-surface-toggle";

describe("WorkSurfaceToggle", () => {
  it("uses a radio group and announces the selected surface once", () => {
    const onChange = vi.fn();
    render(<WorkSurfaceToggle onChange={onChange} value="fields" />);
    expect(screen.getByRole("radio", { name: "Fields" })).toBeChecked();
    fireEvent.click(screen.getByRole("radio", { name: "Client Preview" }));
    expect(onChange).toHaveBeenCalledWith("preview");
    expect(screen.getByText("Showing client preview")).toHaveAttribute("aria-live", "polite");
  });
});
