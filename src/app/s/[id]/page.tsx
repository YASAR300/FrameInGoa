import Image from "next/image";
import Link from "next/link";
import { Sparkles, Calendar, MapPin, ExternalLink } from "lucide-react";
import { getCloudinaryImageUrl } from "@/lib/cloudinary";

interface SharePageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: SharePageProps) {
  const imageUrl = getCloudinaryImageUrl(params.id);
  const sharePageUrl = `https://frame-in-goa.vercel.app/s/${params.id}`;

  return {
    title: "Hacker House Goa 2026 — Official Builder Badge #FrameInGoa",
    description: "Locked in for Hacker House Goa 2026! Check out my official builder badge.",
    openGraph: {
      title: "Hacker House Goa 2026 — Official Builder Badge #FrameInGoa",
      description: "Locked in for Hacker House Goa 2026! Check out my official builder badge.",
      url: sharePageUrl,
      siteName: "FrameInGoa",
      images: [
        {
          url: imageUrl,
          width: 1080,
          height: 1080,
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
  const imageUrl = getCloudinaryImageUrl(params.id);

  return (
    <main className="relative min-h-screen bg-[#021d12] flex flex-col items-center justify-between p-4 sm:p-8 text-center select-none overflow-hidden">
      {/* ══ STUNNING AI GENERATED TROPICAL BACKGROUND IMAGE ══ */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/goa_share_bg.png"
          alt="Goa Beach Sunset Backdrop"
          fill
          className="object-cover object-center opacity-40 scale-105 filter blur-[2px]"
          priority
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#021d12]/80 via-[#033420]/70 to-[#01140c]/95 backdrop-blur-[3px]" />
      </div>

      {/* ══ HEADER ══ */}
      <header className="relative z-10 pt-4 pb-2 flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#f5c842]/10 border border-[#f5c842]/30 text-[#f5c842] text-xs font-mono font-semibold uppercase tracking-wider mb-3 shadow-lg backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          <span>Official Builder Badge</span>
        </div>
        <h1 className="font-serif text-[#f5c842] text-3xl sm:text-5xl font-extrabold uppercase tracking-wider drop-shadow-[0_4px_20px_rgba(245,200,66,0.3)]">
          HACKER HOUSE GOA 2026
        </h1>
        <div className="flex items-center gap-4 mt-2.5 font-mono text-white/80 text-xs sm:text-sm tracking-widest uppercase">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-[#f5c842]" /> 28–31 OCT 2026
          </span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-[#f5c842]" /> GOA, INDIA
          </span>
        </div>
      </header>

      {/* ══ CENTER BADGE SHOWCASE ══ */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center max-w-md sm:max-w-lg w-full my-6">
        <div className="relative w-full aspect-square rounded-3xl overflow-hidden border-2 border-[#f5c842]/60 shadow-[0_0_60px_rgba(245,200,66,0.25)] bg-black/60 backdrop-blur-xl group hover:border-[#f5c842] transition-all duration-300">
          <Image
            src={imageUrl}
            alt="Hacker House Goa 2026 Builder Badge"
            fill
            className="object-contain p-3 transition-transform duration-500 group-hover:scale-[1.02]"
            unoptimized
            priority
          />
        </div>
      </div>

      {/* ══ FOOTER CTA ══ */}
      <footer className="relative z-10 pb-6 w-full max-w-md">
        <Link
          href="/"
          className="group inline-flex items-center justify-center gap-2.5 w-full py-4 px-6 bg-[#f5c842] text-[#026836] font-extrabold text-base uppercase tracking-widest rounded-2xl shadow-[0_0_30px_rgba(245,200,66,0.3)] hover:brightness-110 hover:shadow-[0_0_45px_rgba(245,200,66,0.5)] transition-all hover:-translate-y-1 active:translate-y-0"
        >
          <Sparkles className="w-5 h-5 text-[#026836]" />
          <span>✦ Create Your Own in Seconds →</span>
          <ExternalLink className="w-4 h-4 text-[#026836] opacity-0 group-hover:opacity-100 transition-opacity" />
        </Link>
      </footer>
    </main>
  );
}
