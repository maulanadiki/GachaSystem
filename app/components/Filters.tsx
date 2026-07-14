import React from "react";

export type RarityType = "All" | "Legendaris" | "Langka" | "Biasa";

interface FiltersProps {
  selectedRarity: RarityType;
  onRarityChange: (rarity: RarityType) => void;
  counts: {
    All: number;
    Legendaris: number;
    Langka: number;
    Biasa: number;
  };
}

export default function Filters({
  selectedRarity,
  onRarityChange,
  counts,
}: FiltersProps) {
  const filters: { name: RarityType; label: string; dotColor?: string }[] = [
    { name: "All", label: "All Rarity" },
    { name: "Legendaris", label: "Legendaris", dotColor: "bg-gold" },
    { name: "Langka", label: "Langka", dotColor: "bg-purple-500" },
    { name: "Biasa", label: "Biasa", dotColor: "bg-neutral-400" },
  ];

  return (
    <div className="p-6 rounded-2xl bg-panel border border-border-custom shadow-md shadow-black/20 flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
      {/* Background decoration lines */}
      <div className="absolute right-0 top-0 bottom-0 w-32 opacity-10 flex flex-col gap-2 justify-center pointer-events-none transform skew-x-12 translation-x-6">
        <div className="h-1 bg-gold w-full" />
        <div className="h-1 bg-gold w-2/3" />
        <div className="h-1 bg-gold w-1/2" />
      </div>

      <div className="space-y-3 z-10">
        <span className="text-[10px] font-mono text-muted tracking-widest uppercase block">
          Active Filters
        </span>
        <div className="flex flex-wrap gap-3">
          {filters.map((filter) => {
            const isActive = selectedRarity === filter.name;
            return (
              <button
                key={filter.name}
                onClick={() => onRarityChange(filter.name)}
                className={`flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs font-semibold tracking-wide border transition-all duration-200 focus:outline-none select-none ${
                  isActive
                    ? "bg-[#25201a] border-gold text-gold shadow-[0_0_8px_rgba(255,208,43,0.15)]"
                    : "bg-[#181512] border-border-custom/60 text-muted hover:text-foreground hover:border-muted/40"
                }`}
              >
                {filter.dotColor && (
                  <span className={`w-2 h-2 rounded-full ${filter.dotColor}`} />
                )}
                <span>{filter.label}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md ${
                    isActive
                      ? "bg-gold/10 text-gold"
                      : "bg-[#1c1814] text-muted/60"
                  }`}
                >
                  {counts[filter.name]}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
