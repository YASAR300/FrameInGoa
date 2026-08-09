"use client";

import { useState } from "react";
import { CircleUserRound, CreditCard } from "lucide-react";
import PfpFrameBuilder from "./PfpFrameBuilder";
import IdCardBuilder from "./IdCardBuilder";

type Tab = "pfp" | "card";

export default function GoaBuilder() {
  const [tab, setTab] = useState<Tab>("card");

  return (
    <div className="w-full flex flex-col items-center gap-6">
      {/* ── MODE TAB SWITCHER ── */}
      <div className="flex items-center justify-center gap-2 bg-black/30 border border-[#f5c842]/30 p-1.5 rounded-full shadow-lg">
        <TabButton
          active={tab === "card"}
          onClick={() => setTab("card")}
          icon={<CreditCard className="h-4 w-4" />}
          label="Builder ID Card"
        />
        <TabButton
          active={tab === "pfp"}
          onClick={() => setTab("pfp")}
          icon={<CircleUserRound className="h-4 w-4" />}
          label="PFP Profile Frame"
        />
      </div>

      {/* ── BUILDER CONTENT ── */}
      <div className="w-full">
        {tab === "card" ? <IdCardBuilder /> : <PfpFrameBuilder />}
      </div>
    </div>
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
      className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all ${
        active
          ? "bg-[#f5c842] text-[#026836] shadow-md shadow-[#f5c842]/20 scale-105"
          : "bg-transparent text-white/60 hover:text-white hover:bg-white/5"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
