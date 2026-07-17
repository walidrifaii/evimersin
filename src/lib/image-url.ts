export function toDisplayImageSrc(url: string | null | undefined) {
  if (!url) return "";

  if (url.startsWith("/")) return url;

  try {
    const parsed = new URL(url);
    const appBase = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const appOrigin = new URL(appBase).origin;

    if (parsed.origin === appOrigin) {
      return parsed.pathname;
    }
  } catch {
    return url;
  }

  return url;
}
