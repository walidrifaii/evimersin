import featuredPropertyImage from "@/assets/images/featured-property.png";
import aboutBuildingImage from "@/assets/images/about-building.png";
import type { StaticImageData } from "next/image";
import { routes } from "@/constants/routes";

export type DashboardNavItem = {
  id: string;
  label: string;
  href: string;
  badge?: number;
};

export type DashboardKpi = {
  id: string;
  label: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
  hint: string;
};

export type DashboardListing = {
  id: string;
  title: string;
  location: string;
  type: string;
  status: "Published" | "Draft" | "Pending" | "Sold";
  price: string;
  views: number;
  inquiries: number;
  image: StaticImageData;
  href: string;
};

export type DashboardInquiry = {
  id: string;
  name: string;
  property: string;
  channel: "WhatsApp" | "Email" | "Form";
  status: "New" | "In Progress" | "Closed";
  time: string;
};

export type DashboardActivity = {
  id: string;
  title: string;
  detail: string;
  time: string;
};

export type ChartPoint = {
  label: string;
  value: number;
};

export const dashboardNav: DashboardNavItem[] = [
  { id: "overview", label: "Overview", href: routes.dashboard },
  { id: "countries", label: "Countries", href: `${routes.dashboard}?tab=countries` },
  { id: "cities", label: "Cities", href: `${routes.dashboard}?tab=cities` },
  { id: "categories", label: "Categories", href: `${routes.dashboard}?tab=categories` },
  { id: "purposes", label: "Purposes", href: `${routes.dashboard}?tab=purposes` },
  { id: "products", label: "Residential Units", href: `${routes.dashboard}?tab=products` },
];

export const dashboardKpis: DashboardKpi[] = [
  {
    id: "listings",
    label: "Active Listings",
    value: "128",
    change: "+12%",
    trend: "up",
    hint: "vs last month",
  },
  {
    id: "views",
    label: "Property Views",
    value: "14.2k",
    change: "+8.4%",
    trend: "up",
    hint: "last 30 days",
  },
  {
    id: "inquiries",
    label: "New Inquiries",
    value: "86",
    change: "+18%",
    trend: "up",
    hint: "this week",
  },
  {
    id: "pipeline",
    label: "Pipeline Value",
    value: "$4.8M",
    change: "-2.1%",
    trend: "down",
    hint: "open deals",
  },
];

export const viewsByWeek: ChartPoint[] = [
  { label: "Mon", value: 42 },
  { label: "Tue", value: 58 },
  { label: "Wed", value: 49 },
  { label: "Thu", value: 72 },
  { label: "Fri", value: 65 },
  { label: "Sat", value: 88 },
  { label: "Sun", value: 76 },
];

export const listingsByType: ChartPoint[] = [
  { label: "Villas", value: 34 },
  { label: "Apts", value: 42 },
  { label: "Studios", value: 18 },
  { label: "Land", value: 16 },
  { label: "Commercial", value: 18 },
];

export const dashboardListings: DashboardListing[] = [
  {
    id: "mezitli-villa",
    title: "Luxury Villa in Mezitli",
    location: "Mezitli, Mersin",
    type: "Villa",
    status: "Published",
    price: "$350,000",
    views: 1240,
    inquiries: 18,
    image: featuredPropertyImage,
    href: routes.property("mezitli-villa"),
  },
  {
    id: "city-apartment",
    title: "Modern City Apartment",
    location: "Yenişehir, Mersin",
    type: "Apartment",
    status: "Published",
    price: "$185,000",
    views: 890,
    inquiries: 12,
    image: aboutBuildingImage,
    href: routes.property("city-apartment"),
  },
  {
    id: "downtown-studio",
    title: "Cozy Studio Downtown",
    location: "City Center, Mersin",
    type: "Studio",
    status: "Pending",
    price: "$850 / mo",
    views: 420,
    inquiries: 9,
    image: featuredPropertyImage,
    href: routes.property("downtown-studio"),
  },
  {
    id: "erdemli-land",
    title: "Prime Coastal Land Plot",
    location: "Erdemli, Mersin",
    type: "Land",
    status: "Draft",
    price: "$120,000",
    views: 210,
    inquiries: 4,
    image: aboutBuildingImage,
    href: routes.property("erdemli-land"),
  },
  {
    id: "marina-penthouse",
    title: "Marina Penthouse Suite",
    location: "Marina District",
    type: "Penthouse",
    status: "Sold",
    price: "$620,000",
    views: 2100,
    inquiries: 31,
    image: featuredPropertyImage,
    href: routes.property("marina-penthouse"),
  },
];

export const dashboardInquiries: DashboardInquiry[] = [
  {
    id: "inq-1",
    name: "Ahmet Yılmaz",
    property: "Luxury Villa in Mezitli",
    channel: "WhatsApp",
    status: "New",
    time: "12 min ago",
  },
  {
    id: "inq-2",
    name: "Elena Petrova",
    property: "Modern City Apartment",
    channel: "Form",
    status: "In Progress",
    time: "1 hr ago",
  },
  {
    id: "inq-3",
    name: "James Carter",
    property: "Marina Penthouse Suite",
    channel: "Email",
    status: "New",
    time: "2 hr ago",
  },
  {
    id: "inq-4",
    name: "Fatma Demir",
    property: "Cozy Studio Downtown",
    channel: "WhatsApp",
    status: "Closed",
    time: "Yesterday",
  },
];

export const dashboardActivity: DashboardActivity[] = [
  {
    id: "act-1",
    title: "Listing published",
    detail: "Luxury Villa in Mezitli went live",
    time: "10:24",
  },
  {
    id: "act-2",
    title: "New inquiry",
    detail: "Ahmet Yılmaz requested a viewing",
    time: "09:58",
  },
  {
    id: "act-3",
    title: "Price updated",
    detail: "Coastal Land Plot reduced by 8%",
    time: "09:12",
  },
  {
    id: "act-4",
    title: "Deal marked sold",
    detail: "Marina Penthouse closed at $620k",
    time: "Yesterday",
  },
];

export const dashboardAgent = {
  name: "Admin User",
  role: "Property Manager",
  email: "admin@evimersin.com",
};
