import { routes } from "@/constants/routes";

/**
 * Canonical public origin. Links that leave the site (WhatsApp, email) must be
 * reachable by the recipient, so they never use the local or preview host.
 */
const SITE_URL = "https://evimersin.co";

/** Absolute URL for a path that will be opened outside the site. */
export function getShareUrl(path: string) {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export const config = {
  appName: "EviMersin",
  tagline: "Property & Co",
  defaultLocale: "en",
  siteUrl: SITE_URL,
  contact: {
    addressName: "EviMersin",
    address: "Palmiye, 2.Cadde, 33110 Yenişehir/Mersin",
    phone: "+961 71 959 921",
    email: "info@evimersin.com",
  },
  whatsapp: {
    phone: "96171959921",
    message: `Hello EviMersin, I would like to know more about your properties. ${getShareUrl(
      routes.properties,
    )}`,
  },
  social: {
    instagram: "https://instagram.com/evimersin",
    facebook: "https://facebook.com/evimersin",
    instagramHandle: "@evimersin",
    facebookHandle: "EviMersin",
  },
} as const;

/** Extra residential unit images allowed on top of the single cover image. */
export const MAX_PRODUCT_GALLERY_IMAGES = 3;

/** Upload limits shared by the dashboard forms and the server upload handler. */
export const MAX_UPLOAD_IMAGE_BYTES = 5 * 1024 * 1024;

export const ALLOWED_UPLOAD_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml",
] as const;

/** Reason the file cannot be uploaded, or null when it is fine. */
export function getImageUploadRejection(file: File) {
  if (!ALLOWED_UPLOAD_IMAGE_TYPES.includes(file.type as never)) {
    return `${file.name} is not a JPG, PNG, WEBP, or SVG image`;
  }
  if (file.size > MAX_UPLOAD_IMAGE_BYTES) {
    const megabytes = (file.size / (1024 * 1024)).toFixed(1);
    return `${file.name} is ${megabytes}MB, over the 5MB limit`;
  }
  return null;
}

export type WhatsAppSettings = {
  phone: string;
  message: string;
};

export function getWhatsAppUrl(
  customMessage?: string,
  options?: Partial<WhatsAppSettings>,
) {
  const phone = options?.phone ?? config.whatsapp.phone;
  const text = encodeURIComponent(
    customMessage ?? options?.message ?? config.whatsapp.message,
  );
  return `https://wa.me/${phone}?text=${text}`;
}

export function getWhatsAppUrlFromSettings(
  settings: { whatsapp_phone: string; whatsapp_message: string },
  customMessage?: string,
) {
  return getWhatsAppUrl(customMessage, {
    phone: settings.whatsapp_phone,
    message: settings.whatsapp_message,
  });
}
