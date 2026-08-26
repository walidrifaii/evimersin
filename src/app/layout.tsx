import type { Metadata } from "next";
import { Noto_Sans_Arabic, Poppins } from "next/font/google";
import { getLocale } from "next-intl/server";
import { SitePreloader } from "@/components/layout/SitePreloader";
import { config } from "@/constants/config";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: true,
});

const notoSansArabic = Noto_Sans_Arabic({
  variable: "--font-arabic",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: {
    default: `${config.appName} | ${config.tagline}`,
    template: `%s | ${config.appName}`,
  },
  description: `${config.appName} — ${config.tagline}`,
  applicationName: config.appName,
  icons: {
    icon: [
      { url: "/favicon.jpg", type: "image/jpeg", sizes: "32x32" },
      { url: "/favicon.jpg", type: "image/jpeg", sizes: "192x192" },
    ],
    shortcut: [{ url: "/favicon.jpg", type: "image/jpeg" }],
    apple: [{ url: "/favicon.jpg", type: "image/jpeg", sizes: "180x180" }],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const dir = locale === "ar" ? "rtl" : "ltr";
  const fontClass =
    locale === "ar"
      ? `${notoSansArabic.variable} font-[family-name:var(--font-arabic)]`
      : `${poppins.variable} font-sans`;

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${poppins.variable} ${notoSansArabic.variable} h-full antialiased`}
    >
      <body className={`min-h-full bg-white text-[var(--foreground)] ${fontClass}`}>
        <SitePreloader />
        {children}
      </body>
    </html>
  );
}
