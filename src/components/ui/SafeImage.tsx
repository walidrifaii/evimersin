"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useMemo, useState } from "react";
import {
  getUploadSrcCandidates,
  isUploadImageSrc,
  toDisplayImageSrc,
} from "@/lib/image-url";

type SafeImageProps = Omit<ImageProps, "src" | "alt"> & {
  src: ImageProps["src"] | null | undefined;
  alt: string;
  fallbackClassName?: string;
};

/**
 * Robust image for dashboard/website uploads:
 * - serves via /api/media (works in standalone dashboard)
 * - falls back to /uploads if needed
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
  const [candidateIndex, setCandidateIndex] = useState(0);

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

  const uploadCandidates = useMemo(
    () =>
      typeof resolvedSrc === "string" && isUploadImageSrc(resolvedSrc)
        ? getUploadSrcCandidates(resolvedSrc)
        : [],
    [resolvedSrc],
  );

  const activeUploadSrc =
    uploadCandidates[candidateIndex] ?? uploadCandidates[0] ?? "";

  useEffect(() => {
    setFailed(false);
    setCandidateIndex(0);
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

  const displaySrc =
    typeof resolvedSrc === "string" && uploadCandidates.length > 0
      ? activeUploadSrc
      : resolvedSrc;

  const shouldSkipOptimize =
    unoptimized ??
    (typeof displaySrc === "string" &&
      (isUploadImageSrc(displaySrc) ||
        displaySrc.startsWith("blob:") ||
        displaySrc.startsWith("data:") ||
        displaySrc.endsWith(".svg")));

  // Uploaded assets: native <img> via /api/media (and /uploads fallback).
  if (typeof displaySrc === "string" && shouldSkipOptimize) {
    const { fill, width, height, sizes: _sizes, ...imgProps } = props;
    const imgClassName = fill
      ? `absolute inset-0 h-full w-full ${className ?? ""}`
      : className;

    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        {...imgProps}
        src={displaySrc}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        className={imgClassName}
        onError={(event) => {
          if (candidateIndex + 1 < uploadCandidates.length) {
            setCandidateIndex((current) => current + 1);
            return;
          }
          setFailed(true);
          onError?.(event as Parameters<NonNullable<ImageProps["onError"]>>[0]);
        }}
      />
    );
  }

  return (
    <Image
      {...props}
      src={displaySrc}
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
