import { z } from "zod";

export const trackVisitSchema = z.object({
  sessionId: z.string().trim().min(8).max(64),
  path: z.string().trim().min(1).max(500),
  locale: z.enum(["en", "ar"]).optional().default("en"),
  referrer: z.string().trim().max(500).optional().default(""),
});

export const registerFcmTokenSchema = z.object({
  token: z.string().trim().min(20).max(512),
  deviceLabel: z.string().trim().max(150).optional().default(""),
});

export const registerGuestFcmTokenSchema = z.object({
  sessionId: z.string().trim().min(8).max(64),
  token: z.string().trim().min(20).max(512),
  locale: z.enum(["en", "ar"]).optional().default("en"),
});

export type TrackVisitInput = z.infer<typeof trackVisitSchema>;
export type RegisterGuestFcmTokenInput = z.infer<typeof registerGuestFcmTokenSchema>;
