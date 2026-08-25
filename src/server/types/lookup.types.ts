export type Status = 0 | 1;

export type Country = {
  id: number;
  name: string;
  status: Status;
};

export type City = {
  id: number;
  name: string;
  country_id: number;
  country_name: string;
  status: Status;
};

export type CountryWithCities = Country & {
  cities_count: number;
  cities: Array<{
    id: number;
    name: string;
    status: Status;
  }>;
};

export type CityWithCountry = City & {
  country: {
    id: number;
    name: string;
    status: Status;
  };
};

export type Category = {
  id: number;
  name: string;
  name_ar: string | null;
  status: Status;
  position: number;
  icon: string | null;
};

export type CategoryWithStats = Category & {
  products_count: number;
};

export type Purpose = {
  id: number;
  name: string;
  status: Status;
  position: number;
};

export type PurposeWithStats = Purpose & {
  products_count: number;
};

export type CreateCountryInput = Omit<Country, "id">;
export type UpdateCountryInput = Partial<CreateCountryInput>;

export type CreateCityInput = Omit<City, "id" | "country_name">;
export type UpdateCityInput = Partial<CreateCityInput>;

export type Region = {
  id: number;
  name: string;
  city_id: number;
  city_name: string;
  status: Status;
};

export type RegionWithCity = Region & {
  city: {
    id: number;
    name: string;
    status: Status;
  };
};

export type CreateRegionInput = Omit<Region, "id" | "city_name">;
export type UpdateRegionInput = Partial<CreateRegionInput>;

export type CreateCategoryInput = Omit<Category, "id" | "name_ar"> & {
  name_ar?: string | null;
};
export type UpdateCategoryInput = Partial<CreateCategoryInput>;

export type CreatePurposeInput = Omit<Purpose, "id">;
export type UpdatePurposeInput = Partial<CreatePurposeInput>;
