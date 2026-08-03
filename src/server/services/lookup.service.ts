import {
  categoryRepository,
  cityRepository,
  countryRepository,
  purposeRepository,
  regionRepository,
} from "@/server/database/repositories/lookup.repository";
import type {
  Category,
  CategoryWithStats,
  CreateCategoryInput,
  CreateCityInput,
  CreateCountryInput,
  CreatePurposeInput,
  CreateRegionInput,
  UpdateCategoryInput,
  UpdateCityInput,
  UpdateCountryInput,
  UpdatePurposeInput,
  UpdateRegionInput,
} from "@/server/types/lookup.types";
import { AppError } from "@/server/utils/errors";
import { toRelativeUploadPath } from "@/server/utils/upload";
import { toAbsoluteImageUrl } from "@/lib/image-url";

function withAbsoluteCategoryIcon<T extends Category>(category: T): T {
  return {
    ...category,
    icon: toAbsoluteImageUrl(category.icon),
  };
}

function normalizeStoredIcon(icon: string | null | undefined) {
  if (icon === undefined) return undefined;
  if (icon === null || icon === "") return null;
  return toRelativeUploadPath(icon) ?? icon;
}

function normalizeProductsCount<T extends { products_count: number | string }>(
  row: T,
): T {
  return {
    ...row,
    products_count: Number(row.products_count ?? 0),
  };
}

export const countryService = {
  list: () => countryRepository.findAllWithCities(),

  async getById(id: number) {
    const country = await countryRepository.findByIdWithCities(id);
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
  list: (countryId?: number) => cityRepository.findAllWithCountry(countryId),

  async listByCountry(countryId: number) {
    await countryService.getById(countryId);
    return cityRepository.findAllWithCountry(countryId);
  },

  async getById(id: number) {
    const city = await cityRepository.findByIdWithCountry(id);
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
    if (await cityRepository.hasRegions(id)) {
      throw new AppError(
        "City cannot be deleted while it has regions. Delete or reassign those regions first.",
        409,
      );
    }
    await cityRepository.delete(id);
  },
};

export const regionService = {
  list: (cityId?: number) => regionRepository.findAllWithCity(cityId),

  async listByCity(cityId: number) {
    await cityService.getById(cityId);
    return regionRepository.findAllWithCity(cityId);
  },

  async getById(id: number) {
    const region = await regionRepository.findByIdWithCity(id);
    if (!region) throw new AppError("Region not found", 404);
    return region;
  },

  async create(input: CreateRegionInput) {
    await cityService.getById(input.city_id);
    return this.getById(await regionRepository.create(input));
  },

  async update(id: number, input: UpdateRegionInput) {
    await this.getById(id);
    if (input.city_id !== undefined) {
      await cityService.getById(input.city_id);
    }
    await regionRepository.update(id, input);
    return this.getById(id);
  },

  async remove(id: number) {
    await this.getById(id);
    if (await regionRepository.hasProducts(id)) {
      throw new AppError(
        "Region cannot be deleted while it has residential units. Delete or reassign those units first.",
        409,
      );
    }
    await regionRepository.delete(id);
  },
};

export const categoryService = {
  async list(): Promise<CategoryWithStats[]> {
    const categories = await categoryRepository.findAllWithStats();
    return categories.map((item) =>
      withAbsoluteCategoryIcon(normalizeProductsCount(item)),
    );
  },

  async getById(id: number) {
    const category = await categoryRepository.findByIdWithStats(id);
    if (!category) throw new AppError("Category not found", 404);
    return withAbsoluteCategoryIcon(normalizeProductsCount(category));
  },

  async create(input: CreateCategoryInput) {
    const id = await categoryRepository.create({
      ...input,
      icon: normalizeStoredIcon(input.icon) ?? null,
    });
    return this.getById(id);
  },

  async update(id: number, input: UpdateCategoryInput) {
    await this.getById(id);
    await categoryRepository.update(id, {
      ...input,
      icon:
        input.icon !== undefined ? normalizeStoredIcon(input.icon) : undefined,
    });
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
  async list() {
    const purposes = await purposeRepository.findAllWithStats();
    return purposes.map(normalizeProductsCount);
  },

  async getById(id: number) {
    const purpose = await purposeRepository.findByIdWithStats(id);
    if (!purpose) throw new AppError("Purpose not found", 404);
    return normalizeProductsCount(purpose);
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

/** Public website lookups: active countries with cities + categories + purposes */
export const publicLookupService = {
  async getAll() {
    const [countries, categories, purposes] = await Promise.all([
      countryRepository.findAllWithCities(),
      categoryRepository.findAllWithStats(),
      purposeRepository.findAllWithStats(),
    ]);

    return {
      countries: countries
        .filter((country) => Number(country.status) === 1)
        .map((country) => ({
          ...country,
          cities: country.cities.filter((city) => Number(city.status) === 1),
          cities_count: country.cities.filter((city) => Number(city.status) === 1)
            .length,
        })),
      categories: categories
        .filter((item) => Number(item.status) === 1)
        .map((item) =>
          withAbsoluteCategoryIcon(normalizeProductsCount(item)),
        ),
      purposes: purposes
        .filter((item) => Number(item.status) === 1)
        .map(normalizeProductsCount),
    };
  },
};
