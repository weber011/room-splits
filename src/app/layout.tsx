import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { MobileBottomNavigation } from "@/components/common/MobileBottomNavigation";
import { siteConfig } from "@/config/site.config";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name} - PG, Hostel & Room Discovery Platform`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    "PG booking",
    "Hostel discovery",
    "Co-living spaces",
    "Paying guest near me",
    "Room splitz",
    "Rent management",
    "Scheduled visits",
    "Zero brokerage PG",
  ],
  authors: [{ name: "RoomSplits Team" }],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased pb-16 md:pb-0`}>
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <MobileBottomNavigation />
      </body>
    </html>
  );
}
