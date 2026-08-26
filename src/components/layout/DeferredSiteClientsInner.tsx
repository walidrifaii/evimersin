"use client";

import { GuestFirebaseNotifications } from "@/components/announcements/GuestFirebaseNotifications";
import { VisitTracker } from "@/components/visits/VisitTracker";

export function DeferredSiteClientsInner() {
  return (
    <>
      <VisitTracker />
      <GuestFirebaseNotifications />
    </>
  );
}
