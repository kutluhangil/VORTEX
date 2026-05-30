import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#000000",
};

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  title: "FLOW — Premium Fluid Playground",
  description:
    "Real-time WebGL fluid simulation with audio-reactive inputs, image obstacles, 12+ curated presets. The fluid playground for 2026.",
  metadataBase: new URL(SITE_URL),
  applicationName: "FLOW",
  keywords: [
    "fluid simulation",
    "WebGL",
    "Navier-Stokes",
    "audio reactive",
    "generative art",
    "interactive art",
    "shader",
    "creative coding",
  ],
  authors: [{ name: "kutluhangil", url: "https://github.com/kutluhangil" }],
  creator: "kutluhangil",
  openGraph: {
    title: "FLOW — Premium Fluid Playground",
    description:
      "Audio-reactive WebGL fluid simulation. Drop a logo, play music, wave at the camera.",
    type: "website",
    url: SITE_URL,
    siteName: "FLOW",
    images: [{ url: "/api/og", width: 1200, height: 630, alt: "FLOW" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "FLOW — Premium Fluid Playground",
    description: "Audio-reactive WebGL fluid simulation.",
    images: ["/api/og"],
  },
  robots: { index: true, follow: true },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  manifest: "/manifest.webmanifest",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "FLOW",
  description:
    "Real-time WebGL fluid simulation with audio-reactive inputs, image obstacles, and 12+ curated presets.",
  url: SITE_URL,
  applicationCategory: "MultimediaApplication",
  operatingSystem: "Any (WebGL2 browser)",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  author: { "@type": "Person", name: "kutluhangil" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
