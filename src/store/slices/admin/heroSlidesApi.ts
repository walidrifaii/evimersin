import { api } from "@/store/api/baseApi";
import type { ApiResponse } from "@/store/api/types";

export type HeroSlide = {
  id: number;
  image: string;
  alt_text: string;
  sort_order: number;
  status: 0 | 1;
  created_at: string;
  updated_at: string;
};

export type HeroSlideFormInput = {
  image?: File | null;
  alt_text: string;
  sort_order: number;
  status: 0 | 1;
};

function toHeroSlideFormData(body: Partial<HeroSlideFormInput>) {
  const formData = new FormData();
  formData.set("alt_text", body.alt_text ?? "");
  formData.set("sort_order", String(body.sort_order ?? 0));
  formData.set("status", String(body.status ?? 1));

  if (body.image instanceof File) {
    formData.set("image", body.image);
  }

  return formData;
}

export const heroSlidesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getHeroSlides: builder.query<HeroSlide[], void>({
      query: () => "/admin/hero-slides",
      transformResponse: (response: ApiResponse<HeroSlide[]>) => response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "HeroSlide" as const, id })),
              { type: "HeroSlide", id: "LIST" },
            ]
          : [{ type: "HeroSlide", id: "LIST" }],
    }),

    createHeroSlide: builder.mutation<HeroSlide, HeroSlideFormInput>({
      query: (body) => ({
        url: "/admin/hero-slides",
        method: "POST",
        body: toHeroSlideFormData(body),
      }),
      transformResponse: (response: ApiResponse<HeroSlide>) => response.data,
      invalidatesTags: [{ type: "HeroSlide", id: "LIST" }],
    }),

    updateHeroSlide: builder.mutation<
      HeroSlide,
      { id: number; data: Partial<HeroSlideFormInput> }
    >({
      // POST, not PUT: proxies in front of the app drop multipart PUT bodies.
      query: ({ id, data }) => ({
        url: `/admin/hero-slides/${id}`,
        method: "POST",
        body: toHeroSlideFormData(data),
      }),
      transformResponse: (response: ApiResponse<HeroSlide>) => response.data,
      invalidatesTags: (_result, _error, { id }) => [
        { type: "HeroSlide", id },
        { type: "HeroSlide", id: "LIST" },
      ],
    }),

    deleteHeroSlide: builder.mutation<void, number>({
      query: (id) => ({
        url: `/admin/hero-slides/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "HeroSlide", id: "LIST" }],
    }),
  }),
});

export const {
  useGetHeroSlidesQuery,
  useCreateHeroSlideMutation,
  useUpdateHeroSlideMutation,
  useDeleteHeroSlideMutation,
} = heroSlidesApi;
