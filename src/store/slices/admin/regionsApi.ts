import { api } from "@/store/api/baseApi";
import type { ApiResponse } from "@/store/api/types";
import type {
  CreateRegionInput,
  Region,
  UpdateRegionInput,
} from "@/store/slices/admin/lookupTypes";

export const regionsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getRegions: builder.query<Region[], void>({
      query: () => "/admin/regions",
      transformResponse: (response: ApiResponse<Region[]>) => response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Region" as const, id })),
              { type: "Region", id: "LIST" },
            ]
          : [{ type: "Region", id: "LIST" }],
    }),

    getRegion: builder.query<Region, number>({
      query: (id) => `/admin/regions/${id}`,
      transformResponse: (response: ApiResponse<Region>) => response.data,
      providesTags: (_result, _error, id) => [{ type: "Region", id }],
    }),

    createRegion: builder.mutation<Region, CreateRegionInput>({
      query: (body) => ({
        url: "/admin/regions",
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<Region>) => response.data,
      invalidatesTags: [{ type: "Region", id: "LIST" }],
    }),

    updateRegion: builder.mutation<Region, { id: number; data: UpdateRegionInput }>({
      query: ({ id, data }) => ({
        url: `/admin/regions/${id}`,
        method: "PUT",
        body: data,
      }),
      transformResponse: (response: ApiResponse<Region>) => response.data,
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Region", id },
        { type: "Region", id: "LIST" },
      ],
    }),

    deleteRegion: builder.mutation<void, number>({
      query: (id) => ({
        url: `/admin/regions/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Region", id: "LIST" }],
    }),
  }),
});

export const {
  useGetRegionsQuery,
  useGetRegionQuery,
  useCreateRegionMutation,
  useUpdateRegionMutation,
  useDeleteRegionMutation,
} = regionsApi;
