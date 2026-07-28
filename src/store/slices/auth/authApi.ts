import { api } from "@/store/api/baseApi";
import type { ApiResponse } from "@/store/api/types";
import type {
  AuthAdmin,
  AuthSession,
  ChangePasswordConfirmRequest,
  ChangePasswordConfirmResult,
  ChangePasswordRequest,
  ChangePasswordRequestResult,
  ForgotPasswordRequest,
  LoginRequest,
  ResetPasswordRequest,
  VerifyOtpRequest,
} from "@/store/slices/auth/authTypes";

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthSession, LoginRequest>({
      query: (body) => ({
        url: "/admin/auth/login",
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<AuthSession>) => response.data,
    }),

    getMe: builder.query<AuthAdmin, void>({
      query: () => "/admin/auth/me",
      transformResponse: (response: ApiResponse<AuthAdmin>) => response.data,
      providesTags: ["Admin"],
    }),

    logout: builder.mutation<{ message: string }, string | null>({
      query: (refreshToken) => ({
        url: "/admin/auth/logout",
        method: "POST",
        body: { refreshToken },
      }),
      transformResponse: (response: ApiResponse<{ message: string }>) =>
        response.data,
    }),

    forgotPassword: builder.mutation<{ message: string }, ForgotPasswordRequest>({
      query: (body) => ({
        url: "/admin/auth/forgot-password",
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<{ message: string }>) =>
        response.data,
    }),

    verifyOtp: builder.mutation<{ message: string }, VerifyOtpRequest>({
      query: (body) => ({
        url: "/admin/auth/verify-otp",
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<{ message: string }>) =>
        response.data,
    }),

    resetPassword: builder.mutation<{ message: string }, ResetPasswordRequest>({
      query: (body) => ({
        url: "/admin/auth/reset-password",
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<{ message: string }>) =>
        response.data,
    }),

    requestChangePassword: builder.mutation<
      ChangePasswordRequestResult,
      ChangePasswordRequest
    >({
      query: (body) => ({
        url: "/admin/auth/change-password/request",
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<ChangePasswordRequestResult>) =>
        response.data,
    }),

    confirmChangePassword: builder.mutation<
      ChangePasswordConfirmResult,
      ChangePasswordConfirmRequest
    >({
      query: (body) => ({
        url: "/admin/auth/change-password/confirm",
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<ChangePasswordConfirmResult>) =>
        response.data,
      invalidatesTags: ["Admin"],
    }),
  }),
});

export const {
  useLoginMutation,
  useGetMeQuery,
  useLogoutMutation,
  useForgotPasswordMutation,
  useVerifyOtpMutation,
  useResetPasswordMutation,
  useRequestChangePasswordMutation,
  useConfirmChangePasswordMutation,
} = authApi;
