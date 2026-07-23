export function toDisplayImageSrc(url: string | null | undefined) {
  if (!url) return "";

  const trimmed = url.trim();
  if (!trimmed) return "";

  if (trimmed.startsWith("/")) return trimmed;

  try {
    const parsed = new URL(trimmed);
    // Always prefer pathname for uploaded assets, even if host differs
    // (localhost vs production domain).
    if (
      parsed.pathname.startsWith("/uploads/") ||
      parsed.pathname.startsWith("/_next/")
    ) {
      return parsed.pathname;
    }

    const appBase = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const appOrigin = new URL(appBase).origin;
    if (parsed.origin === appOrigin) {
      return parsed.pathname;
    }
  } catch {
    return trimmed.startsWith("uploads/") ? `/${trimmed}` : trimmed;
  }

  return trimmed;
}
