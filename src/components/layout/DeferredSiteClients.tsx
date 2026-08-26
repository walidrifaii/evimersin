"use client";

import dynamic from "next/dynamic";

/** Deferred so Firebase / visit tracking never delay first paint. */
export const DeferredSiteClients = dynamic(
  () =>
    import("@/components/layout/DeferredSiteClientsInner").then((mod) => ({
      default: mod.DeferredSiteClientsInner,
    })),
  { ssr: false },
);
