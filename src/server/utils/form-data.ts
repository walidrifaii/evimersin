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

/**
 * Read a multipart body for an update route.
 *
 * Some reverse proxies forward `multipart/form-data` only for POST, so a PUT
 * can arrive with every field missing and silently wipe the record. Logging the
 * empty case makes that visible instead of looking like a broken form.
 */
export async function readUpdateFormData(
  request: Request,
  label: string,
): Promise<FormData> {
  const formData = await request.formData();

  if ([...formData.keys()].length === 0) {
    console.warn(
      `[evimersin] Empty ${request.method} form body for ${label} update ` +
        `(content-type: ${request.headers.get("content-type") ?? "none"}). ` +
        "The proxy likely dropped the multipart body; existing values were kept.",
    );
  }

  return formData;
}
