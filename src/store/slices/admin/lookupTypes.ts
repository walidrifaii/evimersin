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

export type CreateCountryInput = {
  name: string;
  status?: Status;
};

export type UpdateCountryInput = Partial<CreateCountryInput>;

export type CreateCityInput = {
  name: string;
  country_id: number;
  status?: Status;
};

export type UpdateCityInput = Partial<CreateCityInput>;

export type CreateCategoryInput = {
  name: string;
  status?: Status;
  position?: number;
  icon?: string | null;
};

export type UpdateCategoryInput = Partial<CreateCategoryInput>;

export type CategoryFormInput = {
  name: string;
  status?: Status;
  position?: number;
  icon?: File | null;
};

export type CreatePurposeInput = {
  name: string;
  status?: Status;
  position?: number;
};

export type UpdatePurposeInput = Partial<CreatePurposeInput>;
