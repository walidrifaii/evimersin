import {
  getImageTypeRejection,
  getImageUploadRejection,
  MAX_ORIGINAL_IMAGE_BYTES,
  MAX_UPLOAD_IMAGE_BYTES,
} from "@/constants/config";

const DEFAULT_MAX_WIDTH = 1200;
const DEFAULT_QUALITY = 0.8;
const MIN_WIDTH = 400;
const MIN_QUALITY = 0.4;

function toJpegName(fileName: string) {
  const base = fileName.replace(/\.[^/.]+$/, "") || "image";
  return `${base}.jpg`;
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  quality: number,
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/jpeg", quality);
  });
}

function drawScaledImage(img: HTMLImageElement, maxWidth: number) {
  const scale = Math.min(1, maxWidth / img.width);
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(img.width * scale));
  canvas.height = Math.max(1, Math.round(img.height * scale));

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas 2D is not supported");
  }

  // JPEG has no alpha; fill white so transparent PNG/WEBP areas stay light.
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas;
}

/**
 * Resize and JPEG-encode a raster image in the browser until it is at most
 * 500KB.
 */
export function compressImage(
  file: File,
  maxWidth = DEFAULT_MAX_WIDTH,
  quality = DEFAULT_QUALITY,
): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    const cleanup = () => URL.revokeObjectURL(objectUrl);

    img.onload = async () => {
      try {
        let width = Math.min(img.width, maxWidth);
        let currentQuality = quality;
        let blob: Blob | null = null;

        while (true) {
          const canvas = drawScaledImage(img, width);
          blob = await canvasToBlob(canvas, currentQuality);

          if (!blob) {
            cleanup();
            reject(new Error("Failed to compress image"));
            return;
          }

          const atFloor = width <= MIN_WIDTH && currentQuality <= MIN_QUALITY;
          if (blob.size <= MAX_UPLOAD_IMAGE_BYTES || atFloor) {
            break;
          }

          if (currentQuality > MIN_QUALITY) {
            currentQuality = Math.max(MIN_QUALITY, currentQuality - 0.1);
          } else {
            width = Math.max(MIN_WIDTH, Math.round(width * 0.85));
            currentQuality = quality;
          }
        }

        cleanup();

        if (!blob) {
          reject(new Error("Failed to compress image"));
          return;
        }

        const compressedFile = new File([blob], toJpegName(file.name), {
          type: "image/jpeg",
          lastModified: Date.now(),
        });

        resolve(compressedFile);
      } catch (error) {
        cleanup();
        reject(error);
      }
    };

    img.onerror = () => {
      cleanup();
      reject(new Error("Could not read the image"));
    };

    img.src = objectUrl;
  });
}

export type PreparedImage =
  | { ok: true; file: File }
  | { ok: false; reason: string };

/** Type-check, compress, then enforce the 500KB upload cap. */
export async function prepareImageForUpload(
  file: File,
  maxWidth = DEFAULT_MAX_WIDTH,
): Promise<PreparedImage> {
  const typeRejection = getImageTypeRejection(file);
  if (typeRejection) {
    return { ok: false, reason: typeRejection };
  }

  if (file.size > MAX_ORIGINAL_IMAGE_BYTES) {
    const megabytes = (file.size / (1024 * 1024)).toFixed(1);
    return {
      ok: false,
      reason: `${file.name} is ${megabytes}MB. Choose a smaller image to compress`,
    };
  }

  try {
    const compressed = await compressImage(file, maxWidth);
    const rejection = getImageUploadRejection(compressed);
    if (rejection) {
      return { ok: false, reason: rejection };
    }
    return { ok: true, file: compressed };
  } catch {
    return { ok: false, reason: `Could not compress ${file.name}` };
  }
}
