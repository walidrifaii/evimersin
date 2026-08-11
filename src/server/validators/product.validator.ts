import { z } from "zod";
import { ALL_PROPERTY_SPEC_KEYS } from "@/constants/property-specs";

const statusSchema = z.union([z.literal(0), z.literal(1)]);
const nullableStatusSchema = z.union([z.literal(0), z.literal(1)]).nullable();

const formRequiredString = (max: number) =>
  z.preprocess(
    (value) => (value == null ? "" : value),
    z.coerce.string().trim().min(1, "Name is required").max(max),
  );

const formOptionalString = (max: number) =>
  z.preprocess(
    (value) => {
      if (value == null) return undefined;
      const trimmed = String(value).trim();
      return trimmed === "" ? undefined : trimmed;
    },
    z.string().min(1, "Name is required").max(max).optional(),
  );

const formNullableString = (max: number) =>
  z.preprocess(
    (value) => {
      if (value == null) return null;
      const trimmed = String(value).trim();
      return trimmed === "" ? null : trimmed;
    },
    z.string().max(max).nullable(),
  );

const nameSchema = formRequiredString(200);
const discountTypeSchema = z.enum(["fixed", "percentage"]).nullable();
const nullableNumberSchema = z.coerce.number().nullable().optional();
const nullableIntSchema = z.coerce.number().int().nullable().optional();
const nullableTextSchema = z.string().trim().max(100).nullable().optional();

const productSpecSchema = {
  land_area: nullableNumberSchema,
  land_type: nullableTextSchema,
  zoning: nullableTextSchema,
  road_access: nullableStatusSchema.optional(),
  allowed_floors: nullableIntSchema,
  electricity: nullableStatusSchema.optional(),
  water: nullableStatusSchema.optional(),
  built_area: nullableNumberSchema,
  floors: nullableIntSchema,
  bedrooms: nullableIntSchema,
  bathrooms: nullableIntSchema,
  living_rooms: nullableIntSchema,
  parking: nullableStatusSchema.optional(),
  garden: nullableStatusSchema.optional(),
  pool: nullableStatusSchema.optional(),
  furnished: nullableStatusSchema.optional(),
  floor_number: nullableIntSchema,
  balconies: nullableIntSchema,
  elevator: nullableStatusSchema.optional(),
  frontage: nullableNumberSchema,
  storage: nullableStatusSchema.optional(),
  mezzanine: nullableStatusSchema.optional(),
  rooms: nullableIntSchema,
} as const;

function validateDiscount(
  data: {
    price: number;
    discount_type?: "fixed" | "percentage" | null;
    discount_value?: number;
  },
  ctx: z.RefinementCtx,
) {
  const discountType = data.discount_type ?? null;
  const discountValue = data.discount_value ?? 0;

  if (!discountType) {
    if (discountValue > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Set a discount type or clear the discount value",
        path: ["discount_value"],
      });
    }
    return;
  }

  if (discountValue <= 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Discount value must be greater than 0",
      path: ["discount_value"],
    });
    return;
  }

  if (discountType === "fixed" && discountValue > data.price) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Fixed discount cannot exceed product price",
      path: ["discount_value"],
    });
  }

  if (discountType === "percentage" && discountValue > 100) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Percentage discount cannot exceed 100%",
      path: ["discount_value"],
    });
  }
}

function requireOneField<T extends z.ZodRawShape>(shape: T) {
  return z.object(shape).refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });
}

export const createProductSchema = z
  .object({
    name: nameSchema,
    image: z.string().trim().max(500).nullable().optional().default(null),
    position: z.coerce.number().int().min(0).optional().default(0),
    description: formNullableString(5000).optional().default(null),
    price: z.coerce.number().min(0),
    discount_type: discountTypeSchema.optional().default(null),
    discount_value: z.coerce.number().min(0).optional().default(0),
    category_id: z.coerce.number().int().positive(),
    purpose_id: z.coerce.number().int().positive(),
    city_id: z.coerce.number().int().positive(),
    region_id: z.coerce.number().int().positive().nullable().optional().default(null),
    status: statusSchema.optional().default(1),
    is_featured: statusSchema.optional().default(0),
    ...productSpecSchema,
  })
  .superRefine(validateDiscount);

export const updateProductSchema = requireOneField({
  name: formOptionalString(200),
  image: z.string().trim().max(500).nullable().optional(),
  position: z.coerce.number().int().min(0).optional(),
  description: formNullableString(5000).optional(),
  price: z.coerce.number().min(0).optional(),
  discount_type: discountTypeSchema.optional(),
  discount_value: z.coerce.number().min(0).optional(),
  category_id: z.coerce.number().int().positive().optional(),
  purpose_id: z.coerce.number().int().positive().optional(),
  city_id: z.coerce.number().int().positive().optional(),
  region_id: z.coerce.number().int().positive().nullable().optional(),
  status: statusSchema.optional(),
  is_featured: statusSchema.optional(),
  ...Object.fromEntries(
    ALL_PROPERTY_SPEC_KEYS.map((key) => [
      key,
      productSpecSchema[key],
    ]),
  ),
}).superRefine((data, ctx) => {
  if (
    data.price === undefined &&
    data.discount_type === undefined &&
    data.discount_value === undefined
  ) {
    return;
  }

  validateDiscount(
    {
      price: data.price ?? 0,
      discount_type: data.discount_type,
      discount_value: data.discount_value,
    },
    ctx,
  );
});

export const createProductImageSchema = z.object({
  image: z.string().trim().max(500),
  status: statusSchema.optional().default(1),
});
