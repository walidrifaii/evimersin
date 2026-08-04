import { unstable_cache } from "next/cache";
import { heroSlideService } from "@/server/services/hero-slide.service";
import { toDisplayImageSrc } from "@/lib/image-url";

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
  return {
    id: slide.id,
    image: toDisplayImageSrc(slide.image),
    altText: slide.alt_text || "Hero banner",
  };
}

export async function getHeroSlides(): Promise<PublicHeroSlide[]> {
  const cached = unstable_cache(
    async () => {
      const slides = await heroSlideService.listActive();
      return slides.map(toPublicSlide);
    },
    ["hero-slides-public"],
    { revalidate: 60, tags: ["hero-slides"] },
  );

  return cached();
}
