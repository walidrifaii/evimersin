import { config } from "@/constants/config";
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
      value: settings.phone_label,
      href: `tel:${settings.phone}`,
      description: "Speak with our team",
    },
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
      value: config.contact.addressName,
      href: config.contact.mapsUrl,
      description: config.contact.address,
    },
  ];
}

export function getContactSocial(settings: PublicSiteSettings) {
  return [
    {
      id: "instagram" as const,
      title: "Instagram",
      value: settings.instagram_handle,
      href: settings.instagram_url,
      description: "Follow our latest listings and updates",
    },
    {
      id: "facebook" as const,
      title: "Facebook",
      value: settings.facebook_handle,
      href: settings.facebook_url,
      description: "Connect with us on Facebook",
    },
  ];
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
