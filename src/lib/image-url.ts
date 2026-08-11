export function getAppBaseUrl() {
  const raw = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return raw.replace(/\/$/, "");
}

export function toDisplayImageSrc(url: string | null | undefined) {
  if (!url) return "";

  let value = url.trim();
  if (!value) return "";

  // blob: / data: previews from file inputs
  if (value.startsWith("blob:") || value.startsWith("data:")) {
    return value;
  }

  // Absolute URL → pathname for uploaded assets
  if (value.startsWith("http://") || value.startsWith("https://")) {
    try {
      const parsed = new URL(value);
      value = parsed.pathname || "";
    } catch {
      return "";
    }
  }

  value = value.replace(/\\/g, "/");

  if (!value.startsWith("/")) {
    value = `/${value}`;
  }

  // Repair paths that lost the /uploads prefix after bad migrations/stores
  if (
    value.startsWith("/products/") ||
    value.startsWith("/categories/") ||
    value.startsWith("/products/gallery/") ||
    value.startsWith("/hero-slides/")
  ) {
    value = `/uploads${value}`;
  }

  // Collapse accidental double prefixes
  value = value.replace(/^\/uploads\/uploads\//, "/uploads/");

  // Known corrupt seed file that 500s on some hosts → working duplicate
  if (
    value === "/uploads/products/16e546d2-9ea3-4ed3-bc35-5a8f0bc49ee8.jpg"
  ) {
    value = "/uploads/products/8fa18561-17a3-42b6-81b3-c47f6e423104.jpg";
  }

  return value;
}

/** Serve uploaded files via the API route (reliable in standalone / dashboard). */
export function toUploadServeSrc(url: string | null | undefined) {
  const relative = toDisplayImageSrc(url);
  if (!relative) return "";

  if (
    relative.startsWith("blob:") ||
    relative.startsWith("data:") ||
    relative.startsWith("/api/media/")
  ) {
    return relative;
  }

  if (relative.startsWith("/uploads/")) {
    return `/api/media/${relative.slice("/uploads/".length)}`;
  }

  return relative;
}

/** Disk path under `/uploads/...` (from DB, `/uploads/`, or `/api/media/` URLs). */
export function toUploadStoragePath(url: string | null | undefined) {
  const relative = toDisplayImageSrc(url);
  if (!relative) return "";

  if (relative.startsWith("/api/media/")) {
    return `/uploads/${relative.slice("/api/media/".length)}`;
  }

  return relative;
}

/** Alternate public path when /api/media fails (direct upload rewrite). */
export function toUploadPublicSrc(url: string | null | undefined) {
  return toUploadStoragePath(url);
}

/** Try /uploads first, then /api/media — for dashboard and hero slider. */
export function getUploadSrcCandidates(url: string | null | undefined) {
  const storage = toUploadStoragePath(url);
  const serve = toUploadServeSrc(url);

  const candidates: string[] = [];
  if (storage.startsWith("/uploads/")) candidates.push(storage);
  if (serve && !candidates.includes(serve)) candidates.push(serve);

  return candidates;
}

/** Absolute URL for API responses (DB still stores relative `/uploads/...`). */
export function toAbsoluteImageUrl(url: string | null | undefined) {
  if (url == null || url === "") return null;

  const trimmed = url.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith("blob:") || trimmed.startsWith("data:")) {
    return trimmed;
  }

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    const relative = toDisplayImageSrc(trimmed);
    return relative ? `${getAppBaseUrl()}${relative}` : null;
  }

  const relative = toDisplayImageSrc(trimmed);
  if (!relative) return null;
  return `${getAppBaseUrl()}${relative}`;
}

export function isUploadImageSrc(src: string) {
  return (
    src.startsWith("/uploads/") ||
    src.startsWith("/api/media/") ||
    src.includes("/uploads/") ||
    src.includes("/api/media/")
  );
}
