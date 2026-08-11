export const config = {
  appName: "EviMersin",
  tagline: "Property & Co",
  defaultLocale: "en",
  contact: {
    addressName: "EviMersin",
    address: "Palmiye, 2.Cadde, 33110 Yenişehir/Mersin",
    phone: "+961 71 959 921",
    email: "info@evimersin.com",
  },
  whatsapp: {
    phone: "96171959921",
    message: "Hello EviMersin, I would like to know more about your properties.",
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
