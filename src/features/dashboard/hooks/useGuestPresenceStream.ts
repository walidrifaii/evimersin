"use client";

import { useEffect, useRef } from "react";
import { announcementsApi } from "@/store/slices/admin/announcementsApi";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

const RECONNECT_MS = 4000;

export function useGuestPresenceStream(enabled = true) {
  const dispatch = useAppDispatch();
  const accessToken = useAppSelector((state) => state.auth.accessToken);
  const reconnectTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled || !accessToken) return;

    let cancelled = false;
    const controller = new AbortController();

    function scheduleReconnect() {
      if (cancelled) return;
      reconnectTimerRef.current = window.setTimeout(() => {
        void connect();
      }, RECONNECT_MS);
    }

    async function connect() {
      try {
        const response = await fetch("/api/admin/announcements/stream", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          signal: controller.signal,
        });

        if (!response.ok || !response.body) {
          scheduleReconnect();
          return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (!cancelled) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const chunks = buffer.split("\n\n");
          buffer = chunks.pop() ?? "";

          for (const chunk of chunks) {
            const dataLine = chunk
              .split("\n")
              .find((line) => line.startsWith("data: "));
            if (!dataLine) continue;

            const payload = JSON.parse(dataLine.slice(6)) as {
              type?: string;
              activeGuestCount?: number;
              reachableGuestCount?: number;
            };

            if (
              payload.type !== "counts" ||
              typeof payload.activeGuestCount !== "number" ||
              typeof payload.reachableGuestCount !== "number"
            ) {
              continue;
            }

            dispatch(
              announcementsApi.util.updateQueryData(
                "getAnnouncementsOverview",
                undefined,
                (draft) => {
                  draft.activeGuestCount = payload.activeGuestCount!;
                  draft.reachableGuestCount = payload.reachableGuestCount!;
                },
              ),
            );
          }
        }

        scheduleReconnect();
      } catch (error) {
        if (
          !cancelled &&
          !(error instanceof DOMException && error.name === "AbortError")
        ) {
          scheduleReconnect();
        }
      }
    }

    void connect();

    return () => {
      cancelled = true;
      controller.abort();
      if (reconnectTimerRef.current) {
        window.clearTimeout(reconnectTimerRef.current);
      }
    };
  }, [accessToken, dispatch, enabled]);
}
