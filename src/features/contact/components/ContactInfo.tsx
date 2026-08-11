"use client";

import type { IconType } from "react-icons";
import {
  FaFacebook,
  FaInstagram,
  FaTelegram,
  FaTiktok,
  FaWhatsapp,
  FaYoutube,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import {
  HiOutlineLocationMarker,
  HiOutlineMail,
  HiOutlinePhone,
} from "react-icons/hi";
import { useTranslations } from "next-intl";
import {
  SOCIAL_PLATFORM_CONFIG,
  type SocialPlatformId,
} from "@/constants/social-platforms";

import {
  useSiteSettings,
  useWhatsAppUrl,
} from "@/components/providers/SiteSettingsProvider";
import { getContactMethods, getContactSocial } from "@/features/contact/data";

const methodIcons = {
  phone: HiOutlinePhone,
  email: HiOutlineMail,
  address: HiOutlineLocationMarker,
} as const satisfies Record<string, IconType>;

const socialIcons: Record<SocialPlatformId, IconType> = {
  instagram: FaInstagram,
  facebook: FaFacebook,
  x: FaXTwitter,
  telegram: FaTelegram,
  youtube: FaYoutube,
  tiktok: FaTiktok,
};

const socialLabelKeys = Object.fromEntries(
  SOCIAL_PLATFORM_CONFIG.map((platform) => [platform.id, platform.contactTitleKey]),
) as Record<SocialPlatformId, (typeof SOCIAL_PLATFORM_CONFIG)[number]["contactTitleKey"]>;

const methodLabelKeys = {
  phone: { title: "methodPhone", description: "methodPhoneDesc" },
  email: { title: "methodEmail", description: "methodEmailDesc" },
  address: { title: "methodOffice", description: null },
} as const;

function ContactSocialLinks() {
  const settings = useSiteSettings();
  const t = useTranslations("contact");
  const social = getContactSocial(settings);

  if (social.length === 0) return null;

  return (
    <div className="rounded-2xl border border-[#e8edf5] bg-[#f8fafc] px-4 py-5 sm:px-5 sm:py-6">
      <div className="grid grid-cols-3 place-items-center gap-3 py-1 sm:flex sm:flex-wrap sm:items-center sm:justify-between sm:gap-4">
        {social.map((item) => {
          const Icon = socialIcons[item.id];
          const label = t(socialLabelKeys[item.id]);

          return (
            <a
              key={item.id}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              title={label}
              className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-[#e8edf5] bg-white p-3.5 text-[var(--brand-blue)] shadow-sm transition-colors hover:border-[var(--brand-blue)] hover:bg-[#eff6ff] hover:shadow-md sm:h-16 sm:w-16 sm:p-4"
            >
              <Icon className="h-6 w-6 shrink-0 sm:h-7 sm:w-7" aria-hidden="true" />
            </a>
          );
        })}
      </div>
    </div>
  );
}

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
  href?: string;
  description: string;
  external?: boolean;
}) {
  const Icon = methodIcons[id];
  const className =
    "flex items-start gap-4 rounded-2xl border border-[#e8edf5] bg-[#f5f7fa] p-5 transition-colors";

  const content = (
    <>
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
    </>
  );

  if (!href) {
    return <div className={className}>{content}</div>;
  }

  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className={`${className} hover:border-[var(--brand-blue)] hover:bg-[#eff6ff]`}
    >
      {content}
    </a>
  );
}

export function ContactInfo() {
  const t = useTranslations("contact");
  const tCommon = useTranslations("common");
  const settings = useSiteSettings();
  const whatsappUrl = useWhatsAppUrl();
  const methods = getContactMethods(settings);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-[1.5rem] font-bold tracking-[-0.02em] text-[var(--brand-navy)] sm:text-[1.65rem]">
          {t("infoTitle")}
        </h2>
        <p className="mt-2 text-[15px] leading-relaxed text-[var(--muted)]">
          {t("infoDescription")}
        </p>
      </div>

      <div className="space-y-4">
        {methods.map((method) => {
          const keys = methodLabelKeys[method.id];
          const description =
            keys.description === null ? method.description : t(keys.description);

          return (
            <ContactCard
              key={method.id}
              id={method.id}
              title={t(keys.title)}
              value={method.value}
              href={"href" in method ? method.href : undefined}
              description={description}
              external={"href" in method && method.id !== "address"}
            />
          );
        })}
      </div>

      <ContactSocialLinks />

      {whatsappUrl ? (
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--brand-red)] px-5 py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-[#c9181e]"
        >
          <FaWhatsapp className="h-4 w-4" aria-hidden="true" />
          {tCommon("chatOnWhatsapp")}
        </a>
      ) : null}
    </div>
  );
}
