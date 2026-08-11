import { api } from "@/store/api/baseApi";
import type { ApiResponse } from "@/store/api/types";

export type AnnouncementItem = {
  id: number;
  title: string;
  message: string;
  isActive: boolean;
  createdAt: string;
};

export type AnnouncementsPagination = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type AnnouncementsOverview = {
  activeGuestCount: number;
  reachableGuestCount: number;
  firebaseEnabled: boolean;
  firebaseVapidError?: string | null;
  announcements: AnnouncementItem[];
  pagination: AnnouncementsPagination;
};

export type AnnouncementsOverviewArgs = {
  page?: number;
  pageSize?: number;
};

export type SendAnnouncementInput = {
  title: string;
  message: string;
};

export type SendAnnouncementResult = {
  id: number;
  activeGuestCount: number;
  reachableGuestCount: number;
  notificationsSent: number;
  notificationsFailed: number;
  message: string;
};

export const announcementsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAnnouncementsOverview: builder.query<
      AnnouncementsOverview,
      AnnouncementsOverviewArgs | void
    >({
      query: (args) => ({
        url: "/admin/announcements",
        params: {
          page: args?.page ?? 1,
          pageSize: args?.pageSize ?? 10,
        },
      }),
      transformResponse: (response: ApiResponse<AnnouncementsOverview>) =>
        response.data,
      providesTags: [{ type: "Announcement", id: "OVERVIEW" }],
    }),

    sendAnnouncement: builder.mutation<
      SendAnnouncementResult,
      SendAnnouncementInput
    >({
      query: (body) => ({
        url: "/admin/announcements",
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<SendAnnouncementResult>) =>
        response.data,
      invalidatesTags: [{ type: "Announcement", id: "OVERVIEW" }],
    }),
  }),
});

export const {
  useGetAnnouncementsOverviewQuery,
  useSendAnnouncementMutation,
} = announcementsApi;
