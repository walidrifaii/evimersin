import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import {
  clearCredentials,
  setCredentials,
  type AuthState,
} from "@/store/slices/auth/authSlice";
import type { AuthSession } from "@/store/slices/auth/authTypes";
import type { ApiResponse } from "@/store/api/types";

let refreshInFlight: Promise<AuthSession | null> | null = null;

async function refreshSession(
  refreshToken: string,
  apiContext: Parameters<typeof baseQuery>[1],
  extraOptions: Parameters<typeof baseQuery>[2],
): Promise<AuthSession | null> {
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      const refreshResult = await baseQuery(
        {
          url: "/admin/auth/refresh",
          method: "POST",
          body: { refreshToken },
        },
        apiContext,
        extraOptions,
      );

      return (
        (refreshResult.data as ApiResponse<AuthSession> | undefined)?.data ?? null
      );
    })().finally(() => {
      refreshInFlight = null;
    });
  }

  return refreshInFlight;
}

const baseQuery = fetchBaseQuery({
  baseUrl: "/api",
  prepareHeaders(headers, { getState }) {
    const token = (getState() as { auth: AuthState }).auth.accessToken;
    if (token) headers.set("authorization", `Bearer ${token}`);
    return headers;
  },
});

const baseQueryWithRefresh: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, apiContext, extraOptions) => {
  let result = await baseQuery(args, apiContext, extraOptions);
  const url = typeof args === "string" ? args : args.url;
  const refreshToken = (apiContext.getState() as { auth: AuthState }).auth
    .refreshToken;

  if (
    result.error?.status === 401 &&
    refreshToken &&
    url !== "/admin/auth/login" &&
    url !== "/admin/auth/refresh"
  ) {
    const session = await refreshSession(refreshToken, apiContext, extraOptions);

    if (session) {
      apiContext.dispatch(setCredentials(session));
      result = await baseQuery(args, apiContext, extraOptions);
    } else {
      apiContext.dispatch(clearCredentials());
    }
  }

  return result;
};

export const api = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithRefresh,
  tagTypes: [
    "Admin",
    "Product",
    "Country",
    "City",
    "Region",
    "Category",
    "Purpose",
    "Analytics",
    "Settings",
    "Announcement",
    "HeroSlide",
  ],
  endpoints: () => ({}),
});
