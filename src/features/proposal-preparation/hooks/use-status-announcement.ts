"use client";

import { useEffect, useRef, useState } from "react";

import { toTabViewModel } from "../client/view-models/session-tab";
import type { SessionRuntimeRecord } from "../types/session";
import { STATUS_ANNOUNCEMENT_DEBOUNCE_MS } from "../components/session-tabs/session-tabs-constants";

export function useStatusAnnouncement(
  records: Array<SessionRuntimeRecord | undefined>,
  _activeSessionId: SessionRuntimeRecord["id"] | null,
  refusalMessage?: string,
) {
  const [announcement, setAnnouncement] = useState("");
  const previousStatuses = useRef(new Map<string, string>());
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const presentRecords = records.filter((record): record is SessionRuntimeRecord => record !== undefined);
    const nextStatuses = new Map(presentRecords.map((record) => [record.id, toTabViewModel(record).status]));
    const changed = presentRecords.find((record) => {
      const previous = previousStatuses.current.get(record.id);
      return previous !== undefined && previous !== nextStatuses.get(record.id);
    });
    previousStatuses.current = nextStatuses;
    if (!changed) return;
    if (timer.current) clearTimeout(timer.current);
    const text = `${changed.title}: ${nextStatuses.get(changed.id)}`;
    timer.current = setTimeout(() => {
      setAnnouncement(text);
      timer.current = null;
    }, STATUS_ANNOUNCEMENT_DEBOUNCE_MS);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [records]);

  return refusalMessage ?? announcement;
}
