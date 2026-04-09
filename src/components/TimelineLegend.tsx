import { useMemo, useState } from "react";
import { TIMELINE_PERIODS, rulingEntities, getEmpireColor } from "@/data/historicalData";
import { ChevronDown, ChevronUp } from "lucide-react";

interface TimelineLegendProps {
  periodIndex: number;
  highlightedEmpire: string | null;
  onHighlightEmpire: (empire: string | null) => void;
}

const TimelineLegend = ({ periodIndex, highlightedEmpire, onHighlightEmpire }: TimelineLegendProps) => {
  const [expanded, setExpanded] = useState(true);
  const year = TIMELINE_PERIODS[periodIndex].year;

  const empires = useMemo(() => {
    const set = new Set<string>();
    for (const countryEntities of Object.values(rulingEntities)) {
      const entity = countryEntities[year];
      if (entity) set.add(entity);
    }
    const sorted = [...set].sort((a, b) => {
      const minor = ["Indigenous", "Various Tribes", "Uninhabited", "Independent", "Self-governing"];
      const aMinor = minor.includes(a) ? 1 : 0;
      const bMinor = minor.includes(b) ? 1 : 0;
      if (aMinor !== bMinor) return aMinor - bMinor;
      return a.localeCompare(b);
    });
    return sorted;
  }, [year]);

  return (
    <div className="absolute top-28 right-4 z-10 w-48 rounded-xl border border-map-border bg-map-tooltip-bg/95 backdrop-blur-md shadow-lg animate-in fade-in slide-in-from-right-2 duration-200"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-2.5 text-xs font-bold text-map-highlight"
      >
        <span>Empires & Powers</span>
        {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>

      {expanded && (
        <div className="max-h-[45vh] overflow-y-auto px-3 pb-3 space-y-1">
          {empires.map((name) => (
            <button
              key={name}
              onClick={() => onHighlightEmpire(highlightedEmpire === name ? null : name)}
              className={`flex items-center gap-2 w-full text-left rounded px-1 py-0.5 transition-colors ${
                highlightedEmpire === name ? "bg-map-border/50 ring-1 ring-map-highlight/50" : "hover:bg-map-border/30"
              }`}
            >
              <div
                className="w-3 h-3 rounded-sm shrink-0"
                style={{ backgroundColor: getEmpireColor(name) }}
              />
              <span className={`text-[11px] truncate ${highlightedEmpire === name ? "text-map-highlight font-medium" : "text-primary-foreground"}`}>{name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default TimelineLegend;
