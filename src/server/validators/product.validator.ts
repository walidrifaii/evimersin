import { z } from "zod";

const statusSchema = z.union([z.literal(0), z.literal(1)]);
const nameSchema = z.string().trim().min(1).max(200);
const discountTypeSchema = z.enum(["fixed", "percentage"]).nullable();

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
    description: z.string().trim().max(5000).nullable().optional().default(null),
    price: z.coerce.number().min(0),
    discount_type: discountTypeSchema.optional().default(null),
    discount_value: z.coerce.number().min(0).optional().default(0),
    category_id: z.coerce.number().int().positive(),
    purpose_id: z.coerce.number().int().positive(),
    city_id: z.coerce.number().int().positive(),
    status: statusSchema.optional().default(1),
    is_featured: statusSchema.optional().default(0),
  })
  .superRefine(validateDiscount);

export const updateProductSchema = requireOneField({
  name: nameSchema.optional(),
  image: z.string().trim().max(500).nullable().optional(),
  position: z.coerce.number().int().min(0).optional(),
  description: z.string().trim().max(5000).nullable().optional(),
  price: z.coerce.number().min(0).optional(),
  discount_type: discountTypeSchema.optional(),
  discount_value: z.coerce.number().min(0).optional(),
  category_id: z.coerce.number().int().positive().optional(),
  purpose_id: z.coerce.number().int().positive().optional(),
  city_id: z.coerce.number().int().positive().optional(),
  status: statusSchema.optional(),
  is_featured: statusSchema.optional(),
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
