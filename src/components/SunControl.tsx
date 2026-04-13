import { useState, useEffect, useRef } from "react";
import { Sun, Play, Pause } from "lucide-react";
import { getMoonPhase, getMoonIllumination } from "@/utils/moonCalc";

interface SunControlProps {
  active: boolean;
  onToggle: () => void;
  dateTime: Date;
  onDateTimeChange: (d: Date) => void;
}

const SunControl = ({ active, onToggle, dateTime, onDateTimeChange }: SunControlProps) => {
  const [playing, setPlaying] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalMinutes = dateTime.getUTCHours() * 60 + dateTime.getUTCMinutes();

  useEffect(() => {
    if (playing && active) {
      intervalRef.current = setInterval(() => {
        onDateTimeChange(new Date(dateTime.getTime() + 30 * 60000)); // +30 min
      }, 150);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [playing, active, dateTime, onDateTimeChange]);

  useEffect(() => { if (!active) setPlaying(false); }, [active]);

  const formatTime = (d: Date) => {
    const h = d.getUTCHours().toString().padStart(2, "0");
    const m = d.getUTCMinutes().toString().padStart(2, "0");
    return `${h}:${m} UTC`;
  };

  const formatDate = (d: Date) => {
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
  };

  const handleSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const mins = Number(e.target.value);
    const d = new Date(dateTime);
    d.setUTCHours(Math.floor(mins / 60), mins % 60, 0, 0);
    onDateTimeChange(d);
  };

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <button
        onClick={onToggle}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors mb-2 ${
          active
            ? "bg-map-highlight text-map-ocean border-map-highlight"
            : "bg-map-ocean/90 text-map-highlight border-map-border hover:bg-map-border/50"
        }`}
      >
        <Sun className="w-3.5 h-3.5" /> Sunlight
      </button>

      {active && (
        <div className="w-[320px] rounded-xl border border-map-border bg-map-tooltip-bg/95 backdrop-blur-md shadow-2xl p-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="text-center mb-3">
            <span className="text-map-highlight font-bold text-sm">{formatTime(dateTime)}</span>
            <span className="text-muted-foreground text-xs ml-2">{formatDate(dateTime)}</span>
          </div>

          {/* Time slider */}
          <div className="px-1 mb-3">
            <input
              type="range"
              min={0}
              max={1439}
              value={totalMinutes}
              onChange={handleSlider}
              className="w-full h-1.5 bg-map-border rounded-full appearance-none cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-map-highlight [&::-webkit-slider-thumb]:cursor-pointer
                [&::-webkit-slider-thumb]:shadow-md"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
              <span>00:00</span>
              <span>12:00</span>
              <span>23:59</span>
            </div>
          </div>

          {/* Play control */}
          <div className="flex items-center justify-center">
            <button
              onClick={() => setPlaying(!playing)}
              className="p-1.5 rounded-md bg-map-highlight text-map-ocean hover:opacity-90 transition-colors"
            >
              {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Moon phase info */}
          <div className="mt-3 pt-3 border-t border-map-border flex items-center justify-center gap-2">
            <span className="text-lg">{getMoonPhase(dateTime).emoji}</span>
            <div className="text-center">
              <div className="text-xs text-map-highlight font-medium">{getMoonPhase(dateTime).name}</div>
              <div className="text-[10px] text-muted-foreground">{getMoonIllumination(dateTime)}% illuminated</div>
            </div>
          </div>

          <p className="text-[10px] text-muted-foreground text-center mt-2">
            Dark area = nighttime · Bright area = daylight
          </p>
        </div>
      )}
    </div>
  );
};

export default SunControl;
