import type { Metadata } from "next";
import { Cairo, Manrope, Rubik, Urbanist } from "next/font/google";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { LiveChat } from "@/components/LiveChat";
import { ScrollToTop } from "@/components/ScrollToTop";
import { StickyTelegramBar } from "@/components/StickyTelegramBar";
import "./globals.css";

/** Same display family as lionott.co (headings) */
const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["latin", "latin-ext"],
  weight: ["600", "700", "800", "900"],
});

/** Greek-capable companion close to Cairo’s geometric bold look */
const rubik = Rubik({
  variable: "--font-rubik",
  subsets: ["latin", "latin-ext", "greek"] as Array<"latin" | "latin-ext">,
  weight: ["500", "600", "700", "800", "900"],
});

/** Same body family as lionott.co */
const urbanist = Urbanist({
  variable: "--font-urbanist",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700", "800"],
});

/** Greek-capable companion for Urbanist body text */
const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "latin-ext", "greek"] as Array<"latin" | "latin-ext">,
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://grviptv.vercel.app"),
  title: {
    default: "GRVIP OTT | Premium Streaming",
    template: "%s | GRVIP OTT",
  },
  description:
    "Απολαύστε premium ψυχαγωγία με χιλιάδες ζωντανά κανάλια, ταινίες, σειρές και υποστήριξη για όλες τις συσκευές σας.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: "/favicon.ico",
  },
  openGraph: {
    title: "GRVIP OTT | Premium Streaming",
    description:
      "Απολαύστε premium ψυχαγωγία με χιλιάδες ζωντανά κανάλια, ταινίες, σειρές και υποστήριξη για όλες τις συσκευές σας.",
    locale: "el_GR",
    type: "website",
    siteName: "GRVIP OTT",
    images: [{ url: "/images/logo.png", width: 1200, height: 630, alt: "GRVIP OTT" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "GRVIP OTT | Premium Streaming",
    description:
      "Απολαύστε premium ψυχαγωγία με χιλιάδες ζωντανά κανάλια, ταινίες και σειρές.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="el"
      className={`${cairo.variable} ${rubik.variable} ${urbanist.variable} ${manrope.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-bg-deep text-text antialiased">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <StickyTelegramBar />
        <LiveChat />
        <ScrollToTop />
      </body>
    </html>
  );
}
