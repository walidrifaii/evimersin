import { api } from "@/store/api/baseApi";
import type { ApiResponse } from "@/store/api/types";
import type {
  Category,
  CategoryFormInput,
} from "@/store/slices/admin/lookupTypes";

function toCategoryFormData(body: Partial<CategoryFormInput>) {
  const formData = new FormData();
  formData.set("name", body.name ?? "");
  formData.set("status", String(body.status ?? 1));
  formData.set("position", String(body.position ?? 0));

  if ("icon" in body && body.icon instanceof File) {
    formData.set("icon", body.icon);
  }

  return formData;
}

export const categoriesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getCategories: builder.query<Category[], void>({
      query: () => "/admin/categories",
      transformResponse: (response: ApiResponse<Category[]>) => response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Category" as const, id })),
              { type: "Category", id: "LIST" },
            ]
          : [{ type: "Category", id: "LIST" }],
    }),

    getCategory: builder.query<Category, number>({
      query: (id) => `/admin/categories/${id}`,
      transformResponse: (response: ApiResponse<Category>) => response.data,
      providesTags: (_result, _error, id) => [{ type: "Category", id }],
    }),

    createCategory: builder.mutation<Category, CategoryFormInput>({
      query: (body) => ({
        url: "/admin/categories",
        method: "POST",
        body: toCategoryFormData(body),
      }),
      transformResponse: (response: ApiResponse<Category>) => response.data,
      invalidatesTags: [{ type: "Category", id: "LIST" }],
    }),

    updateCategory: builder.mutation<
      Category,
      { id: number; data: Partial<CategoryFormInput> }
    >({
      query: ({ id, data }) => ({
        url: `/admin/categories/${id}`,
        method: "PUT",
        body: toCategoryFormData(data),
      }),
      transformResponse: (response: ApiResponse<Category>) => response.data,
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Category", id },
        { type: "Category", id: "LIST" },
      ],
    }),

    deleteCategory: builder.mutation<void, number>({
      query: (id) => ({
        url: `/admin/categories/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Category", id: "LIST" }],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useGetCategoryQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categoriesApi;
