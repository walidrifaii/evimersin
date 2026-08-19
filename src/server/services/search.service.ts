import { searchRepository } from "@/server/database/repositories/search.repository";
import type { DashboardSearchResponse } from "@/server/types/search.types";

export const searchService = {
  async search(rawQuery: string): Promise<DashboardSearchResponse> {
    const query = rawQuery.trim();
    if (!query) {
      return { query: "", results: [] };
    }

    const [products, categories, countries, cities, purposes] = await Promise.all([
      searchRepository.searchProducts(query),
      searchRepository.searchCategories(query),
      searchRepository.searchCountries(query),
      searchRepository.searchCities(query),
      searchRepository.searchPurposes(query),
    ]);

    return {
      query,
      results: [...products, ...categories, ...countries, ...cities, ...purposes],
    };
  },
};
