"use client";

/**
 * GoaBuilder.tsx
 * ---------------------------------------------------------------------------
 * Parent component — tab switch between the two builder tools:
 *   Tab 1: PFP Frame Generator   (PfpFrameBuilder.tsx)
 *   Tab 2: Builder ID Card       (IdCardBuilder.tsx)
 *
 * Drop this in wherever the "Builder" section of the site lives (e.g. the
 * page linked from the "BR CODE / IB Goa Frame / ID Card Generator" task
 * card and notice-board posts on the homepage).
 * ---------------------------------------------------------------------------
 */

import { useState } from "react";
import { CircleUserRound, CreditCard } from "lucide-react";
import PfpFrameBuilder from "./PfpFrameBuilder";
import IdCardBuilder from "./IdCardBuilder";

type Tab = "pfp" | "card";

export default function GoaBuilder() {
  const [tab, setTab] = useState<Tab>("pfp");

  return (
    <section className="w-full bg-[#063D28] px-4 py-16 sm:py-20">
      <div className="mx-auto max-w-2xl">
        <div className="text-center mb-10">
          <p className="text-xs uppercase tracking-[0.2em] text-[#F5CE3E] font-semibold mb-2">
            Powered by You
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#F7F1DF]">
            Build Your Goa Identity
          </h2>
          <p className="text-[#F7F1DF]/60 mt-2 text-sm sm:text-base">
            Generate your profile frame and builder ID card in under a minute
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 mb-10">
          <TabButton
            active={tab === "pfp"}
            onClick={() => setTab("pfp")}
            icon={<CircleUserRound className="h-4 w-4" />}
            label="PFP Frame"
          />
          <TabButton
            active={tab === "card"}
            onClick={() => setTab("card")}
            icon={<CreditCard className="h-4 w-4" />}
            label="Builder ID Card"
          />
        </div>

        {tab === "pfp" ? <PfpFrameBuilder /> : <IdCardBuilder />}
      </div>
    </section>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all ${
        active
          ? "bg-[#F5CE3E] text-[#14100E]"
          : "bg-transparent text-[#F7F1DF]/60 border border-[#F7F1DF]/20 hover:text-[#F7F1DF] hover:border-[#F7F1DF]/40"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
