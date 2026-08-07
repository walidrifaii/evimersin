export function deriveSocialHandleFromUrl(
  url: string,
  platform: "instagram" | "facebook",
): string {
  try {
    const segment =
      new URL(url.trim()).pathname.split("/").filter(Boolean).pop() ?? "";
    if (!segment) {
      return platform === "instagram" ? "Instagram" : "Facebook";
    }

    const cleaned = segment.replace(/^@/, "");
    return platform === "instagram" ? `@${cleaned}` : cleaned;
  } catch {
    return platform === "instagram" ? "Instagram" : "Facebook";
  }
}
