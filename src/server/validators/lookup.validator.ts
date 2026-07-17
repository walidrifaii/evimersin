import { z } from "zod";

const statusSchema = z.union([z.literal(0), z.literal(1)]);
const nameSchema = z.string().trim().min(1).max(150);

function requireOneField<T extends z.ZodRawShape>(shape: T) {
  return z.object(shape).refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });
}

export const createCountrySchema = z.object({
  name: nameSchema,
  status: statusSchema.optional().default(1),
});

export const updateCountrySchema = requireOneField({
  name: nameSchema.optional(),
  status: statusSchema.optional(),
});

export const createCitySchema = z.object({
  name: nameSchema,
  country_id: z.coerce.number().int().positive(),
  status: statusSchema.optional().default(1),
});

export const updateCitySchema = requireOneField({
  name: nameSchema.optional(),
  country_id: z.coerce.number().int().positive().optional(),
  status: statusSchema.optional(),
});

export const createCategorySchema = z.object({
  name: nameSchema,
  status: statusSchema.optional().default(1),
  position: z.coerce.number().int().min(0).optional().default(0),
  icon: z.string().trim().max(500).nullable().optional().default(null),
});

export const updateCategorySchema = requireOneField({
  name: nameSchema.optional(),
  status: statusSchema.optional(),
  position: z.coerce.number().int().min(0).optional(),
  icon: z.string().trim().max(500).nullable().optional(),
});

export const createPurposeSchema = z.object({
  name: nameSchema,
  status: statusSchema.optional().default(1),
  position: z.coerce.number().int().min(0).optional().default(0),
});

export const updatePurposeSchema = requireOneField({
  name: nameSchema.optional(),
  status: statusSchema.optional(),
  position: z.coerce.number().int().min(0).optional(),
});
