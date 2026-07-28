"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDeferredValue, useEffect, useState } from "react";

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
  const [query, setQuery] = useState(queryFromUrl);

  useEffect(() => {
    setQuery(queryFromUrl);
  }, [queryFromUrl]);

  useEffect(() => {
    const current = searchParams.get("q") ?? "";
    if (query === current) return;

    const params = new URLSearchParams(searchParams.toString());
    if (query.trim()) params.set("q", query);
    else params.delete("q");

    const next = params.toString();
    const timeout = window.setTimeout(() => {
      router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
    }, 200);

    return () => window.clearTimeout(timeout);
  }, [pathname, query, router, searchParams]);

  return {
    query,
    setQuery,
  };
}
