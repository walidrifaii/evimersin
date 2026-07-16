import { config } from "@/constants/config";

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
  methods: [
    {
      id: "phone",
      title: "Phone",
      value: config.contact.phoneLabel,
      href: `tel:${config.contact.phone}`,
      description: "Speak with our team",
    },
    {
      id: "email",
      title: "Email",
      value: config.contact.email,
      href: `mailto:${config.contact.email}`,
      description: "We reply within 24 hours",
    },
    {
      id: "address",
      title: "Office",
      value: config.contact.addressName,
      href: config.contact.mapsUrl,
      description: config.contact.address,
    },
  ],
  social: [
    {
      id: "instagram",
      title: "Instagram",
      value: config.social.instagramHandle,
      href: config.social.instagram,
      description: "Follow our latest listings and updates",
    },
    {
      id: "facebook",
      title: "Facebook",
      value: config.social.facebookHandle,
      href: config.social.facebook,
      description: "Connect with us on Facebook",
    },
  ],
} as const;

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
