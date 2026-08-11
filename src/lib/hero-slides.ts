import { unstable_cache } from "next/cache";
import { heroSlideService } from "@/server/services/hero-slide.service";
import { resolveUploadFile } from "@/server/utils/upload";
import { toDisplayImageSrc, toUploadServeSrc } from "@/lib/image-url";

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
  const normalized = toDisplayImageSrc(imagePath);
  if (!normalized) return false;
  if (!normalized.startsWith("/uploads/")) return true;
  return (await resolveUploadFile(normalized)) !== null;
}

export async function getHeroSlides(): Promise<PublicHeroSlide[]> {
  const cached = unstable_cache(
    async () => {
      const slides = await heroSlideService.listActive();
      const available: PublicHeroSlide[] = [];

      for (const slide of slides) {
        if (!(await slideImageExists(slide.image))) continue;
        available.push(toPublicSlide(slide));
      }

      return available;
    },
    ["hero-slides-public"],
    { revalidate: 60, tags: ["hero-slides"] },
  );

  return cached();
}
