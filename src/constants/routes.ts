export const routes = {
  home: "/",
  properties: "/products",
  about: "/about",
  howItWorks: "/how-it-works",
  contact: "/contact",
  dashboard: "/dashboard",
  login: "/login",
  apiDocs: "/api-docs",
  property: (id: string) => `/products/${id}`,
  dashboardTab: (tab: string) => `/dashboard?tab=${tab}`,
  lookupNew: (resource: string) => `/dashboard/${resource}/new`,
  lookupEdit: (resource: string, id: number) => `/dashboard/${resource}/${id}`,
} as const;
