import { toDisplayImageSrc, toUploadServeSrc } from "@/lib/image-url";
import { heroSlideRepository } from "@/server/database/repositories/hero-slide.repository";
import { AppError } from "@/server/utils/errors";
import type {
  CreateHeroSlideInput,
  HeroSlide,
  UpdateHeroSlideInput,
} from "@/server/types/hero-slide.types";

function withNormalizedSlideImage(slide: HeroSlide): HeroSlide {
  const relative = toDisplayImageSrc(slide.image) || slide.image;
  return {
    ...slide,
    image: toUploadServeSrc(relative) || relative,
  };
}

export const heroSlideService = {
  async list() {
    const slides = await heroSlideRepository.findAll();
    return slides.map(withNormalizedSlideImage);
  },

  async listActive() {
    const slides = await heroSlideRepository.findActive();
    return slides.map(withNormalizedSlideImage);
  },

  async getById(id: number) {
    const slide = await heroSlideRepository.findById(id);
    if (!slide) throw new AppError("Hero slide not found", 404);
    return withNormalizedSlideImage(slide);
  },

  async create(input: CreateHeroSlideInput) {
    const slide = await heroSlideRepository.create(input);
    return withNormalizedSlideImage(slide);
  },

  async update(id: number, input: UpdateHeroSlideInput) {
    const updated = await heroSlideRepository.update(id, input);
    if (!updated) throw new AppError("Hero slide not found", 404);
    return withNormalizedSlideImage(updated);
  },

  async remove(id: number) {
    await this.getById(id);
    await heroSlideRepository.remove(id);
  },
};
