import type { Metadata, Viewport } from "next";
import { Inter_Tight, Noto_Serif_Display } from "next/font/google";
import { Floaters } from "@/components/Floaters";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Motion } from "@/components/Motion";
import { site } from "@/content/site";
import "./globals.css";

// Fonts approved 31 Oct 2026: both carry the ₹ sign and real italics. Latin Extended holds the ₹ glyph.
const display = Noto_Serif_Display({
  variable: "--font-noto",
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400"],
  style: ["normal", "italic"],
});

const body = Inter_Tight({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://palmregal.example"), // replace with the GoDaddy domain at launch
  title: { default: `${site.name} Resort, Gopalpur on Sea`, template: `%s · ${site.name} Resort` },
  description: site.description,
  openGraph: { title: `${site.name} Resort, Gopalpur on Sea`, description: site.description, images: ["/images/exterior-2.webp"], type: "website" },
};

export const viewport: Viewport = {
  themeColor: "#193F47",
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>
        <Header />
        <main id="top">{children}</main>
        <Footer />
        <Floaters />
        <Motion />
      </body>
    </html>
  );
}
