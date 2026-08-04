import { z } from "zod";

export const createAnnouncementSchema = z.object({
  title: z.string().trim().min(1).max(200),
  message: z.string().trim().min(1).max(2000),
});

export const guestPresenceSchema = z.object({
  sessionId: z.string().trim().min(8).max(64),
  path: z.string().trim().min(1).max(500),
  locale: z.enum(["en", "ar"]).optional().default("en"),
});

export type CreateAnnouncementInput = z.infer<typeof createAnnouncementSchema>;
export type GuestPresenceInput = z.infer<typeof guestPresenceSchema>;
