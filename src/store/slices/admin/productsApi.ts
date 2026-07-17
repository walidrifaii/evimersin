import { api } from "@/store/api/baseApi";
import type { ApiResponse } from "@/store/api/types";
import type {
  Product,
  ProductDetail,
  ProductFormInput,
  ProductImage,
} from "@/store/slices/admin/productTypes";

function toProductFormData(body: Partial<ProductFormInput>) {
  const formData = new FormData();
  if (body.name !== undefined) formData.set("name", body.name);
  if (body.description !== undefined) {
    formData.set("description", body.description ?? "");
  }
  if (body.price !== undefined) formData.set("price", String(body.price));
  if (body.discount_type !== undefined) {
    formData.set("discount_type", body.discount_type ?? "");
  }
  if (body.discount_value !== undefined) {
    formData.set("discount_value", String(body.discount_value));
  }
  if (body.position !== undefined) formData.set("position", String(body.position));
  if (body.category_id !== undefined) {
    formData.set("category_id", String(body.category_id));
  }
  if (body.purpose_id !== undefined) {
    formData.set("purpose_id", String(body.purpose_id));
  }
  if (body.city_id !== undefined) formData.set("city_id", String(body.city_id));
  if (body.status !== undefined) formData.set("status", String(body.status));
  if (body.is_featured !== undefined) {
    formData.set("is_featured", String(body.is_featured));
  }
  if (body.image instanceof File) {
    formData.set("image", body.image);
  }
  body.images?.forEach((image) => {
    formData.append("images", image);
  });
  return formData;
}

export const productsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query<Product[], void>({
      query: () => "/admin/products",
      transformResponse: (response: ApiResponse<Product[]>) => response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Product" as const, id })),
              { type: "Product", id: "LIST" },
            ]
          : [{ type: "Product", id: "LIST" }],
    }),

    getProduct: builder.query<ProductDetail, number>({
      query: (id) => `/admin/products/${id}`,
      transformResponse: (response: ApiResponse<ProductDetail>) => response.data,
      providesTags: (_result, _error, id) => [{ type: "Product", id }],
    }),

    createProduct: builder.mutation<ProductDetail, ProductFormInput>({
      query: (body) => ({
        url: "/admin/products",
        method: "POST",
        body: toProductFormData(body),
      }),
      transformResponse: (response: ApiResponse<ProductDetail>) => response.data,
      invalidatesTags: [
        { type: "Product", id: "LIST" },
        { type: "Analytics", id: "OVERVIEW" },
      ],
    }),

    updateProduct: builder.mutation<
      ProductDetail,
      { id: number; data: Partial<ProductFormInput> }
    >({
      query: ({ id, data }) => ({
        url: `/admin/products/${id}`,
        method: "PUT",
        body: toProductFormData(data),
      }),
      transformResponse: (response: ApiResponse<ProductDetail>) => response.data,
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Product", id },
        { type: "Product", id: "LIST" },
        { type: "Analytics", id: "OVERVIEW" },
      ],
    }),

    deleteProduct: builder.mutation<void, number>({
      query: (id) => ({
        url: `/admin/products/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [
        { type: "Product", id: "LIST" },
        { type: "Analytics", id: "OVERVIEW" },
      ],
    }),

    addProductImage: builder.mutation<
      ProductImage,
      { productId: number; image: File }
    >({
      query: ({ productId, image }) => {
        const formData = new FormData();
        formData.set("image", image);
        return {
          url: `/admin/products/${productId}/images`,
          method: "POST",
          body: formData,
        };
      },
      transformResponse: (response: ApiResponse<ProductImage>) => response.data,
      invalidatesTags: (_result, _error, { productId }) => [
        { type: "Product", id: productId },
      ],
    }),

    deleteProductImage: builder.mutation<
      void,
      { productId: number; imageId: number }
    >({
      query: ({ productId, imageId }) => ({
        url: `/admin/products/${productId}/images/${imageId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { productId }) => [
        { type: "Product", id: productId },
      ],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useAddProductImageMutation,
  useDeleteProductImageMutation,
} = productsApi;
