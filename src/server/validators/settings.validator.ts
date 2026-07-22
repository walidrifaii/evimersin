import { z } from "zod";

const emailSchema = z.string().trim().email().max(255);
const phoneSchema = z.string().trim().min(3).max(50);
const whatsappPhoneSchema = z
  .string()
  .trim()
  .regex(/^[0-9]{8,20}$/, "WhatsApp phone must be digits only (country code + number)");
const urlSchema = z.string().trim().url().max(500);
const handleSchema = z.string().trim().min(1).max(100);
const messageSchema = z.string().trim().min(1).max(500);

export const updateSiteSettingsSchema = z.object({
  email: emailSchema,
  phone: phoneSchema,
  whatsapp_phone: whatsappPhoneSchema,
  whatsapp_message: messageSchema,
  instagram_url: urlSchema,
  instagram_handle: handleSchema,
  facebook_url: urlSchema,
  facebook_handle: handleSchema,
});
