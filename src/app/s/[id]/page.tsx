import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";

interface SharePageProps {
  params: { id: string };
}

function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }
  try {
    const headersList = headers();
    const host = headersList.get("host");
    const proto = headersList.get("x-forwarded-proto") || "https";
    if (host && !host.includes("localhost")) {
      return `${proto}://${host}`;
    }
  } catch {
    // ignore header evaluation fallback
  }
  return "https://frame-in-goa.vercel.app";
}

export async function generateMetadata({ params }: SharePageProps) {
  const baseUrl = getBaseUrl();
  const imageUrl = `${baseUrl}/api/share?id=${params.id}`;

  return {
    title: "Hacker House Goa 2026 — Official Builder Badge #FrameInGoa",
    description: "Locked in for Hacker House Goa 2026! Check out my official builder badge.",
    openGraph: {
      title: "Hacker House Goa 2026 — Official Builder Badge #FrameInGoa",
      description: "Locked in for Hacker House Goa 2026! Check out my official builder badge.",
      url: `${baseUrl}/s/${params.id}`,
      siteName: "FrameInGoa",
      images: [
        {
          url: imageUrl,
          width: 2048,
          height: 2048,
          alt: "Hacker House Goa 2026 Builder Badge",
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "Hacker House Goa 2026 — Official Builder Badge #FrameInGoa",
      description: "Locked in for Hacker House Goa 2026! Check out my official builder badge.",
      images: [imageUrl],
    },
  };
}

export default function SharePage({ params }: SharePageProps) {
  const imageUrl = `/api/share?id=${params.id}`;

  return (
    <main className="min-h-screen bg-[#06301d] flex flex-col items-center justify-between p-6 text-center select-none">
      <header className="py-6">
        <h1 className="font-serif text-[#f5c842] text-3xl font-extrabold uppercase tracking-widest">
          HACKER HOUSE GOA 2026
        </h1>
        <p className="font-mono text-white/60 text-xs uppercase tracking-widest mt-1">
          28–31 OCT 2026 · GOA, INDIA · #FrameInGoa
        </p>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center max-w-xl w-full my-6">
        <div className="relative w-full aspect-square rounded-2xl overflow-hidden border-4 border-[#f5c842] shadow-2xl bg-black/40">
          <Image
            src={imageUrl}
            alt="Hacker House Goa 2026 Builder Badge"
            fill
            className="object-contain"
            unoptimized
          />
        </div>
      </div>

      <footer className="py-8 w-full max-w-md">
        <Link
          href="/"
          className="block w-full py-4 px-6 bg-[#f5c842] text-[#026836] font-bold text-base uppercase tracking-widest rounded-xl shadow-lg shadow-[#f5c842]/20 hover:brightness-110 transition-all"
        >
          ✦ Create Yours in 20 Seconds →
        </Link>
      </footer>
    </main>
  );
}
