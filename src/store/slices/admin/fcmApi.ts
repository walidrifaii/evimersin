import { api } from "@/store/api/baseApi";
import type { ApiResponse } from "@/store/api/types";

type FcmConfigResponse = {
  enabled: boolean;
  adminReady: boolean;
  config: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
  } | null;
  vapidKey: string | null;
  tokens: Array<{
    id: number;
    deviceLabel: string | null;
    createdAt: string;
  }>;
};

export const fcmApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getFcmTokens: builder.query<FcmConfigResponse, void>({
      query: () => "/admin/fcm-tokens",
      transformResponse: (response: ApiResponse<FcmConfigResponse>) =>
        response.data,
      providesTags: [{ type: "FcmToken", id: "LIST" }],
    }),

    registerFcmToken: builder.mutation<
      { message: string },
      { token: string; deviceLabel?: string }
    >({
      query: (body) => ({
        url: "/admin/fcm-tokens",
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<{ message: string }>) =>
        response.data,
      invalidatesTags: [{ type: "FcmToken", id: "LIST" }],
    }),
  }),
});

export const { useGetFcmTokensQuery, useRegisterFcmTokenMutation } = fcmApi;
