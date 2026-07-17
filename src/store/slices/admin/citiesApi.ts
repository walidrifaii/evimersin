import { api } from "@/store/api/baseApi";
import type { ApiResponse } from "@/store/api/types";
import type {
  City,
  CreateCityInput,
  UpdateCityInput,
} from "@/store/slices/admin/lookupTypes";

export const citiesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getCities: builder.query<City[], void>({
      query: () => "/admin/cities",
      transformResponse: (response: ApiResponse<City[]>) => response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "City" as const, id })),
              { type: "City", id: "LIST" },
            ]
          : [{ type: "City", id: "LIST" }],
    }),

    getCity: builder.query<City, number>({
      query: (id) => `/admin/cities/${id}`,
      transformResponse: (response: ApiResponse<City>) => response.data,
      providesTags: (_result, _error, id) => [{ type: "City", id }],
    }),

    createCity: builder.mutation<City, CreateCityInput>({
      query: (body) => ({
        url: "/admin/cities",
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<City>) => response.data,
      invalidatesTags: [{ type: "City", id: "LIST" }],
    }),

    updateCity: builder.mutation<City, { id: number; data: UpdateCityInput }>({
      query: ({ id, data }) => ({
        url: `/admin/cities/${id}`,
        method: "PUT",
        body: data,
      }),
      transformResponse: (response: ApiResponse<City>) => response.data,
      invalidatesTags: (_result, _error, { id }) => [
        { type: "City", id },
        { type: "City", id: "LIST" },
      ],
    }),

    deleteCity: builder.mutation<void, number>({
      query: (id) => ({
        url: `/admin/cities/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "City", id: "LIST" }],
    }),
  }),
});

export const {
  useGetCitiesQuery,
  useGetCityQuery,
  useCreateCityMutation,
  useUpdateCityMutation,
  useDeleteCityMutation,
} = citiesApi;
