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
