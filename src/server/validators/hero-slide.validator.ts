import { z } from "zod";

const formString = (max: number) =>
  z.preprocess(
    (value) => (value == null ? "" : value),
    z.string().max(max),
  );

export const createHeroSlideSchema = z.object({
  image: z.string().min(1, "Image is required"),
  alt_text: formString(255).default(""),
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
