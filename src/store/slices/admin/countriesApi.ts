import { api } from "@/store/api/baseApi";
import type { ApiResponse } from "@/store/api/types";
import type {
  Country,
  CreateCountryInput,
  UpdateCountryInput,
} from "@/store/slices/admin/lookupTypes";

export const countriesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getCountries: builder.query<Country[], void>({
      query: () => "/admin/countries",
      transformResponse: (response: ApiResponse<Country[]>) => response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Country" as const, id })),
              { type: "Country", id: "LIST" },
            ]
          : [{ type: "Country", id: "LIST" }],
    }),

    getCountry: builder.query<Country, number>({
      query: (id) => `/admin/countries/${id}`,
      transformResponse: (response: ApiResponse<Country>) => response.data,
      providesTags: (_result, _error, id) => [{ type: "Country", id }],
    }),

    createCountry: builder.mutation<Country, CreateCountryInput>({
      query: (body) => ({
        url: "/admin/countries",
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<Country>) => response.data,
      invalidatesTags: [{ type: "Country", id: "LIST" }],
    }),

    updateCountry: builder.mutation<
      Country,
      { id: number; data: UpdateCountryInput }
    >({
      query: ({ id, data }) => ({
        url: `/admin/countries/${id}`,
        method: "PUT",
        body: data,
      }),
      transformResponse: (response: ApiResponse<Country>) => response.data,
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Country", id },
        { type: "Country", id: "LIST" },
        { type: "City", id: "LIST" },
      ],
    }),

    deleteCountry: builder.mutation<void, number>({
      query: (id) => ({
        url: `/admin/countries/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Country", id: "LIST" }],
    }),
  }),
});

export const {
  useGetCountriesQuery,
  useGetCountryQuery,
  useCreateCountryMutation,
  useUpdateCountryMutation,
  useDeleteCountryMutation,
} = countriesApi;
