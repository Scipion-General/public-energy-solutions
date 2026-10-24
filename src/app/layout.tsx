import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { site } from "@/content/site";
import "./globals.css";

const inter = Inter({ variable: "--font-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: site.name, template: `%s | ${site.name}` },
  description: site.tagline,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <a href="#main" className="skip-link">
          Skip to main content
        </a>
        <SiteHeader />
        <main id="main" tabIndex={-1}>
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
