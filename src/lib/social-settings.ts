import { SOCIAL_PLATFORMS, type SocialPlatformId } from "@/constants/social-platforms";
import type { UpdateSiteSettingsInput } from "@/server/types/settings.types";

const PLATFORM_LABELS: Record<SocialPlatformId, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  x: "X",
  telegram: "Telegram",
  youtube: "YouTube",
  tiktok: "TikTok",
};

export function deriveSocialHandleFromUrl(
  url: string,
  platform: SocialPlatformId,
): string {
  const trimmed = url.trim();
  if (!trimmed) return PLATFORM_LABELS[platform];

  try {
    const parsed = new URL(trimmed);
    const segment =
      parsed.pathname.split("/").filter(Boolean).pop()?.replace(/^@/, "") ?? "";

    if (!segment) return PLATFORM_LABELS[platform];

    if (platform === "instagram" || platform === "x" || platform === "tiktok") {
      return `@${segment}`;
    }

    return segment;
  } catch {
    return PLATFORM_LABELS[platform];
  }
}

export function normalizeSocialSettings(
  input: Omit<UpdateSiteSettingsInput, `${SocialPlatformId}_handle`>,
): UpdateSiteSettingsInput {
  const normalized = { ...input } as UpdateSiteSettingsInput;

  for (const platform of SOCIAL_PLATFORMS) {
    const urlKey = `${platform}_url` as `${SocialPlatformId}_url`;
    const handleKey = `${platform}_handle` as `${SocialPlatformId}_handle`;
    normalized[handleKey] = deriveSocialHandleFromUrl(input[urlKey], platform);
  }

  return normalized;
}
