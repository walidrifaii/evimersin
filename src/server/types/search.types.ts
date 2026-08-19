export type DashboardSearchType =
  | "products"
  | "categories"
  | "countries"
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
