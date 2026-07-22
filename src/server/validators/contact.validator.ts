import { z } from "zod";

export const contactMessageSchema = z.object({
  name: z.string().trim().min(1).max(150),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(50).optional().default(""),
  subject: z.string().trim().min(1).max(150),
  message: z.string().trim().min(1).max(5000),
});

export type ContactMessageInput = z.infer<typeof contactMessageSchema>;
