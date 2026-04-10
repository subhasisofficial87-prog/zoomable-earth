import { type CountryInfo } from "@/data/countryData";
import { X, Sunrise, Sunset } from "lucide-react";
import { getFlag } from "@/data/countryFlags";
import { getRulingEntity } from "@/data/historicalData";
import { getSunriseSunset } from "@/utils/sunCalc";
import { countryCoordinates } from "@/data/countryCoordinates";

interface CountryTooltipProps {
  info: CountryInfo;
  countryCode: string;
  x: number;
  y: number;
  onClose: () => void;
  timelineActive?: boolean;
  timelineYear?: number;
  sunActive?: boolean;
  sunDateTime?: Date;
}

const CountryTooltip = ({ info, countryCode, x, y, onClose, timelineActive, timelineYear, sunActive, sunDateTime }: CountryTooltipProps) => {
  const flag = getFlag(countryCode);
  const ruler = timelineActive && timelineYear !== undefined ? getRulingEntity(countryCode, timelineYear) : null;

  const sunTimes = (() => {
    if (!sunActive || !sunDateTime) return null;
    const coords = countryCoordinates[countryCode];
    if (!coords) return null;
    return getSunriseSunset(sunDateTime, coords[1], coords[0]);
  })();
  // Adjust position to stay within viewport
  const style: React.CSSProperties = {
    left: Math.min(x, window.innerWidth - 300),
    top: Math.max(y - 220, 10),
  };

  return (
    <div
      className="absolute z-50 w-72 rounded-xl border border-map-tooltip-border bg-map-tooltip-bg/95 backdrop-blur-md shadow-2xl p-5 animate-in fade-in zoom-in-95 duration-200"
      style={style}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={onClose}
        className="absolute top-3 right-3 text-muted-foreground hover:text-map-highlight transition-colors"
      >
        <X size={16} />
      </button>

      <h2 className="text-lg font-bold text-map-highlight mb-3 pr-6">
        {flag && <span className="mr-1.5">{flag}</span>}{info.name}
      </h2>

      {ruler && (
        <div className="mb-3 px-2 py-1.5 rounded-md bg-map-border/30 text-xs text-primary-foreground">
          <span className="text-muted-foreground">Ruled by: </span>
          <span className="font-medium text-map-highlight">{ruler}</span>
        </div>
      )}

      <div className="space-y-2 text-sm">
        <Row label="Capital" value={info.capital} />
        <Row label="Population" value={info.population} />
        <Row label="GDP / Capita" value={`$${info.gdpPerCapita.toLocaleString()}`} />
        <Row label="Currency" value={`${info.currency} (${info.currencyCode})`} />
        <Row
          label="1 USD"
          value={
            info.currencyCode === "USD"
              ? "—"
              : `${(1 / parseFloat(info.usdValue)).toFixed(2)} ${info.currencyCode}`
          }
          highlight
        />
        <Row
          label={`1 ${info.currencyCode}`}
          value={
            info.currencyCode === "USD"
              ? "1.00 USD"
              : `${info.usdValue} USD`
          }
          highlight
        />
      </div>

      {sunTimes && (
        <div className="mt-3 pt-3 border-t border-map-tooltip-border">
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
            <Sunrise className="w-3.5 h-3.5 text-map-highlight" /> Daylight (UTC)
          </div>
          {"polar" in sunTimes ? (
            <div className="text-xs text-map-highlight font-medium">
              {sunTimes.polar === "day" ? "☀️ 24h Daylight (Midnight Sun)" : "🌑 24h Darkness (Polar Night)"}
            </div>
          ) : (
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-1.5">
                <Sunrise className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-primary-foreground font-medium">{sunTimes.sunrise}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Sunset className="w-3.5 h-3.5 text-orange-400" />
                <span className="text-primary-foreground font-medium">{sunTimes.sunset}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const Row = ({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) => (
  <div className="flex justify-between items-baseline gap-2">
    <span className="text-muted-foreground shrink-0">{label}</span>
    <span
      className={`text-right font-medium ${
        highlight ? "text-map-highlight" : "text-primary-foreground"
      }`}
    >
      {value}
    </span>
  </div>
);

export default CountryTooltip;
