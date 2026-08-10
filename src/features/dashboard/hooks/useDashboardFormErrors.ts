"use client";

import { useCallback, useState } from "react";
import { parseApiError } from "@/store/api/errors";

export function useDashboardFormErrors() {
  const [banner, setBanner] = useState<string | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});

  const clear = useCallback(() => {
    setBanner(null);
    setFields({});
  }, []);

  const clearField = useCallback((name: string) => {
    setFields((previous) => {
      if (!(name in previous)) return previous;
      const next = { ...previous };
      delete next[name];
      return next;
    });
    setBanner(null);
  }, []);

  const apply = useCallback((error: unknown) => {
    const parsed = parseApiError(error);
    setBanner(parsed.message);
    setFields(parsed.fieldErrors);
  }, []);

  const setLocal = useCallback(
    (message: string, fieldErrors: Record<string, string> = {}) => {
      setBanner(message);
      setFields(fieldErrors);
    },
    [],
  );

  const field = useCallback(
    (name: string) => fields[name],
    [fields],
  );

  return {
    banner,
    fields,
    clear,
    clearField,
    apply,
    setLocal,
    field,
  };
}
