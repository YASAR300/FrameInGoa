import type { Metadata } from "next";
import { Playfair_Display, Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { cn } from "@/lib/utils";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://frameingoa.app"),
  title: "FrameInGoa — Hacker House Goa 2026 Builder ID Card",
  description:
    "Generate your Builder ID Card for Hacker House Goa 2026 — the AI × Crypto builder residency by 2:47PM Studio. Upload your photo, get your card, share on X.",
  keywords: [
    "Hacker House Goa",
    "2026",
    "AI",
    "Crypto",
    "Builder",
    "Residency",
    "2:47PM Studio",
    "FrameInGoa",
  ],
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
  openGraph: {
    title: "FrameInGoa — Hacker House Goa 2026",
    description: "Generate your Builder ID Card for Hacker House Goa 2026",
    type: "website",
    images: ["/assets/frameingoa-logo.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "FrameInGoa — Hacker House Goa 2026",
    description: "Generate your Builder ID Card for Hacker House Goa 2026",
    images: ["/assets/frameingoa-logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn(playfair.variable, inter.variable, spaceGrotesk.variable, jetbrainsMono.variable)}>
      <head>
        <link rel="icon" href="/assets/frameingoa-logo.png?v=2" type="image/png" sizes="any" />
        <link rel="shortcut icon" href="/assets/frameingoa-logo.png?v=2" type="image/png" />
        <link rel="apple-touch-icon" href="/assets/frameingoa-logo.png?v=2" />
      </head>
      <body className={cn("antialiased", "font-sans")}>
        {children}
      </body>
    </html>
  );
}
