import { mkdir, unlink, writeFile, access } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { AppError } from "@/server/utils/errors";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml",
]);

function getFileExtension(file: File) {
  const byType: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/svg+xml": ".svg",
  };

  return byType[file.type] ?? path.extname(file.name) ?? ".bin";
}

/** Durable upload root (mount this on Easypanel). Falls back to ./storage/uploads */
export function getUploadRoot() {
  const configured = process.env.UPLOAD_DIR?.trim();
  if (configured) return path.resolve(configured);
  return path.join(process.cwd(), "storage", "uploads");
}

/** Built-in seed/demo images shipped in the image */
export function getPublicUploadRoot() {
  return path.join(process.cwd(), "public", "uploads");
}

/**
 * folder examples: "uploads/products", "uploads/products/gallery", "uploads/categories"
 * stored/served path: "/uploads/products/uuid.jpg"
 */
function toUploadsRelativeDir(folder: string) {
  const normalized = folder.replace(/\\/g, "/").replace(/^\/+/, "");
  if (normalized === "uploads" || normalized.startsWith("uploads/")) {
    return normalized.slice("uploads/".length);
  }
  return normalized;
}

export function toRelativeUploadPath(filePath: string | null | undefined) {
  if (!filePath) return null;

  if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
    try {
      const pathname = new URL(filePath).pathname;
      return pathname.startsWith("/") ? pathname : `/${pathname}`;
    } catch {
      return null;
    }
  }

  return filePath.startsWith("/") ? filePath : `/${filePath}`;
}

export async function saveImageUpload(file: File, folder: string) {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new AppError("Only JPG, PNG, WEBP, or SVG images are allowed", 422);
  }

  if (file.size > MAX_IMAGE_SIZE) {
    throw new AppError("Image size must be 5MB or less", 422);
  }

  const relativeDir = toUploadsRelativeDir(folder);
  const uploadDir = path.join(getUploadRoot(), relativeDir);
  await mkdir(uploadDir, { recursive: true });

  const fileName = `${randomUUID()}${getFileExtension(file)}`;
  const filePath = path.join(uploadDir, fileName);
  const buffer = Buffer.from(await file.arrayBuffer());

  await writeFile(filePath, buffer);

  // Always store relative paths so localhost/prod URLs never break images.
  return `/uploads/${relativeDir}/${fileName}`.replace(/\/{2,}/g, "/");
}

function resolveSafeUploadPath(relativeUrlPath: string, root: string) {
  const clean = relativeUrlPath.replace(/^\/+/, "").replace(/^uploads\/?/, "");
  if (!clean || clean.includes("\0") || clean.split(/[/\\]/).includes("..")) {
    return null;
  }

  const absolute = path.resolve(root, clean);
  const rootResolved = path.resolve(root);
  if (
    absolute !== rootResolved &&
    !absolute.startsWith(rootResolved + path.sep)
  ) {
    return null;
  }
  return absolute;
}

async function fileExists(filePath: string) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

/** Resolve an /uploads/... URL to a real file (storage first, then public/). */
export async function resolveUploadFile(relativeUrlPath: string) {
  const relative = toRelativeUploadPath(relativeUrlPath);
  if (!relative?.startsWith("/uploads/")) return null;

  const fromStorage = resolveSafeUploadPath(relative, getUploadRoot());
  if (fromStorage && (await fileExists(fromStorage))) {
    return fromStorage;
  }

  const fromPublic = resolveSafeUploadPath(relative, getPublicUploadRoot());
  if (fromPublic && (await fileExists(fromPublic))) {
    return fromPublic;
  }

  return null;
}

export async function removeUploadedFile(filePath: string | null | undefined) {
  if (!filePath) return;

  const absolutePath = await resolveUploadFile(filePath);
  if (!absolutePath) return;

  // Only delete runtime uploads from storage (never wipe seeded public assets).
  const storageRoot = path.resolve(getUploadRoot());
  if (!absolutePath.startsWith(storageRoot + path.sep) && absolutePath !== storageRoot) {
    return;
  }

  try {
    await unlink(absolutePath);
  } catch {
    // ignore missing files
  }
}

const CONTENT_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".gif": "image/gif",
};

export function getUploadContentType(filePath: string) {
  return CONTENT_TYPES[path.extname(filePath).toLowerCase()] ?? "application/octet-stream";
}
