import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import type { EditableLeafViewModel } from "../../client/view-models/review";
import { InlineEditableValue } from "./inline-editable-value";

const leaf: EditableLeafViewModel = { path: ["title"], label: "Title", kind: "text", display: "Current title", isAbsent: false, provenance: { class: "human", text: "Set by you" }, editStatus: { status: "idle" }, validationMessage: null };

function Harness({ onCommit = vi.fn() }: { onCommit?: (value: string) => void }) {
  const [editing, setEditing] = useState(false);
  return <InlineEditableValue canEdit isEditing={editing} leaf={leaf} onCancel={() => setEditing(false)} onCommit={(value) => { onCommit(value); setEditing(false); }} onStartEdit={() => setEditing(true)} />;
}

describe("InlineEditableValue", () => {
  it("commits on Enter and returns focus to the trigger", () => {
    const onCommit = vi.fn();
    render(<Harness onCommit={onCommit} />);
    fireEvent.click(screen.getByRole("button", { name: "Edit Title, currently Current title" }));
    const input = screen.getByRole("textbox", { name: "Edit Title" });
    expect(input).toHaveFocus();
    fireEvent.change(input, { target: { value: "Updated" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onCommit).toHaveBeenCalledWith("Updated");
    expect(screen.getByRole("button", { name: "Edit Title, currently Current title" })).toHaveFocus();
  });

  it("cancels on Escape and renders saving, failure, and validation states", () => {
    const { rerender } = render(<Harness />);
    fireEvent.click(screen.getByRole("button"));
    fireEvent.keyDown(screen.getByRole("textbox"), { key: "Escape" });
    expect(screen.getByRole("button")).toHaveFocus();
    rerender(<InlineEditableValue canEdit isEditing={false} leaf={{ ...leaf, editStatus: { status: "saving" } }} onCancel={vi.fn()} onCommit={vi.fn()} onStartEdit={vi.fn()} />);
    expect(screen.getByText("Saving")).toBeInTheDocument();
    rerender(<InlineEditableValue canEdit isEditing={false} leaf={{ ...leaf, editStatus: { status: "failed", message: "Save failed" }, validationMessage: "Use a clearer title" }} onCancel={vi.fn()} onCommit={vi.fn()} onStartEdit={vi.fn()} />);
    expect(screen.getByText("Save failed")).toBeInTheDocument();
    expect(screen.getByText("Use a clearer title")).toBeInTheDocument();
  });

  it("R5.2: keeps the server value rendered until a new view model arrives", () => {
    const onCommit = vi.fn();
    render(<Harness onCommit={onCommit} />);
    fireEvent.click(screen.getByRole("button", { name: /Edit Title/ }));
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "Typed but not saved" } });
    fireEvent.keyDown(screen.getByRole("textbox"), { key: "Enter" });
    expect(onCommit).toHaveBeenCalledWith("Typed but not saved");
    expect(screen.getByRole("button", { name: "Edit Title, currently Current title" })).toHaveTextContent("Current title");
    expect(screen.queryByText("Typed but not saved")).toBeNull();
  });
});
