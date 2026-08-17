import { mkdir, unlink, writeFile, access, readFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import {
  ALLOWED_UPLOAD_IMAGE_TYPES,
  MAX_UPLOAD_IMAGE_BYTES,
  MAX_UPLOAD_IMAGE_LABEL,
} from "@/constants/config";
import { AppError } from "@/server/utils/errors";
import { mediaRepository } from "@/server/database/repositories/media.repository";

const MAX_IMAGE_SIZE = MAX_UPLOAD_IMAGE_BYTES;

const ALLOWED_IMAGE_TYPES = new Set<string>(ALLOWED_UPLOAD_IMAGE_TYPES);

function getFileExtension(file: File) {
  const byType: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/svg+xml": ".svg",
  };

  return byType[file.type] ?? path.extname(file.name) ?? ".bin";
}

/** Local disk cache for uploads. Durability comes from the media_files table. */
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

/**
 * Canonical storage path (`/uploads/...`) for a value that may arrive as an
 * absolute URL or as the `/api/media/...` form used in API responses.
 */
export function toRelativeUploadPath(filePath: string | null | undefined) {
  if (!filePath) return null;

  let value = filePath;

  if (value.startsWith("http://") || value.startsWith("https://")) {
    try {
      value = new URL(value).pathname;
    } catch {
      return null;
    }
  }

  if (!value.startsWith("/")) {
    value = `/${value}`;
  }

  if (value.startsWith("/api/media/")) {
    value = `/uploads/${value.slice("/api/media/".length)}`;
  }

  return value;
}

export async function saveImageUpload(file: File, folder: string) {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new AppError("Only JPG, PNG, WEBP, or SVG images are allowed", 422);
  }

  if (file.size > MAX_IMAGE_SIZE) {
    throw new AppError(
      `Image size must be ${MAX_UPLOAD_IMAGE_LABEL} or less`,
      422,
    );
  }

  const relativeDir = toUploadsRelativeDir(folder);
  const fileName = `${randomUUID()}${getFileExtension(file)}`;
  const relativeUrl = `/uploads/${relativeDir}/${fileName}`.replace(
    /\/{2,}/g,
    "/",
  );
  const buffer = Buffer.from(await file.arrayBuffer());

  // The database is the source of truth: container disks are wiped on redeploy.
  try {
    await mediaRepository.save({
      path: relativeUrl,
      contentType: file.type || getUploadContentType(fileName),
      data: buffer,
    });
  } catch (error) {
    console.error(`[evimersin] Failed to store upload ${relativeUrl}:`, error);
    throw new AppError("Could not save the uploaded image. Please try again.", 500);
  }

  await writeDiskCopy(relativeDir, fileName, buffer);

  // Always store relative paths so localhost/prod URLs never break images.
  return relativeUrl;
}

/** Best effort local copy so repeat reads skip the database. Never fatal. */
async function writeDiskCopy(
  relativeDir: string,
  fileName: string,
  buffer: Buffer,
) {
  try {
    const uploadDir = path.join(getUploadRoot(), relativeDir);
    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, fileName), buffer);
  } catch (error) {
    console.warn(
      `[evimersin] Upload stored in database but not on disk (${
        error instanceof Error ? error.message : String(error)
      }). Serving will still work.`,
    );
  }
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

export type UploadContent = {
  buffer: Buffer;
  contentType: string;
};

/**
 * Read an uploaded file: database first (survives redeploys), then the local
 * disk cache, then the seed assets shipped in `public/uploads`.
 */
export async function readUploadContent(
  relativeUrlPath: string,
): Promise<UploadContent | null> {
  const relative = toRelativeUploadPath(relativeUrlPath);
  if (!relative?.startsWith("/uploads/")) return null;

  try {
    const stored = await mediaRepository.findByPath(relative);
    if (stored) {
      return {
        buffer: Buffer.isBuffer(stored.data)
          ? stored.data
          : Buffer.from(stored.data),
        contentType: stored.content_type || getUploadContentType(relative),
      };
    }
  } catch (error) {
    console.error(`[evimersin] Media lookup failed for ${relative}:`, error);
  }

  const absolutePath = await resolveUploadFile(relative);
  if (!absolutePath) return null;

  return {
    buffer: await readFile(absolutePath),
    contentType: getUploadContentType(absolutePath),
  };
}

/** True when the upload is readable from the database or from disk. */
export async function uploadExists(relativeUrlPath: string) {
  const relative = toRelativeUploadPath(relativeUrlPath);
  if (!relative?.startsWith("/uploads/")) return false;

  try {
    if (await mediaRepository.exists(relative)) return true;
  } catch (error) {
    console.error(`[evimersin] Media check failed for ${relative}:`, error);
  }

  return (await resolveUploadFile(relative)) !== null;
}

export async function removeUploadedFile(filePath: string | null | undefined) {
  if (!filePath) return;

  const relative = toRelativeUploadPath(filePath);
  if (relative?.startsWith("/uploads/")) {
    try {
      await mediaRepository.remove(relative);
    } catch (error) {
      console.error(`[evimersin] Could not delete media ${relative}:`, error);
    }
  }

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
