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

export type Category = {
  id: number;
  name: string;
  status: Status;
  position: number;
  icon: string | null;
};

export type Purpose = {
  id: number;
  name: string;
  status: Status;
  position: number;
};

export type CreateCountryInput = Omit<Country, "id">;
export type UpdateCountryInput = Partial<CreateCountryInput>;

export type CreateCityInput = Omit<City, "id" | "country_name">;
export type UpdateCityInput = Partial<CreateCityInput>;

export type CreateCategoryInput = Omit<Category, "id">;
export type UpdateCategoryInput = Partial<CreateCategoryInput>;

export type CreatePurposeInput = Omit<Purpose, "id">;
export type UpdatePurposeInput = Partial<CreatePurposeInput>;
