import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — FrameInGoa",
  description: "Learn how FrameInGoa processes your images entirely in your browser with zero data collection.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-goa-dark-green text-goa-cream px-6 py-12 max-w-3xl mx-auto flex flex-col justify-between">
      <div className="space-y-6">
        <Link href="/" className="text-goa-yellow text-xs font-bold uppercase tracking-widest hover:underline">
          ← Back to Generator
        </Link>

        <h1 className="font-serif text-3xl sm:text-4xl text-goa-yellow font-extrabold">
          Privacy Policy
        </h1>

        <div className="space-y-4 text-sm leading-relaxed text-goa-cream/80 font-sans">
          <p className="text-base text-goa-cream font-medium">
            At <strong>FrameInGoa</strong>, privacy is fundamental to our architecture.
          </p>

          <section className="bg-black/30 p-5 rounded-2xl border border-goa-yellow/20 space-y-3">
            <h2 className="text-goa-yellow font-bold uppercase text-xs tracking-wider">
              1. 100% Client-Side Image Processing
            </h2>
            <p>
              Your uploaded photos are processed entirely within your browser using HTML5 Canvas 2D.
              Your original photos are <strong>never uploaded to any server or cloud database</strong>.
            </p>
          </section>

          <section className="bg-black/30 p-5 rounded-2xl border border-goa-yellow/20 space-y-3">
            <h2 className="text-goa-yellow font-bold uppercase text-xs tracking-wider">
              2. Optional Share Link Uploads
            </h2>
            <p>
              Only when you explicitly tap <strong>&quot;Share to X&quot;</strong> on desktop, a composited share graphic is temporarily uploaded to generate an Open Graph link preview. No original photos or personal metadata are retained.
            </p>
          </section>

          <section className="bg-black/30 p-5 rounded-2xl border border-goa-yellow/20 space-y-3">
            <h2 className="text-goa-yellow font-bold uppercase text-xs tracking-wider">
              3. Analytics & Cookies
            </h2>
            <p>
              We do not use tracking cookies or third-party ad trackers.
            </p>
          </section>
        </div>
      </div>

      <footer className="pt-12 text-center text-xs text-goa-cream/40">
        FrameInGoa · Hacker House Goa 2026 · 2:47 PM Studio
      </footer>
    </main>
  );
}
