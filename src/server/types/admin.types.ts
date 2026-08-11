export type AdminRecord = {
  id: number;
  username: string;
  password: string;
  name: string;
  first_name: string;
  last_name: string;
  email: string;
  status: number;
  role_id: number;
  custom_permissions: string | null;
  created_at?: Date;
  updated_at?: Date;
};

export type AdminPublic = {
  id: number;
  username: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  status: number;
  roleId: number;
  roleName: string;
  roleLabel: string;
  permissions: string[];
  created_at?: Date;
  updated_at?: Date;
};

export type CreateAdminInput = {
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  email: string;
  permissions: string[];
  status?: number;
};

export type UpdateAdminInput = {
  username?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  permissions?: string[];
  status?: number;
};

export type LoginInput = {
  username: string;
  password: string;
};

export type ForgotPasswordInput = {
  identifier: string;
};

export type VerifyOtpInput = {
  identifier: string;
  otp: string;
};

export type ResetPasswordInput = {
  identifier: string;
  otp: string;
  password: string;
};

export type AuthTokenPayload = {
  sub: number;
  username: string;
  name: string;
  roleId: number;
  roleName: string;
  permissions: string[];
};

export type ChangePasswordRequestInput = {
  currentPassword: string;
  newPassword?: string | null;
  email: string;
};

export type ChangePasswordConfirmInput = {
  otp: string;
  challengeToken: string;
};

export type ChangePasswordChallengePayload = {
  sub: number;
  passwordHash: string | null;
  email: string;
  purpose: "change-password";
};
