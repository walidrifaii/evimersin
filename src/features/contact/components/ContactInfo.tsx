import type { IconType } from "react-icons";
import {
  FaFacebook,
  FaInstagram,
  FaWhatsapp,
} from "react-icons/fa";
import {
  HiOutlineLocationMarker,
  HiOutlineMail,
  HiOutlinePhone,
} from "react-icons/hi";
import { getWhatsAppUrl } from "@/constants/config";
import { contactData } from "@/features/contact/data";

const methodIcons = {
  phone: HiOutlinePhone,
  email: HiOutlineMail,
  address: HiOutlineLocationMarker,
  instagram: FaInstagram,
  facebook: FaFacebook,
} as const satisfies Record<string, IconType>;

function ContactCard({
  id,
  title,
  value,
  href,
  description,
  external = false,
}: {
  id: keyof typeof methodIcons;
  title: string;
  value: string;
  href: string;
  description: string;
  external?: boolean;
}) {
  const Icon = methodIcons[id];

  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="flex items-start gap-4 rounded-2xl border border-[#e8edf5] bg-[#f5f7fa] p-5 transition-colors hover:border-[var(--brand-blue)] hover:bg-[#eff6ff]"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-[var(--brand-blue)] shadow-sm">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <span>
        <span className="block text-[13px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
          {title}
        </span>
        <span className="mt-1 block text-[15px] font-semibold text-[var(--brand-navy)]">
          {value}
        </span>
        <span className="mt-1 block text-[14px] text-[var(--muted)]">{description}</span>
      </span>
    </a>
  );
}

export function ContactInfo() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-[1.5rem] font-bold tracking-[-0.02em] text-[var(--brand-navy)] sm:text-[1.65rem]">
          {contactData.info.title}
        </h2>
        <p className="mt-2 text-[15px] leading-relaxed text-[var(--muted)]">
          {contactData.info.description}
        </p>
      </div>

      <div className="space-y-4">
        {contactData.methods.map((method) => (
          <ContactCard
            key={method.id}
            id={method.id}
            title={method.title}
            value={method.value}
            href={method.href}
            description={method.description}
            external={method.id === "address"}
          />
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {contactData.social.map((item) => (
          <ContactCard
            key={item.id}
            id={item.id}
            title={item.title}
            value={item.value}
            href={item.href}
            description={item.description}
            external
          />
        ))}
      </div>

      <a
        href={getWhatsAppUrl()}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--brand-red)] px-5 py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-[#c9181e]"
      >
        <FaWhatsapp className="h-4 w-4" aria-hidden="true" />
        Chat on WhatsApp
      </a>
    </div>
  );
}
