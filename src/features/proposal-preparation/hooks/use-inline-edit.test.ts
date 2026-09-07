import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useInlineEdit } from "./use-inline-edit";

describe("useInlineEdit", () => {
  it("keeps exactly one path active and commits it", () => {
    const onCommit = vi.fn();
    const { result } = renderHook(() => useInlineEdit(onCommit));
    act(() => result.current.startEdit(["title"]));
    expect(result.current.editingPath).toEqual(["title"]);
    act(() => result.current.startEdit(["blocks", "0", "quantity"]));
    expect(result.current.editingPath).toEqual(["blocks", "0", "quantity"]);
    act(() => result.current.commit("2"));
    expect(onCommit).toHaveBeenCalledWith({ path: ["blocks", "0", "quantity"], value: "2" });
    expect(result.current.editingPath).toBeNull();
  });

  it("cancels without committing", () => {
    const onCommit = vi.fn();
    const onCancel = vi.fn();
    const { result } = renderHook(() => useInlineEdit(onCommit, onCancel));
    act(() => result.current.startEdit(["title"]));
    act(() => result.current.cancel());
    expect(result.current.editingPath).toBeNull();
    expect(onCommit).not.toHaveBeenCalled();
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it("refuses a second edit while a save is in flight", () => {
    const onCommit = vi.fn();
    const { result } = renderHook(() => useInlineEdit(onCommit, undefined, () => false));
    act(() => result.current.startEdit(["title"]));
    expect(result.current.editingPath).toBeNull();
  });
});
