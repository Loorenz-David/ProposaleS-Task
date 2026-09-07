import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";

import type { BlockViewModel, EditableLeafViewModel } from "../../client/view-models/review";
import { ReviewBlocksCard } from "./review-blocks-card";

beforeAll(() => {
  // jsdom implements the element but not the modal, which is all these assertions need.
  HTMLDialogElement.prototype.showModal = function showModal() {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function close() {
    this.removeAttribute("open");
  };
});

function leaf(path: string[], label: string, display: string): EditableLeafViewModel {
  return {
    path,
    label,
    kind: "text",
    display,
    isAbsent: false,
    provenance: { class: "sourced", text: null },
    editStatus: { status: "idle" },
    validationMessage: null,
  };
}

const block: BlockViewModel = {
  index: 0,
  contentId: "188485",
  title: "Classic King Room",
  description: "Comfortable king room.",
  replacedByHuman: false,
  quantity: leaf(["blocks", "0", "quantity"], "Qty", "24"),
  optional: leaf(["blocks", "0", "optional"], "Optional", "No"),
  reviewerComment: leaf(["blocks", "0", "reviewerComment"], "Comment", "Not set"),
  pricingStatement: "Pricing comes from the content library.",
  alternatives: [],
};

const ignore = () => {};

function renderCard(overrides: Partial<Parameters<typeof ReviewBlocksCard>[0]> = {}) {
  const onRemoveBlock = vi.fn();
  render(
    <ReviewBlocksCard
      blocks={[block]}
      canEdit
      editingPath={null}
      isSubmitting={false}
      onCancel={ignore}
      onCloseBlock={ignore}
      onCommit={ignore}
      onOpenBlock={ignore}
      onRemoveBlock={onRemoveBlock}
      onReplaceBlock={ignore}
      onStartEdit={ignore}
      openedBlock={null}
      {...overrides}
    />,
  );
  return { onRemoveBlock };
}

describe("ReviewBlocksCard", () => {
  it("names the item in the remove control and removes nothing until it is confirmed", () => {
    const { onRemoveBlock } = renderCard();
    fireEvent.click(screen.getByRole("button", { name: "Remove Classic King Room" }));

    const dialog = screen.getByRole("dialog", { name: "Remove Classic King Room?" });
    expect(dialog).toHaveTextContent("quantity 24");
    expect(onRemoveBlock).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onRemoveBlock).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Remove Classic King Room" }));
    fireEvent.click(screen.getByRole("button", { name: "Remove line item" }));
    expect(onRemoveBlock).toHaveBeenCalledWith({ blockIndex: 0 });
  });

  it("keeps the replace action labelled, since an icon alone would not carry it", () => {
    renderCard();
    expect(screen.getByRole("button", { name: "Replace" })).toBeInTheDocument();
  });

  it("shows the catalog image when there is one and nothing but the frame when there is not", () => {
    const { container } = render(
      <ReviewBlocksCard
        blocks={[block]}
        canEdit={false}
        editingPath={null}
        images={{ "188485": { status: "ready", url: "https://cdn.proposales.test/king.png" } }}
        isSubmitting={false}
        onCancel={ignore}
        onCloseBlock={ignore}
        onCommit={ignore}
        onOpenBlock={ignore}
        onRemoveBlock={ignore}
        onReplaceBlock={ignore}
        onStartEdit={ignore}
        openedBlock={null}
      />,
    );
    const image = container.querySelector("img");
    expect(image).toHaveAttribute("src", "https://cdn.proposales.test/king.png");
    // Decorative: the title beside it already names the item.
    expect(image).toHaveAttribute("alt", "");
    expect(screen.queryByRole("button", { name: "Replace" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^Remove/ })).not.toBeInTheDocument();
  });

  it("renders no image element while the fetch is still open", () => {
    const { container } = render(
      <ReviewBlocksCard
        blocks={[block]}
        canEdit={false}
        editingPath={null}
        images={{ "188485": { status: "pending" } }}
        isSubmitting={false}
        onCancel={ignore}
        onCloseBlock={ignore}
        onCommit={ignore}
        onOpenBlock={ignore}
        onRemoveBlock={ignore}
        onReplaceBlock={ignore}
        onStartEdit={ignore}
        openedBlock={null}
      />,
    );
    expect(container.querySelector("img")).toBeNull();
  });
});
