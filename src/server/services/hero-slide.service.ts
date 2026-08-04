import { heroSlideRepository } from "@/server/database/repositories/hero-slide.repository";
import { AppError } from "@/server/utils/errors";
import type {
  CreateHeroSlideInput,
  UpdateHeroSlideInput,
} from "@/server/types/hero-slide.types";

export const heroSlideService = {
  list() {
    return heroSlideRepository.findAll();
  },

  listActive() {
    return heroSlideRepository.findActive();
  },

  async getById(id: number) {
    const slide = await heroSlideRepository.findById(id);
    if (!slide) throw new AppError("Hero slide not found", 404);
    return slide;
  },

  create(input: CreateHeroSlideInput) {
    return heroSlideRepository.create(input);
  },

  async update(id: number, input: UpdateHeroSlideInput) {
    const updated = await heroSlideRepository.update(id, input);
    if (!updated) throw new AppError("Hero slide not found", 404);
    return updated;
  },

  async remove(id: number) {
    await this.getById(id);
    await heroSlideRepository.remove(id);
  },
};
