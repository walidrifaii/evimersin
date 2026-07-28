"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDeferredValue, useEffect, useRef, useState } from "react";

export function normalizeDashboardSearch(value: string) {
  return value.trim().toLowerCase();
}

export function matchesDashboardSearch(
  query: string,
  ...fields: Array<string | number | null | undefined>
) {
  const normalized = normalizeDashboardSearch(query);
  if (!normalized) return true;
  return fields.some((field) =>
    String(field ?? "")
      .toLowerCase()
      .includes(normalized),
  );
}

/** Read-only search query for list panels (synced from URL). */
export function useDashboardSearchQuery() {
  const searchParams = useSearchParams();
  return useDeferredValue(searchParams.get("q") ?? "");
}

/** Writable search state for the topbar (debounced into URL `q`). */
export function useDashboardSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryFromUrl = searchParams.get("q") ?? "";
  const tabFromUrl = searchParams.get("tab") ?? "overview";
  const [query, setQuery] = useState(queryFromUrl);
  const previousTabRef = useRef(tabFromUrl);

  useEffect(() => {
    setQuery(queryFromUrl);
  }, [queryFromUrl]);

  // Clear search when the dashboard tab changes (not on first mount).
  useEffect(() => {
    if (previousTabRef.current === tabFromUrl) return;
    previousTabRef.current = tabFromUrl;
    setQuery("");
  }, [tabFromUrl]);

  useEffect(() => {
    const current = searchParams.get("q") ?? "";
    if (query === current) return;

    const params = new URLSearchParams();
    // Always keep the active tab — never navigate to bare /dashboard.
    params.set("tab", searchParams.get("tab") ?? "overview");
    if (query.trim()) params.set("q", query.trim());

    const next = params.toString();
    const timeout = window.setTimeout(() => {
      router.replace(`${pathname}?${next}`, { scroll: false });
    }, 200);

    return () => window.clearTimeout(timeout);
  }, [pathname, query, router, searchParams]);

  return {
    query,
    setQuery,
  };
}
