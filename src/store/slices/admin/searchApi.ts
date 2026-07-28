import { api } from "@/store/api/baseApi";
import type { ApiResponse } from "@/store/api/types";

export type DashboardSearchType =
  | "products"
  | "categories"
  | "cities"
  | "purposes";

export type DashboardSearchHit = {
  type: DashboardSearchType;
  id: number;
  title: string;
  subtitle: string | null;
  image: string | null;
};

export type DashboardSearchResponse = {
  query: string;
  results: DashboardSearchHit[];
};

export const searchApi = api.injectEndpoints({
  endpoints: (builder) => ({
    searchDashboard: builder.query<DashboardSearchResponse, string>({
      query: (q) => ({
        url: "/admin/search",
        params: { q },
      }),
      transformResponse: (response: ApiResponse<DashboardSearchResponse>) =>
        response.data,
    }),
  }),
});

export const { useSearchDashboardQuery, useLazySearchDashboardQuery } =
  searchApi;
