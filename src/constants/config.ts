export const config = {
  appName: "EviMersin",
  tagline: "Property & Co",
  defaultLocale: "en",
  contact: {
    addressName: "EviMersin",
    address: "Palmiye, 2.Cadde, 33110 Yenişehir/Mersin",
    mapsUrl:
      "https://www.google.com/maps?cid=17182616818109508322&g_mp=CiVnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLkdldFBsYWNlEAMYASAF&hl=tr&gl=TR&source=embed",
    phone: "+90 555 123 45 67",
    phoneLabel: "+90 555 123 45 67",
    email: "info@evimersin.com",
  },
  whatsapp: {
    phone: "905551234567",
    message: "Hello EviMersin, I would like to know more about your properties.",
  },
  social: {
    instagram: "https://instagram.com/evimersin",
    facebook: "https://facebook.com/evimersin",
    instagramHandle: "@evimersin",
    facebookHandle: "EviMersin",
  },
} as const;

export function getWhatsAppUrl(customMessage?: string) {
  const text = encodeURIComponent(customMessage ?? config.whatsapp.message);
  return `https://wa.me/${config.whatsapp.phone}?text=${text}`;
}
