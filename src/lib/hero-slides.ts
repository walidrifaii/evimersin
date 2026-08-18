import { heroSlideRepository } from "@/server/database/repositories/hero-slide.repository";
import { uploadExists } from "@/server/utils/upload";
import {
  toDisplayImageSrc,
  toUploadServeSrc,
  toUploadStoragePath,
} from "@/lib/image-url";

export type PublicHeroSlide = {
  id: number;
  image: string;
  altText: string;
};

function toPublicSlide(slide: {
  id: number;
  image: string;
  alt_text: string;
}): PublicHeroSlide {
  const image =
    toUploadServeSrc(slide.image) || toDisplayImageSrc(slide.image);
  return {
    id: slide.id,
    image,
    altText: slide.alt_text || "Hero banner",
  };
}

async function slideImageExists(imagePath: string) {
  const uploadPath = toUploadStoragePath(imagePath);
  if (!uploadPath.startsWith("/uploads/")) return false;
  return uploadExists(uploadPath);
}

/** Active hero slides whose image is still readable. */
export async function getHeroSlides(): Promise<PublicHeroSlide[]> {
  try {
    const slides = await heroSlideRepository.findActive();
    const available: PublicHeroSlide[] = [];

    for (const slide of slides) {
      if (!(await slideImageExists(slide.image))) continue;
      available.push(toPublicSlide(slide));
    }

    return available;
  } catch (error) {
    console.error("[hero-slides] Failed to load active hero slides:", error);
    return [];
  }
}
