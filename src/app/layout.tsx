import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import "./globals.css";

// Closest free Google Font match to PP Editorial New
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

export const metadata: Metadata = {
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
    icon: "/assets/frameingoa-logo.png",
    shortcut: "/assets/frameingoa-logo.png",
    apple: "/assets/frameingoa-logo.png",
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
    <html lang="en" className={cn(playfair.variable, inter.variable)}>
      <body className={cn("antialiased", "font-sans")}>
        {children}
      </body>
    </html>
  );
}
