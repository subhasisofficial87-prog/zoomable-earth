import { CONTINENTS, type Continent } from "@/data/continentData";
import { Globe } from "lucide-react";

interface ContinentFilterProps {
  selected: Continent;
  onSelect: (continent: Continent) => void;
}

const ContinentFilter = ({ selected, onSelect }: ContinentFilterProps) => {
  return (
    <div
      className="absolute top-14 right-6 z-10 flex flex-wrap gap-1 max-w-xs justify-end"
      onClick={(e) => e.stopPropagation()}
    >
      {CONTINENTS.map((c) => (
        <button
          key={c}
          onClick={() => onSelect(c)}
          className={`px-2.5 py-1.5 rounded-md text-xs font-medium border transition-colors ${
            selected === c
              ? "bg-map-highlight text-map-ocean border-map-highlight"
              : "bg-map-ocean/90 text-map-highlight border-map-border hover:bg-map-border/50"
          }`}
        >
          {c === "All" && <Globe className="w-3 h-3 inline mr-1" />}
          {c}
        </button>
      ))}
    </div>
  );
};

export default ContinentFilter;
