import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { beforeAll, describe, expect, it } from "vitest";

import { ConfirmDialog } from "./confirm-dialog";

const openers = new WeakMap<HTMLDialogElement, HTMLElement>();

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function showModal() {
    openers.set(this, document.activeElement as HTMLElement);
    this.setAttribute("open", "");
    this.querySelector<HTMLButtonElement>("button")?.focus();
  };
  HTMLDialogElement.prototype.close = function close() {
    this.removeAttribute("open");
    openers.get(this)?.focus();
  };
});

function Harness() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>Open confirmation</button>
      <ConfirmDialog confirmLabel="Discard" description="Your proposition edits will be lost." onCancel={() => setOpen(false)} onConfirm={() => setOpen(false)} open={open} title="Discard proposition?" />
    </>
  );
}

describe("ConfirmDialog", () => {
  it("opens modally, closes on cancel, and returns focus", async () => {
    render(<Harness />);
    const opener = screen.getByRole("button", { name: "Open confirmation" });
    opener.focus();
    fireEvent.click(opener);
    const dialog = screen.getByRole("dialog", { name: "Discard proposition?" });
    expect(dialog).toHaveAttribute("open");
    expect(screen.getByRole("button", { name: "Cancel" })).toHaveFocus();
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    await waitFor(() => expect(dialog).not.toHaveAttribute("open"));
    expect(opener).toHaveFocus();
  });
});
