"use client";

import { useEffect, useState, type ComponentType } from "react";

/** Load visit/FCM clients after mount — avoids ssr:false dynamic breaks on soft nav. */
export function DeferredSiteClients() {
  const [Inner, setInner] = useState<ComponentType | null>(null);

  useEffect(() => {
    let cancelled = false;
    void import("@/components/layout/DeferredSiteClientsInner").then((mod) => {
      if (!cancelled) setInner(() => mod.DeferredSiteClientsInner);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!Inner) return null;
  return <Inner />;
}
