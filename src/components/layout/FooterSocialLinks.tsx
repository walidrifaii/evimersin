"use client";

import type { IconType } from "react-icons";
import { FaFacebook, FaInstagram } from "react-icons/fa";
import { useTranslations } from "next-intl";
import { useSiteSettings } from "@/components/providers/SiteSettingsProvider";
import { getContactSocial } from "@/features/contact/data";

const socialIcons = {
  instagram: FaInstagram,
  facebook: FaFacebook,
} as const satisfies Record<string, IconType>;

const labelKeys = {
  instagram: "socialInstagram",
  facebook: "socialFacebook",
} as const;

export function FooterSocialLinks({ className = "" }: { className?: string }) {
  const settings = useSiteSettings();
  const t = useTranslations("contact");
  const social = getContactSocial(settings);

  if (social.length === 0) return null;

  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`.trim()}>
      {social.map((item) => {
        const Icon = socialIcons[item.id];
        const label = t(labelKeys[item.id]);

        return (
          <a
            key={item.id}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            title={label}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/8 text-white transition-colors hover:border-white/30 hover:bg-white/15"
          >
            <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
          </a>
        );
      })}
    </div>
  );
}
