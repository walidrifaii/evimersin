export type PropertySpecFieldType = "number" | "text" | "boolean";

export type PropertySpecFieldKey =
  | "land_area"
  | "land_type"
  | "zoning"
  | "road_access"
  | "allowed_floors"
  | "electricity"
  | "water"
  | "built_area"
  | "floors"
  | "bedrooms"
  | "bathrooms"
  | "living_rooms"
  | "parking"
  | "garden"
  | "pool"
  | "furnished"
  | "floor_number"
  | "balconies"
  | "elevator"
  | "frontage"
  | "storage"
  | "mezzanine"
  | "rooms";

export type PropertySpecField = {
  key: PropertySpecFieldKey;
  label: string;
  type: PropertySpecFieldType;
  unit?: string;
};

/** All product columns for type-specific specs (duplicates merged into one column). */
export const PROPERTY_SPEC_FIELDS: Record<PropertySpecFieldKey, PropertySpecField> = {
  land_area: { key: "land_area", label: "Land Area", type: "number", unit: "sqm" },
  land_type: { key: "land_type", label: "Land Type", type: "text" },
  zoning: { key: "zoning", label: "Zoning", type: "text" },
  road_access: { key: "road_access", label: "Road Access", type: "boolean" },
  allowed_floors: { key: "allowed_floors", label: "Allowed Floors", type: "number" },
  electricity: { key: "electricity", label: "Electricity", type: "boolean" },
  water: { key: "water", label: "Water", type: "boolean" },
  built_area: { key: "built_area", label: "Built / Usable Area", type: "number", unit: "sqm" },
  floors: { key: "floors", label: "Floors", type: "number" },
  bedrooms: { key: "bedrooms", label: "Bedrooms", type: "number" },
  bathrooms: { key: "bathrooms", label: "Bathrooms", type: "number" },
  living_rooms: { key: "living_rooms", label: "Living Rooms", type: "number" },
  parking: { key: "parking", label: "Parking", type: "boolean" },
  garden: { key: "garden", label: "Garden", type: "boolean" },
  pool: { key: "pool", label: "Pool", type: "boolean" },
  furnished: { key: "furnished", label: "Furnished", type: "boolean" },
  floor_number: { key: "floor_number", label: "Floor Number", type: "number" },
  balconies: { key: "balconies", label: "Balconies", type: "number" },
  elevator: { key: "elevator", label: "Elevator", type: "boolean" },
  frontage: { key: "frontage", label: "Frontage", type: "number", unit: "m" },
  storage: { key: "storage", label: "Storage", type: "boolean" },
  mezzanine: { key: "mezzanine", label: "Mezzanine", type: "boolean" },
  rooms: { key: "rooms", label: "Rooms", type: "number" },
};

export const ALL_PROPERTY_SPEC_KEYS = Object.keys(
  PROPERTY_SPEC_FIELDS,
) as PropertySpecFieldKey[];

const CATEGORY_SPEC_KEYS: Record<string, PropertySpecFieldKey[]> = {
  land: [
    "land_area",
    "land_type",
    "zoning",
    "road_access",
    "allowed_floors",
    "electricity",
    "water",
  ],
  villa: [
    "land_area",
    "built_area",
    "floors",
    "bedrooms",
    "bathrooms",
    "living_rooms",
    "parking",
    "garden",
    "pool",
    "furnished",
  ],
  apartment: [
    "built_area",
    "floor_number",
    "bedrooms",
    "bathrooms",
    "living_rooms",
    "balconies",
    "parking",
    "elevator",
    "furnished",
  ],
  studio: [
    "floor_number",
    "bedrooms",
    "bathrooms",
    "living_rooms",
    "balconies",
    "parking",
    "elevator",
    "furnished",
  ],
  penthouse: [
    "floor_number",
    "bedrooms",
    "bathrooms",
    "living_rooms",
    "balconies",
    "parking",
    "elevator",
    "furnished",
  ],
  shop: [
    "built_area",
    "floor_number",
    "bathrooms",
    "frontage",
    "parking",
    "storage",
    "mezzanine",
  ],
  commercial: [
    "floor_number",
    "bathrooms",
    "frontage",
    "parking",
    "storage",
    "mezzanine",
  ],
  office: [
    "built_area",
    "floor_number",
    "rooms",
    "bathrooms",
    "parking",
    "elevator",
    "furnished",
  ],
};

export function normalizeCategoryKey(name: string) {
  return name.trim().toLowerCase();
}

export function getSpecKeysForCategory(categoryName: string | null | undefined) {
  if (!categoryName) return [] as PropertySpecFieldKey[];
  return CATEGORY_SPEC_KEYS[normalizeCategoryKey(categoryName)] ?? [];
}

export function getSpecFieldsForCategory(categoryName: string | null | undefined) {
  const categoryKey = normalizeCategoryKey(categoryName ?? "");
  return getSpecKeysForCategory(categoryName).map((key) => {
    const field = PROPERTY_SPEC_FIELDS[key];
    if (categoryKey === "apartment" && key === "built_area") {
      return { ...field, label: "Area" };
    }
    return field;
  });
}

export type PropertySpecValues = Partial<
  Record<PropertySpecFieldKey, string | number | boolean | null>
>;

export function emptySpecValues(): Record<PropertySpecFieldKey, string | number | boolean | null> {
  return Object.fromEntries(
    ALL_PROPERTY_SPEC_KEYS.map((key) => [key, null]),
  ) as Record<PropertySpecFieldKey, string | number | boolean | null>;
}

/** Null out fields that do not belong to the selected category. */
export function clearUnusedSpecValues(
  categoryName: string | null | undefined,
  values: PropertySpecValues,
): Record<PropertySpecFieldKey, string | number | boolean | null> {
  const allowed = new Set(getSpecKeysForCategory(categoryName));
  const next = emptySpecValues();
  for (const key of ALL_PROPERTY_SPEC_KEYS) {
    next[key] = allowed.has(key) ? (values[key] ?? null) : null;
  }
  return next;
}

export function formatSpecValue(
  field: PropertySpecField,
  value: string | number | boolean | null | undefined,
) {
  if (value === null || value === undefined || value === "") return null;

  if (field.type === "boolean") {
    const truthy = value === true || value === 1 || value === "1";
    return truthy ? "Yes" : "No";
  }

  if (field.type === "number") {
    const num = typeof value === "number" ? value : Number(value);
    if (!Number.isFinite(num)) return null;
    return field.unit ? `${num} ${field.unit}` : String(num);
  }

  return String(value);
}
