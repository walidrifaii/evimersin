import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { AppError } from "@/server/utils/errors";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

function getAppBaseUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(
    /\/$/,
    "",
  );
}

function toRelativeUploadPath(filePath: string) {
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

export async function saveImageUpload(file: File, folder: string) {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new AppError("Only JPG, PNG, WEBP, or SVG images are allowed", 422);
  }

  if (file.size > MAX_IMAGE_SIZE) {
    throw new AppError("Image size must be 5MB or less", 422);
  }

  const uploadDir = path.join(process.cwd(), "public", folder);
  await mkdir(uploadDir, { recursive: true });

  const fileName = `${randomUUID()}${getFileExtension(file)}`;
  const filePath = path.join(uploadDir, fileName);
  const buffer = Buffer.from(await file.arrayBuffer());

  await writeFile(filePath, buffer);

  const relativePath = `/${folder.replace(/\\/g, "/")}/${fileName}`;
  return `${getAppBaseUrl()}${relativePath}`;
}

export async function removeUploadedFile(filePath: string | null | undefined) {
  if (!filePath) return;

  const relativePath = toRelativeUploadPath(filePath);
  if (!relativePath?.startsWith("/uploads/")) return;

  const absolutePath = path.join(process.cwd(), "public", relativePath);

  try {
    await unlink(absolutePath);
  } catch {
    // ignore missing files
  }
}
