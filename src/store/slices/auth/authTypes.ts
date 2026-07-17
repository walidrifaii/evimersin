export type AuthAdmin = {
  id: number;
  username: string;
  name: string;
  status: number;
};

export type AuthSession = {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: string;
  admin: AuthAdmin;
};

export type LoginRequest = {
  username: string;
  password: string;
};
