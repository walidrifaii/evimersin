export const SOCIAL_PLATFORMS = [
  "instagram",
  "facebook",
  "x",
  "telegram",
  "youtube",
  "tiktok",
] as const;

export type SocialPlatformId = (typeof SOCIAL_PLATFORMS)[number];

export const SOCIAL_PLATFORM_CONFIG: ReadonlyArray<{
  id: SocialPlatformId;
  label: string;
  placeholder: string;
  contactTitleKey:
    | "socialInstagram"
    | "socialFacebook"
    | "socialX"
    | "socialTelegram"
    | "socialYoutube"
    | "socialTiktok";
  contactDescKey:
    | "socialInstagramDesc"
    | "socialFacebookDesc"
    | "socialXDesc"
    | "socialTelegramDesc"
    | "socialYoutubeDesc"
    | "socialTiktokDesc";
}> = [
  {
    id: "instagram",
    label: "Instagram",
    placeholder: "https://instagram.com/evimersin",
    contactTitleKey: "socialInstagram",
    contactDescKey: "socialInstagramDesc",
  },
  {
    id: "facebook",
    label: "Facebook",
    placeholder: "https://facebook.com/evimersin",
    contactTitleKey: "socialFacebook",
    contactDescKey: "socialFacebookDesc",
  },
  {
    id: "x",
    label: "X (Twitter)",
    placeholder: "https://x.com/evimersin",
    contactTitleKey: "socialX",
    contactDescKey: "socialXDesc",
  },
  {
    id: "telegram",
    label: "Telegram",
    placeholder: "https://t.me/evimersin",
    contactTitleKey: "socialTelegram",
    contactDescKey: "socialTelegramDesc",
  },
  {
    id: "youtube",
    label: "YouTube",
    placeholder: "https://youtube.com/@evimersin",
    contactTitleKey: "socialYoutube",
    contactDescKey: "socialYoutubeDesc",
  },
  {
    id: "tiktok",
    label: "TikTok",
    placeholder: "https://tiktok.com/@evimersin",
    contactTitleKey: "socialTiktok",
    contactDescKey: "socialTiktokDesc",
  },
];

export type SocialPlatformFields = {
  [K in SocialPlatformId as `${K}_url`]: string;
} & {
  [K in SocialPlatformId as `${K}_handle`]: string;
} & {
  [K in SocialPlatformId as `${K}_visible`]: boolean;
};
