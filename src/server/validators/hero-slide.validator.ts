import { z } from "zod";

export const createHeroSlideSchema = z.object({
  image: z.string().min(1, "Image is required"),
  alt_text: z.string().max(255).optional().default(""),
  sort_order: z.coerce.number().int().min(0).optional().default(0),
  status: z.coerce
    .number()
    .int()
    .min(0)
    .max(1)
    .optional()
    .default(1)
    .transform((value) => (value === 0 ? 0 : 1) as 0 | 1),
});

export const updateHeroSlideSchema = createHeroSlideSchema.partial();
