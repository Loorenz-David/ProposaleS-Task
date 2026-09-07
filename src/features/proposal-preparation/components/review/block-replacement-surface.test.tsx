import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { BlockReplacementSurface } from "./block-replacement-surface";

describe("BlockReplacementSurface", () => {
  it("preserves alternative order and emits the returned id", () => {
    const onSelect = vi.fn();
    render(<BlockReplacementSurface alternatives={[
      { variationId: "weak", title: "First", matchStrength: "weak", reason: "One" },
      { variationId: "strong", title: "Second", matchStrength: "strong", reason: "Two" },
    ]} isSubmitting={false} onClose={vi.fn()} onSelect={onSelect} />);
    expect(screen.getAllByRole("button").map((button) => button.textContent)).toEqual(["Close", "FirstweakOne", "SecondstrongTwo"]);
    fireEvent.click(screen.getByRole("button", { name: /Second/ }));
    expect(onSelect).toHaveBeenCalledWith("strong");
  });

  it("states honestly when no alternatives exist", () => {
    render(<BlockReplacementSurface alternatives={[]} isSubmitting={false} onClose={vi.fn()} onSelect={vi.fn()} />);
    expect(screen.getByText("No alternatives were returned for this item.")).toBeInTheDocument();
  });
});
