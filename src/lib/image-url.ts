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
    value.startsWith("/products/gallery/")
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

export function isUploadImageSrc(src: string) {
  return src.startsWith("/uploads/") || src.includes("/uploads/");
}
