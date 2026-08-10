import type { SocialPlatformFields } from "@/constants/social-platforms";

export type SiteSettings = {
  id: number;
  email: string;
  phone: string;
  phone_label: string;
  whatsapp_phone: string;
  whatsapp_message: string;
  address_name: string;
  address: string;
  instagram_url: string;
  instagram_handle: string;
  instagram_visible: number;
  facebook_url: string;
  facebook_handle: string;
  facebook_visible: number;
  x_url: string;
  x_handle: string;
  x_visible: number;
  telegram_url: string;
  telegram_handle: string;
  telegram_visible: number;
  youtube_url: string;
  youtube_handle: string;
  youtube_visible: number;
  tiktok_url: string;
  tiktok_handle: string;
  tiktok_visible: number;
  updated_at: Date | string;
};

export type UpdateSiteSettingsInput = {
  email: string;
  phone: string;
  whatsapp_phone: string;
  whatsapp_message: string;
  address_name: string;
  address: string;
} & SocialPlatformFields;
