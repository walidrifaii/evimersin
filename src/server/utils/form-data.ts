/** Normalize FormData values for Zod (missing fields arrive as null). */
export function readFormString(value: FormDataEntryValue | null): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  return String(value);
}

export function readNullableFormString(
  value: FormDataEntryValue | null,
): string | null {
  const raw = readFormString(value).trim();
  return raw === "" ? null : raw;
}

/** Read the last non-empty string for a FormData key (handles duplicate entries). */
export function readFormField(formData: FormData, key: string): string {
  const values = formData.getAll(key);
  let fallback = "";

  for (const value of values) {
    if (typeof value !== "string") continue;
    if (value.trim()) return value;
    fallback = value;
  }

  return fallback;
}

export function readTrimmedFormField(formData: FormData, key: string): string {
  return readFormField(formData, key).trim();
}
