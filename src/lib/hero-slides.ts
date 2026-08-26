import { unstable_cache } from "next/cache";
import { cache } from "react";
import { heroSlideRepository } from "@/server/database/repositories/hero-slide.repository";
import {
  toDisplayImageSrc,
  toUploadServeSrc,
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

async function loadHeroSlides(): Promise<PublicHeroSlide[]> {
  try {
    const slides = await heroSlideRepository.findActive();
    // Trust admin uploads — broken images fall back in the hero UI.
    return slides
      .map(toPublicSlide)
      .filter((slide) => slide.image.length > 0);
  } catch (error) {
    console.error("[hero-slides] Failed to load active hero slides:", error);
    return [];
  }
}

const getCachedHeroSlides = unstable_cache(loadHeroSlides, ["hero-slides"], {
  revalidate: 60,
  tags: ["hero-slides"],
});

/** Active hero slides (cached 60s). */
export const getHeroSlides = cache(async (): Promise<PublicHeroSlide[]> => {
  return getCachedHeroSlides();
});
