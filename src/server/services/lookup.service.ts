import {
  categoryRepository,
  cityRepository,
  countryRepository,
  purposeRepository,
} from "@/server/database/repositories/lookup.repository";
import type {
  CreateCategoryInput,
  CreateCityInput,
  CreateCountryInput,
  CreatePurposeInput,
  UpdateCategoryInput,
  UpdateCityInput,
  UpdateCountryInput,
  UpdatePurposeInput,
} from "@/server/types/lookup.types";
import { AppError } from "@/server/utils/errors";

export const countryService = {
  list: () => countryRepository.findAll(),

  async getById(id: number) {
    const country = await countryRepository.findById(id);
    if (!country) throw new AppError("Country not found", 404);
    return country;
  },

  async create(input: CreateCountryInput) {
    return this.getById(await countryRepository.create(input));
  },

  async update(id: number, input: UpdateCountryInput) {
    await this.getById(id);
    await countryRepository.update(id, input);
    return this.getById(id);
  },

  async remove(id: number) {
    await this.getById(id);
    if (await countryRepository.hasCities(id)) {
      throw new AppError("Country cannot be deleted while it has cities", 409);
    }
    await countryRepository.delete(id);
  },
};

export const cityService = {
  list: () => cityRepository.findAll(),

  async getById(id: number) {
    const city = await cityRepository.findById(id);
    if (!city) throw new AppError("City not found", 404);
    return city;
  },

  async create(input: CreateCityInput) {
    await countryService.getById(input.country_id);
    return this.getById(await cityRepository.create(input));
  },

  async update(id: number, input: UpdateCityInput) {
    await this.getById(id);
    if (input.country_id !== undefined) {
      await countryService.getById(input.country_id);
    }
    await cityRepository.update(id, input);
    return this.getById(id);
  },

  async remove(id: number) {
    await this.getById(id);
    if (await cityRepository.hasProducts(id)) {
      throw new AppError(
        "City cannot be deleted while it has residential units. Delete or reassign those units first.",
        409,
      );
    }
    await cityRepository.delete(id);
  },
};

export const categoryService = {
  list: () => categoryRepository.findAll(),

  async getById(id: number) {
    const category = await categoryRepository.findById(id);
    if (!category) throw new AppError("Category not found", 404);
    return category;
  },

  async create(input: CreateCategoryInput) {
    return this.getById(await categoryRepository.create(input));
  },

  async update(id: number, input: UpdateCategoryInput) {
    await this.getById(id);
    await categoryRepository.update(id, input);
    return this.getById(id);
  },

  async remove(id: number) {
    await this.getById(id);
    if (await categoryRepository.hasProducts(id)) {
      throw new AppError(
        "Category cannot be deleted while it has residential units. Delete or reassign those units first.",
        409,
      );
    }
    await categoryRepository.delete(id);
  },
};

export const purposeService = {
  list: () => purposeRepository.findAll(),

  async getById(id: number) {
    const purpose = await purposeRepository.findById(id);
    if (!purpose) throw new AppError("Purpose not found", 404);
    return purpose;
  },

  async create(input: CreatePurposeInput) {
    return this.getById(await purposeRepository.create(input));
  },

  async update(id: number, input: UpdatePurposeInput) {
    await this.getById(id);
    await purposeRepository.update(id, input);
    return this.getById(id);
  },

  async remove(id: number) {
    await this.getById(id);
    if (await purposeRepository.hasProducts(id)) {
      throw new AppError(
        "Purpose cannot be deleted while it has residential units. Delete or reassign those units first.",
        409,
      );
    }
    await purposeRepository.delete(id);
  },
};
