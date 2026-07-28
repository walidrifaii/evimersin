import {
  ALL_PROPERTY_SPEC_KEYS,
  PROPERTY_SPEC_FIELDS,
  type PropertySpecFieldKey,
} from "@/constants/property-specs";

function parseNullableNumber(value: FormDataEntryValue | null) {
  if (value === null || value === undefined) return null;
  const raw = String(value).trim();
  if (raw === "") return null;
  const num = Number(raw);
  return Number.isFinite(num) ? num : null;
}

function parseNullableInt(value: FormDataEntryValue | null) {
  const num = parseNullableNumber(value);
  if (num === null) return null;
  return Math.trunc(num);
}

function parseNullableText(value: FormDataEntryValue | null) {
  if (value === null || value === undefined) return null;
  const raw = String(value).trim();
  return raw === "" ? null : raw;
}

function parseNullableBool(value: FormDataEntryValue | null) {
  if (value === null || value === undefined) return null;
  const raw = String(value).trim().toLowerCase();
  if (raw === "") return null;
  if (raw === "1" || raw === "true" || raw === "yes") return 1 as const;
  if (raw === "0" || raw === "false" || raw === "no") return 0 as const;
  return null;
}

export function parseProductSpecFieldsFromFormData(formData: FormData) {
  const result: Partial<Record<PropertySpecFieldKey, string | number | null>> =
    {};

  for (const key of ALL_PROPERTY_SPEC_KEYS) {
    if (!formData.has(key)) continue;
    const field = PROPERTY_SPEC_FIELDS[key];
    const value = formData.get(key);

    if (field.type === "boolean") {
      result[key] = parseNullableBool(value);
    } else if (field.type === "text") {
      result[key] = parseNullableText(value);
    } else if (
      key === "land_area" ||
      key === "built_area" ||
      key === "frontage"
    ) {
      result[key] = parseNullableNumber(value);
    } else {
      result[key] = parseNullableInt(value);
    }
  }

  return result;
}
