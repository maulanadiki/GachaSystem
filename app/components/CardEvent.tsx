import { useState } from "react";
import Carousel from "./Carousel";

interface CardEventsProps {
  id: string;
  title: string;
  description: string;
  start: string;
  end: string;
  status: boolean;
  dropRate: number;
  legendaris: string;
  langka: string;
  biasa: string;
  images: string[];
  onToggleStatus: (id: string, newStatus: boolean) => Promise<void>;
  onEdit: () => void;
}

const CardEvents = ({
  id,
  title,
  description,
  start,
  end,
  status,
  dropRate,
  legendaris,
  langka,
  biasa,
  images,
  onToggleStatus,
  onEdit,
}: CardEventsProps) => {
  const endDate = new Date(end);
  const currentDate = new Date();
  let stat = status
    ? "NOW"
    : endDate < currentDate
    ? "EXPIRED"
    : endDate > currentDate
    ? "INCOMING"
    : "NOW";
  const totDrop = dropRate;
  const rateValid = dropRate === 100;
  const [toggling, setToggling] = useState(false);

  const handleToggle = async () => {
    if (!rateValid) return;
    setToggling(true);
    try {
      await onToggleStatus(id, !status);
    } catch (err) {
      console.error("Failed to toggle event status:", err);
    } finally {
      setToggling(false);
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-panel border border-border-custom relative overflow-hidden shadow-lg">
      <div className="absolute top-0 right-0 flex items-center gap-2">
        <button
          type="button"
          onClick={onEdit}
          className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-foreground text-[9px] font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer"
        >
          Edit
        </button>
        <div
          className={`px-3 py-1 ${
            stat == "NOW" ? "bg-gold" : "bg-muted"
          } text-black text-[9px] font-mono font-bold uppercase rounded-bl-xl tracking-wider`}
        >
          {stat}
        </div>
      </div>
      <h3 className="text-lg font-bold text-foreground mt-2">{title}</h3>
      <p className="text-xs text-muted mt-2">{description}</p>
      <div className="mt-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 text-xs font-mono">
        <span className="text-muted">
          Duration: {start} - {end}
        </span>

        <div className="flex items-center gap-2 justify-between sm:justify-end">
          <span className={`${status ? "text-emerald-400" : "text-gray-400"} font-bold uppercase`}>
            {status ? "ONLINE" : "STANDBY"}
          </span>

          <button
            type="button"
            onClick={handleToggle}
            disabled={toggling || !rateValid}
            title={!rateValid ? "Drop rates must sum to 100% to activate" : undefined}
            aria-pressed={status}
            aria-label={status ? "Deactivate event" : "Activate event"}
            className={`relative w-9 h-5 rounded-full transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed shrink-0 ${
              status ? "bg-emerald-500" : "bg-neutral-600"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${
                status ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 mt-4">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-[11px] font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
          <span className="text-yellow-500/70 uppercase tracking-wide">Legendaris</span>
          <span className="text-yellow-400 font-bold">{parseFloat(legendaris || "0").toFixed(0)}%</span>
        </span>

        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-[11px] font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
          <span className="text-purple-400/70 uppercase tracking-wide">Langka</span>
          <span className="text-purple-300 font-bold">{parseFloat(langka || "0").toFixed(0)}%</span>
        </span>

        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-800/40 border border-neutral-700 text-[11px] font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
          <span className="text-neutral-400 uppercase tracking-wide">Biasa</span>
          <span className="text-neutral-200 font-bold">{parseFloat(biasa || "0").toFixed(0)}%</span>
        </span>
      </div>
      {!rateValid && (
        <p className="text-[10px] text-red-400 mt-2 font-mono">
          Drop rates Current is {totDrop}%, this event will be actived if reach 100% Drop Rate.
        </p>
      )}
      <div className="mt-3">
        <Carousel images={images} />
      </div>
    </div>
  );
};

export default CardEvents;