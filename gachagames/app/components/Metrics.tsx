import React, { useMemo, useState } from "react";
import { PlusIcon, CheckIcon } from "./Icons";
import { GachaItem } from "./ItemTable";

interface MetricsProps {
  totalItems: number;
  totalDropRate: number;
  onSummonClick: () => void;
  data: GachaItem[];
}

export default function Metrics({
  totalItems,
  totalDropRate,
  onSummonClick,
  data,
}: MetricsProps) {
  const [selectedEventId, setSelectedEventId] = useState<string>("all");

  const eventOptions = useMemo(() => {
      const map = new Map<string, string>();
      data.forEach((item) => {
        if (!map.has(item.event_id)) {
          map.set(item.event_id, item.event_name);
        }
      });
      return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
    }, [data]);

  // Items scoped to the selected event (or everything, if "all")
  const filteredItems = useMemo(() => {
    if (selectedEventId === "all") return data;
    return data.filter((item) => item.event_id === selectedEventId);
  }, [data, selectedEventId]);

  // Summary numbers recompute based on the filter.
  // "All" keeps using the totals passed down from the parent (which may
  // include the +1244 offset / other logic outside this component's scope).
  const displayedTotalItems =
    selectedEventId === "all" ? totalItems : filteredItems.length;

  const displayedTotalDropRate =
    selectedEventId === "all"
      ? totalDropRate
      : filteredItems.reduce((sum, item) => sum + Number(item.drop_rate), 0);

  const formattedRate = displayedTotalDropRate.toFixed(2);
  const isEquilibriumStable = Math.abs(displayedTotalDropRate - 100) < 0.001;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
      {/* Aetheric Equilibrium Card */}
      <div className="md:col-span-2 flex flex-col md:flex-row md:items-center justify-between p-6 rounded-2xl bg-panel border border-border-custom relative overflow-hidden shadow-lg shadow-black/40">
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <span className="text-[10px] font-mono text-muted tracking-widest uppercase block">
              Weight Random for
            </span>
            {/* Event filter dropdown */}
            <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="text-[10px] font-mono uppercase tracking-wider bg-[#13110e] text-muted border border-border-custom/40 rounded px-2 py-1 outline-none hover:border-gold/30 focus:border-gold/50 transition-colors duration-200"
              >
                <option value="all">All Events</option>
                {eventOptions.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.name}
                  </option>
                ))}
              </select>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`text-4xl font-extrabold tracking-tight font-sans ${
                isEquilibriumStable ? "text-foreground" : "text-amber-500"
              }`}
            >
              {formattedRate}%
            </span>
            {isEquilibriumStable ? (
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <CheckIcon size={12} />
              </span>
            ) : (
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold text-xs select-none">
                !
              </span>
            )}
          </div>
        </div>

        {/* Progress Bar Container */}
        <div className="mt-4 md:mt-0 flex-1 max-w-xs w-full">
          <div className="h-2 w-full bg-[#13110e] rounded-full overflow-hidden border border-border-custom/30">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isEquilibriumStable
                  ? "bg-gold shadow-[0_0_8px_rgba(255,208,43,0.4)]"
                  : "bg-amber-500"
              }`}
              style={{ width: `${Math.min(displayedTotalDropRate, 100)}%` }}
            />
          </div>
          <div className="flex justify-between items-center mt-2 text-[10px] font-mono text-muted">
            <span>0%</span>
            <span>{isEquilibriumStable ? "Stable" : "Unbalanced"}</span>
            <span>100%</span>
          </div>
        </div>
      </div>

      {/* Button & Count Grid */}
      <div className="flex flex-col gap-4 justify-between">
        {/* Summon New Item Button */}
        <button
          onClick={onSummonClick}
          className="flex items-center justify-center gap-3 w-full bg-gold hover:bg-gold-hover text-black py-4 px-6 rounded-xl font-bold tracking-wider uppercase transition-all duration-300 hover:shadow-[0_0_15px_rgba(255,208,43,0.3)] active:scale-[0.98] select-none text-sm border border-gold/10"
        >
          <PlusIcon size={18} />
          New Item
        </button>

        {/* Total Item Count Card */}
        <div className="flex items-center justify-between p-4 px-6 rounded-xl bg-panel border border-border-custom shadow-md shadow-black/20">
          <div className="flex flex-col">
            <span className="text-[9px] font-mono text-muted tracking-widest uppercase">
              Total Item Count
            </span>
            <span className="text-2xl font-bold tracking-tight mt-1 text-foreground">
              {displayedTotalItems}
            </span>
          </div>
          <span className="text-[10px] font-mono text-muted uppercase tracking-wider bg-[#13110e] px-2.5 py-1 rounded border border-border-custom/30">
            {selectedEventId === "all" ? "Registered" : "Filtered"}
          </span>
        </div>
      </div>
    </div>
  );
}