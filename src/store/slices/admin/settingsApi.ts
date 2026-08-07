import { api } from "@/store/api/baseApi";
import type { ApiResponse } from "@/store/api/types";
import type { UpdateSiteSettingsInput } from "@/server/types/settings.types";

export type SiteSettings = UpdateSiteSettingsInput & {
  id: number;
  updated_at: string;
};

export type { UpdateSiteSettingsInput };

export const settingsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getSiteSettings: builder.query<SiteSettings, void>({
      query: () => "/admin/settings",
      transformResponse: (response: ApiResponse<SiteSettings>) => response.data,
      providesTags: [{ type: "Settings", id: "CURRENT" }],
    }),

    updateSiteSettings: builder.mutation<SiteSettings, UpdateSiteSettingsInput>({
      query: (body) => ({
        url: "/admin/settings",
        method: "PUT",
        body,
      }),
      transformResponse: (response: ApiResponse<SiteSettings>) => response.data,
      invalidatesTags: [{ type: "Settings", id: "CURRENT" }],
    }),
  }),
});

export const { useGetSiteSettingsQuery, useUpdateSiteSettingsMutation } =
  settingsApi;
