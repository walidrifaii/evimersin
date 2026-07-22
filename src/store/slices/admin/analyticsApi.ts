import { api } from "@/store/api/baseApi";
import type { ApiResponse } from "@/store/api/types";

export type AnalyticsKpi = {
  id: string;
  label: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
  hint: string;
};

export type AnalyticsChartPoint = {
  label: string;
  value: number;
};

export type AnalyticsProductRow = {
  id: number;
  name: string;
  city_name: string;
  category_name: string;
  purpose_name: string;
  price: number;
  final_price: number;
  image: string | null;
  status: 0 | 1;
  is_hot_deal: boolean;
  is_featured: boolean;
  date_created: string;
};

export type AnalyticsActivity = {
  id: string;
  title: string;
  detail: string;
  time: string;
};

export type AnalyticsSummary = {
  countries: number;
  cities: number;
  categories: number;
  purposes: number;
  featured: number;
  hotDeals: number;
  inactive: number;
};

export type DashboardAnalytics = {
  kpis: AnalyticsKpi[];
  summary: AnalyticsSummary;
  productsByDay: AnalyticsChartPoint[];
  productsByCategory: AnalyticsChartPoint[];
  productsByPurpose: AnalyticsChartPoint[];
  recentProducts: AnalyticsProductRow[];
  hotDeals: AnalyticsProductRow[];
  featuredProducts: AnalyticsProductRow[];
  activity: AnalyticsActivity[];
};

const emptySummary: AnalyticsSummary = {
  countries: 0,
  cities: 0,
  categories: 0,
  purposes: 0,
  featured: 0,
  hotDeals: 0,
  inactive: 0,
};

function normalizeAnalytics(data: Partial<DashboardAnalytics> | undefined): DashboardAnalytics {
  return {
    kpis: data?.kpis ?? [],
    summary: data?.summary ?? emptySummary,
    productsByDay: data?.productsByDay ?? [],
    productsByCategory: data?.productsByCategory ?? [],
    productsByPurpose: data?.productsByPurpose ?? [],
    recentProducts: data?.recentProducts ?? [],
    hotDeals: data?.hotDeals ?? [],
    featuredProducts: data?.featuredProducts ?? [],
    activity: data?.activity ?? [],
  };
}

export const analyticsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardAnalytics: builder.query<DashboardAnalytics, void>({
      query: () => "/admin/analytics",
      transformResponse: (response: ApiResponse<DashboardAnalytics>) =>
        normalizeAnalytics(response.data),
      providesTags: [{ type: "Analytics", id: "OVERVIEW" }],
    }),
  }),
});

export const { useGetDashboardAnalyticsQuery } = analyticsApi;
