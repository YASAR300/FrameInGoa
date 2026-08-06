import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  weight: ["300", "400", "500", "600", "700"],
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
  openGraph: {
    title: "FrameInGoa — Hacker House Goa 2026",
    description: "Generate your Builder ID Card for Hacker House Goa 2026",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FrameInGoa — Hacker House Goa 2026",
    description: "Generate your Builder ID Card for Hacker House Goa 2026",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn(cormorant.variable, inter.variable)}>
      <body className={cn("antialiased", "font-sans")}>
        {children}
      </body>
    </html>
  );
}
