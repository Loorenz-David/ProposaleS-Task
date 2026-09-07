"use client";

import { useCallback, useState } from "react";

export function useInlineEdit(
  onCommit: (edit: { path: string[]; value: string }) => void,
  onCancel?: () => void,
  canStart: (path: string[]) => boolean = () => true,
) {
  const [editingPath, setEditingPath] = useState<string[] | null>(null);
  const startEdit = useCallback((path: string[]) => {
    if (canStart(path)) setEditingPath(path);
  }, [canStart]);
  const cancel = useCallback(() => {
    setEditingPath(null);
    onCancel?.();
  }, [onCancel]);
  const commit = useCallback(
    (value: string) => {
      if (!editingPath) return;
      onCommit({ path: editingPath, value });
      setEditingPath(null);
    },
    [editingPath, onCommit],
  );
  return { editingPath, startEdit, cancel, commit };
}
