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
  date_created: string;
};

export type AnalyticsActivity = {
  id: string;
  title: string;
  detail: string;
  time: string;
};

export type DashboardAnalytics = {
  kpis: AnalyticsKpi[];
  productsByDay: AnalyticsChartPoint[];
  productsByCategory: AnalyticsChartPoint[];
  recentProducts: AnalyticsProductRow[];
  hotDeals: AnalyticsProductRow[];
  activity: AnalyticsActivity[];
};
