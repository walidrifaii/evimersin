export type AdminRecord = {
  id: number;
  username: string;
  password: string;
  name: string;
  status: number;
  created_at?: Date;
  updated_at?: Date;
};

export type AdminPublic = {
  id: number;
  username: string;
  name: string;
  status: number;
  created_at?: Date;
  updated_at?: Date;
};

export type CreateAdminInput = {
  username: string;
  password: string;
  name: string;
  status?: number;
};

export type UpdateAdminInput = {
  username?: string;
  password?: string;
  name?: string;
  status?: number;
};

export type LoginInput = {
  username: string;
  password: string;
};

export type AuthTokenPayload = {
  sub: number;
  username: string;
  name: string;
};
