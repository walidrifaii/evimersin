import { api } from "@/store/api/baseApi";
import type { ApiResponse } from "@/store/api/types";

export type SiteSettings = {
  id: number;
  email: string;
  phone: string;
  phone_label: string;
  whatsapp_phone: string;
  whatsapp_message: string;
  instagram_url: string;
  instagram_handle: string;
  facebook_url: string;
  facebook_handle: string;
  updated_at: string;
};

export type UpdateSiteSettingsInput = Omit<SiteSettings, "id" | "updated_at">;

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
