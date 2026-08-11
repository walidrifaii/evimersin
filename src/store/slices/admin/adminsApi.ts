import { api } from "@/store/api/baseApi";
import type { ApiResponse } from "@/store/api/types";

export type DashboardUser = {
  id: number;
  username: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  status: number;
  roleId: number;
  roleName: string;
  roleLabel: string;
  permissions: string[];
  created_at?: string;
  updated_at?: string;
};

export type CreateDashboardUserInput = {
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  email: string;
  permissions: string[];
  status?: 0 | 1;
};

export type UpdateDashboardUserInput = {
  username?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  permissions?: string[];
  status?: 0 | 1;
};

export const adminsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardUsers: builder.query<DashboardUser[], void>({
      query: () => "/admin",
      transformResponse: (response: ApiResponse<DashboardUser[]>) => response.data,
      providesTags: [{ type: "Admin", id: "LIST" }],
    }),

    createDashboardUser: builder.mutation<DashboardUser, CreateDashboardUserInput>({
      query: (body) => ({
        url: "/admin",
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<DashboardUser>) => response.data,
      invalidatesTags: [{ type: "Admin", id: "LIST" }],
    }),

    updateDashboardUser: builder.mutation<
      DashboardUser,
      { id: number; body: UpdateDashboardUserInput }
    >({
      query: ({ id, body }) => ({
        url: `/admin/${id}`,
        method: "PUT",
        body,
      }),
      transformResponse: (response: ApiResponse<DashboardUser>) => response.data,
      invalidatesTags: [{ type: "Admin", id: "LIST" }],
    }),

    deleteDashboardUser: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `/admin/${id}`,
        method: "DELETE",
      }),
      transformResponse: (response: ApiResponse<{ message: string }>) =>
        response.data,
      invalidatesTags: [{ type: "Admin", id: "LIST" }],
    }),
  }),
});

export const {
  useGetDashboardUsersQuery,
  useCreateDashboardUserMutation,
  useUpdateDashboardUserMutation,
  useDeleteDashboardUserMutation,
} = adminsApi;
