"use client";

import type { IconType } from "react-icons";
import {
  FaFacebook,
  FaInstagram,
  FaTelegram,
  FaTiktok,
  FaYoutube,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { useTranslations } from "next-intl";
import {
  SOCIAL_PLATFORM_CONFIG,
  type SocialPlatformId,
} from "@/constants/social-platforms";
import { useSiteSettings } from "@/components/providers/SiteSettingsProvider";
import { getContactSocial } from "@/features/contact/data";

const socialIcons: Record<SocialPlatformId, IconType> = {
  instagram: FaInstagram,
  facebook: FaFacebook,
  x: FaXTwitter,
  telegram: FaTelegram,
  youtube: FaYoutube,
  tiktok: FaTiktok,
};

const labelKeys = Object.fromEntries(
  SOCIAL_PLATFORM_CONFIG.map((platform) => [platform.id, platform.contactTitleKey]),
) as Record<SocialPlatformId, (typeof SOCIAL_PLATFORM_CONFIG)[number]["contactTitleKey"]>;

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
