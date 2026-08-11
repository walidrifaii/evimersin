"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useState } from "react";
import { isUploadImageSrc, toDisplayImageSrc } from "@/lib/image-url";

type SafeImageProps = Omit<ImageProps, "src" | "alt"> & {
  src: ImageProps["src"] | null | undefined;
  alt: string;
  fallbackClassName?: string;
};

/**
 * Robust image for dashboard/website uploads:
 * - normalizes absolute/localhost DB paths
 * - uses unoptimized for /uploads (avoids optimizer 404 noise)
 * - shows a placeholder if the file is missing
 */
export function SafeImage({
  src,
  alt,
  className,
  fallbackClassName,
  unoptimized,
  onError,
  ...props
}: SafeImageProps) {
  const normalized =
    typeof src === "string" ? toDisplayImageSrc(src) : src ?? "";
  const [failed, setFailed] = useState(false);

  const resolvedSrc =
    typeof normalized === "string"
      ? normalized
      : normalized && typeof normalized === "object"
        ? normalized
        : "";

  const srcKey =
    typeof resolvedSrc === "string"
      ? resolvedSrc
      : resolvedSrc && typeof resolvedSrc === "object" && "src" in resolvedSrc
        ? String(resolvedSrc.src)
        : "";

  useEffect(() => {
    setFailed(false);
  }, [srcKey]);

  const hasSrc =
    (typeof resolvedSrc === "string" && resolvedSrc.length > 0) ||
    (typeof resolvedSrc === "object" && resolvedSrc !== null);

  if (!hasSrc || failed) {
    return (
      <div
        className={
          fallbackClassName ??
          `flex h-full w-full items-center justify-center bg-[#eef2f7] text-[10px] font-semibold uppercase tracking-[0.08em] text-[#94a3b8] ${className ?? ""}`
        }
        aria-label={alt || "No image"}
      >
        No image
      </div>
    );
  }

  const shouldSkipOptimize =
    unoptimized ??
    (typeof resolvedSrc === "string" &&
      (isUploadImageSrc(resolvedSrc) ||
        resolvedSrc.startsWith("blob:") ||
        resolvedSrc.startsWith("data:") ||
        resolvedSrc.endsWith(".svg")));

  // Uploaded assets are served from /uploads (rewritten to /api/media). A native
  // <img> avoids Next/Image edge cases in dashboard tables and modals.
  if (typeof resolvedSrc === "string" && shouldSkipOptimize) {
    const { fill, width, height, sizes: _sizes, ...imgProps } = props;
    const imgClassName = fill
      ? `absolute inset-0 h-full w-full ${className ?? ""}`
      : className;

    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        {...imgProps}
        src={resolvedSrc}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        className={imgClassName}
        onError={(event) => {
          setFailed(true);
          onError?.(event as Parameters<NonNullable<ImageProps["onError"]>>[0]);
        }}
      />
    );
  }

  return (
    <Image
      {...props}
      src={resolvedSrc}
      alt={alt}
      className={className}
      unoptimized={shouldSkipOptimize}
      onError={(event) => {
        setFailed(true);
        onError?.(event);
      }}
    />
  );
}
