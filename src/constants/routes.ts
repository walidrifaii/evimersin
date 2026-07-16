export const routes = {
  home: "/",
  properties: "/products",
  about: "/about",
  howItWorks: "/how-it-works",
  contact: "/contact",
  dashboard: "/dashboard",
  property: (id: string) => `/products/${id}`,
} as const;
