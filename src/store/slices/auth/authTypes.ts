export type AuthAdmin = {
  id: number;
  username: string;
  name: string;
  email: string;
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

export type ForgotPasswordRequest = {
  identifier: string;
};

export type VerifyOtpRequest = {
  identifier: string;
  otp: string;
};

export type ResetPasswordRequest = {
  identifier: string;
  otp: string;
  password: string;
};

export type ChangePasswordRequest = {
  currentPassword: string;
  newPassword?: string;
  email: string;
};

export type ChangePasswordRequestResult = {
  message: string;
  challengeToken: string;
  emailMasked: string;
};

export type ChangePasswordConfirmRequest = {
  otp: string;
  challengeToken: string;
};

export type ChangePasswordConfirmResult = {
  message: string;
  admin: AuthAdmin;
};
