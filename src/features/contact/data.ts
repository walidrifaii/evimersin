import {
  SOCIAL_PLATFORM_CONFIG,
  SOCIAL_PLATFORMS,
  type SocialPlatformId,
} from "@/constants/social-platforms";
import { deriveSocialHandleFromUrl } from "@/lib/social-settings";
import type { PublicSiteSettings } from "@/lib/site-settings";

export const contactData = {
  hero: {
    title: "Contact Us",
    subtitle:
      "Have a question about a property or need expert guidance? Our team is ready to help you every step of the way.",
  },
  form: {
    title: "Send Us a Message",
    description:
      "Fill out the form and we will get back to you as soon as possible.",
    subjects: [
      "General Inquiry",
      "Schedule a Viewing",
      "Buy a Property",
      "Sell a Property",
      "Investment Advice",
      "Other",
    ],
  },
  info: {
    title: "Get in Touch",
    description:
      "Reach out directly by phone, email, or WhatsApp. We are happy to assist with listings, viewings, and property advice in Mersin.",
  },
} as const;

export function getContactMethods(settings: PublicSiteSettings) {
  return [
    {
      id: "phone" as const,
      title: "Phone",
      value: settings.phone,
      href: `tel:${settings.phone}`,
      description: "Speak with our team",
    },
    // TODO: Add WhatsApp
    {
      id: "email" as const,
      title: "Email",
      value: settings.email,
      href: `mailto:${settings.email}`,
      description: "We reply within 24 hours",
    },
    {
      id: "address" as const,
      title: "Office",
      value: settings.address_name,
      href: settings.maps_url,
      description: settings.address,
    },
  ];
}

const CONTACT_DESCRIPTIONS: Record<SocialPlatformId, string> = {
  instagram: "Follow our latest listings and updates",
  facebook: "Connect with us on Facebook",
  x: "Follow us on X for news and updates",
  telegram: "Join our Telegram channel",
  youtube: "Watch property tours and market updates",
  tiktok: "Follow us on TikTok for short property videos",
};

export function getContactSocial(settings: PublicSiteSettings) {
  return SOCIAL_PLATFORM_CONFIG.map((platform) => ({
    id: platform.id,
    title: platform.label,
    value: deriveSocialHandleFromUrl(settings[`${platform.id}_url`], platform.id),
    href: settings[`${platform.id}_url`],
    description: CONTACT_DESCRIPTIONS[platform.id],
    visible:
      settings[`${platform.id}_visible`] ??
      (platform.id === "instagram" || platform.id === "facebook"),
  })).filter((item) => item.visible && item.href.trim().length > 0);
}

export type ContactFormState = {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
};

export const initialContactForm: ContactFormState = {
  name: "",
  email: "",
  phone: "",
  subject: contactData.form.subjects[0],
  message: "",
};

export function socialSettingsFromData(data: PublicSiteSettings) {
  return SOCIAL_PLATFORMS.reduce(
    (fields, platform) => {
      fields[`${platform}_url`] = data[`${platform}_url`];
      fields[`${platform}_visible`] = data[`${platform}_visible`];
      return fields;
    },
    {} as Record<`${SocialPlatformId}_url` | `${SocialPlatformId}_visible`, string | boolean>,
  );
}
