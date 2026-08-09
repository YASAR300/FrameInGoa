import Image from "next/image";
import Link from "next/link";
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
    <main className="min-h-screen bg-[#06301d] flex flex-col items-center justify-between p-6 text-center select-none">
      <header className="py-6">
        <h1 className="font-serif text-[#f5c842] text-3xl font-extrabold uppercase tracking-widest drop-shadow-md">
          HACKER HOUSE GOA 2026
        </h1>
        <p className="font-mono text-white/70 text-xs uppercase tracking-widest mt-1">
          28–31 OCT 2026 · GOA, INDIA · #FrameInGoa
        </p>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center max-w-lg w-full my-4">
        <div className="relative w-full aspect-square rounded-2xl overflow-hidden border-4 border-[#f5c842] shadow-2xl bg-black/60">
          <Image
            src={imageUrl}
            alt="Hacker House Goa 2026 Builder Badge"
            fill
            className="object-contain p-2"
            unoptimized
          />
        </div>
      </div>

      <footer className="py-6 w-full max-w-md">
        <Link
          href="/"
          className="block w-full py-4 px-6 bg-[#f5c842] text-[#026836] font-extrabold text-base uppercase tracking-widest rounded-xl shadow-2xl hover:brightness-110 transition-all hover:-translate-y-0.5"
        >
          ✦ Create Your Own Badge in 20 Seconds →
        </Link>
      </footer>
    </main>
  );
}
