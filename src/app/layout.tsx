import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { SitePreloader } from "@/components/layout/SitePreloader";
import { config } from "@/constants/config";
import { StoreProvider } from "@/store/StoreProvider";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: `${config.appName} | ${config.tagline}`,
    template: `%s | ${config.appName}`,
  },
  description: `${config.appName} — ${config.tagline}`,
  applicationName: config.appName,
  icons: {
    icon: [{ url: "/icon", type: "image/png" }],
    apple: [{ url: "/apple-icon", sizes: "180x180", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${poppins.variable} h-full antialiased`}>
      <body className="min-h-full bg-white font-sans text-[var(--foreground)]">
        <StoreProvider>
          <SitePreloader />
          {children}
        </StoreProvider>
      </body>
    </html>
  );
}
