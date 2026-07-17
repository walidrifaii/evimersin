import { api } from "@/store/api/baseApi";
import type { ApiResponse } from "@/store/api/types";
import type {
  CreatePurposeInput,
  Purpose,
  UpdatePurposeInput,
} from "@/store/slices/admin/lookupTypes";

export const purposesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getPurposes: builder.query<Purpose[], void>({
      query: () => "/admin/purposes",
      transformResponse: (response: ApiResponse<Purpose[]>) => response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Purpose" as const, id })),
              { type: "Purpose", id: "LIST" },
            ]
          : [{ type: "Purpose", id: "LIST" }],
    }),

    getPurpose: builder.query<Purpose, number>({
      query: (id) => `/admin/purposes/${id}`,
      transformResponse: (response: ApiResponse<Purpose>) => response.data,
      providesTags: (_result, _error, id) => [{ type: "Purpose", id }],
    }),

    createPurpose: builder.mutation<Purpose, CreatePurposeInput>({
      query: (body) => ({
        url: "/admin/purposes",
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<Purpose>) => response.data,
      invalidatesTags: [{ type: "Purpose", id: "LIST" }],
    }),

    updatePurpose: builder.mutation<
      Purpose,
      { id: number; data: UpdatePurposeInput }
    >({
      query: ({ id, data }) => ({
        url: `/admin/purposes/${id}`,
        method: "PUT",
        body: data,
      }),
      transformResponse: (response: ApiResponse<Purpose>) => response.data,
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Purpose", id },
        { type: "Purpose", id: "LIST" },
      ],
    }),

    deletePurpose: builder.mutation<void, number>({
      query: (id) => ({
        url: `/admin/purposes/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Purpose", id: "LIST" }],
    }),
  }),
});

export const {
  useGetPurposesQuery,
  useGetPurposeQuery,
  useCreatePurposeMutation,
  useUpdatePurposeMutation,
  useDeletePurposeMutation,
} = purposesApi;
