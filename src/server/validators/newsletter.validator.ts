import { z } from "zod";

export const newsletterSubscribeSchema = z.object({
  email: z.string().trim().email().max(255),
  name: z.string().trim().max(150).optional().default(""),
  locale: z.enum(["en", "ar"]).optional().default("en"),
});

export type NewsletterSubscribeInput = z.infer<typeof newsletterSubscribeSchema>;
