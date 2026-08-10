import { z } from "zod";
import type { UpdateSiteSettingsInput } from "@/server/types/settings.types";

const emailSchema = z.string().trim().email().max(255);
const phoneSchema = z.string().trim().min(3).max(50);
const whatsappPhoneSchema = z
  .string()
  .trim()
  .regex(/^[0-9]{8,20}$/, "WhatsApp phone must be digits only (country code + number)");
const urlSchema = z.string().trim().url().max(500);
const optionalUrlSchema = z.union([z.literal(""), urlSchema]);
const handleSchema = z.string().trim().min(1).max(100);
const messageSchema = z.string().trim().min(1).max(500);
const addressNameSchema = z.string().trim().min(1).max(100);
const addressSchema = z.string().trim().min(1).max(500);

export const updateSiteSettingsSchema = z.object({
  email: emailSchema,
  phone: phoneSchema,
  whatsapp_phone: whatsappPhoneSchema,
  whatsapp_message: messageSchema,
  address_name: addressNameSchema,
  address: addressSchema,
  instagram_url: urlSchema,
  instagram_handle: handleSchema,
  instagram_visible: z.boolean(),
  facebook_url: urlSchema,
  facebook_handle: handleSchema,
  facebook_visible: z.boolean(),
  x_url: optionalUrlSchema,
  x_handle: handleSchema,
  x_visible: z.boolean(),
  telegram_url: optionalUrlSchema,
  telegram_handle: handleSchema,
  telegram_visible: z.boolean(),
  youtube_url: optionalUrlSchema,
  youtube_handle: handleSchema,
  youtube_visible: z.boolean(),
  tiktok_url: optionalUrlSchema,
  tiktok_handle: handleSchema,
  tiktok_visible: z.boolean(),
}) as z.ZodType<UpdateSiteSettingsInput>;
