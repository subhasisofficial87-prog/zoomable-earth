import { useMemo } from "react";
import { Geographies, Geography, Marker } from "react-simple-maps";
import { geoCircle } from "d3-geo";
import { cityLights } from "@/data/cityLights";

interface SunTerminatorProps {
  dateTime: Date;
}

function getSubsolarPoint(date: Date): [number, number] {
  const jd = date.getTime() / 86400000 + 2440587.5;
  const n = jd - 2451545.0;
  const L = (280.46 + 0.9856474 * n) % 360;
  const g = ((357.528 + 0.9856003 * n) % 360) * (Math.PI / 180);
  const lambda = (L + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g)) * (Math.PI / 180);
  const epsilon = 23.439 * (Math.PI / 180);
  const decl = Math.asin(Math.sin(epsilon) * Math.sin(lambda)) * (180 / Math.PI);
  const eqTime = (L - (Math.atan2(Math.sin(lambda) * Math.cos(epsilon), Math.cos(lambda)) * (180 / Math.PI)));
  const utHours = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;
  const lon = -(utHours - 12) * 15 - eqTime;
  return [((lon + 540) % 360) - 180, decl];
}

/** Check if a point is on the night side */
function isNightSide(lon: number, lat: number, antiLon: number, antiLat: number): boolean {
  const toRad = Math.PI / 180;
  const dLon = (lon - antiLon) * toRad;
  const lat1 = antiLat * toRad;
  const lat2 = lat * toRad;
  const a = Math.sin(lat1) * Math.sin(lat2) + Math.cos(lat1) * Math.cos(lat2) * Math.cos(dLon);
  const angle = Math.acos(Math.min(1, Math.max(-1, a))) * (180 / Math.PI);
  return angle < 90;
}

const LAYERS = [
  { radius: 108, fill: "hsla(220, 40%, 5%, 0.08)", stroke: "none", id: "astro-twilight" },
  { radius: 102, fill: "hsla(220, 40%, 5%, 0.10)", stroke: "none", id: "nautical-twilight" },
  { radius: 96,  fill: "hsla(220, 40%, 8%, 0.12)", stroke: "none", id: "civil-twilight" },
  { radius: 90,  fill: "hsla(220, 40%, 5%, 0.35)", stroke: "hsla(45, 80%, 50%, 0.25)", id: "night" },
];

const GOLDEN_HOUR = {
  outerRadius: 90,
  innerRadius: 84,
  fill: "hsla(40, 90%, 50%, 0.10)",
  stroke: "hsla(40, 80%, 55%, 0.18)",
  id: "golden-hour",
};

const SunTerminator = ({ dateTime }: SunTerminatorProps) => {
  const { nightLayers, goldenGeo, nightCities, nightStars, shootingStars, auroraPoints } = useMemo(() => {
    const [lon, lat] = getSubsolarPoint(dateTime);
    const antiLon = ((lon + 180 + 540) % 360) - 180;
    const antiLat = -lat;

    const makeCircle = (center: [number, number], radius: number) =>
      geoCircle().center(center).radius(radius).precision(1)();

    const nightLayers = LAYERS.map((l) => ({
      ...l,
      geo: {
        type: "FeatureCollection" as const,
        features: [{ type: "Feature" as const, properties: {}, geometry: makeCircle([antiLon, antiLat], l.radius) }],
      },
    }));

    const goldenOuter = makeCircle([lon, lat], GOLDEN_HOUR.outerRadius);
    const goldenInner = makeCircle([lon, lat], GOLDEN_HOUR.innerRadius);
    const goldenGeo = {
      outer: { type: "FeatureCollection" as const, features: [{ type: "Feature" as const, properties: {}, geometry: goldenOuter }] },
      inner: { type: "FeatureCollection" as const, features: [{ type: "Feature" as const, properties: {}, geometry: goldenInner }] },
    };

    // Filter cities that are on the night side
    const nightCities = cityLights.filter(([cLon, cLat]) =>
      isNightSide(cLon, cLat, antiLon, antiLat)
    );

    // Generate stars in the night area
    const nightStars: [number, number, number][] = [];
    const seed = 12345;
    for (let i = 0; i < 400; i++) {
      const hash = Math.sin(seed + i * 127.1) * 43758.5453;
      const r1 = hash - Math.floor(hash);
      const hash2 = Math.sin(seed + i * 269.5 + 3.17) * 43758.5453;
      const r2 = hash2 - Math.floor(hash2);
      const hash3 = Math.sin(seed + i * 419.2 + 7.13) * 43758.5453;
      const r3 = hash3 - Math.floor(hash3);
      const sLon = r1 * 360 - 180;
      const sLat = r2 * 140 - 70;
      if (isNightSide(sLon, sLat, antiLon, antiLat)) {
        nightStars.push([sLon, sLat, 0.3 + r3 * 0.7]);
      }
    }

    // Generate shooting stars in the night area
    const shootingStars: { lon: number; lat: number; angle: number; delay: number; duration: number }[] = [];
    for (let i = 0; i < 8; i++) {
      const h1 = Math.sin(seed + i * 311.7 + 5.3) * 43758.5453;
      const h2 = Math.sin(seed + i * 523.1 + 9.7) * 43758.5453;
      const h3 = Math.sin(seed + i * 743.3 + 2.1) * 43758.5453;
      const h4 = Math.sin(seed + i * 197.9 + 6.4) * 43758.5453;
      const sLon = (h1 - Math.floor(h1)) * 360 - 180;
      const sLat = (h2 - Math.floor(h2)) * 120 - 60;
      if (isNightSide(sLon, sLat, antiLon, antiLat)) {
        shootingStars.push({
          lon: sLon,
          lat: sLat,
          angle: (h3 - Math.floor(h3)) * 60 - 30,
          delay: (h4 - Math.floor(h4)) * 20,
          duration: 0.8 + (h3 - Math.floor(h3)) * 1.2,
        });
      }
    }

    // Generate aurora borealis/australis points along polar regions
    const auroraPoints: { lon: number; lat: number; width: number; height: number; hue: number; delay: number; opacity: number }[] = [];
    const polarBands = [
      { baseLat: 68, range: 8 },
      { baseLat: -68, range: 8 },
    ];
    for (const band of polarBands) {
      for (let i = 0; i < 12; i++) {
        const offset = band.baseLat > 0 ? 0 : 100;
        const ha = Math.sin(seed + i * 337.1 + offset) * 43758.5453;
        const hb = Math.sin(seed + i * 491.3 + offset) * 43758.5453;
        const hc = Math.sin(seed + i * 613.7 + offset) * 43758.5453;
        const aLon = (ha - Math.floor(ha)) * 360 - 180;
        const aLat = band.baseLat + (hb - Math.floor(hb)) * band.range - band.range / 2;
        if (isNightSide(aLon, aLat, antiLon, antiLat)) {
          const r = hc - Math.floor(hc);
          auroraPoints.push({
            lon: aLon,
            lat: aLat,
            width: 8 + r * 12,
            height: 3 + r * 4,
            hue: r < 0.5 ? 140 + r * 40 : 280 + r * 40,
            delay: r * 8,
            opacity: 0.15 + r * 0.2,
          });
        }
      }
    }

    return { nightLayers, goldenGeo, nightCities, nightStars, shootingStars, auroraPoints };
  }, [dateTime]);

  const noPointer = { pointerEvents: "none" as const, outline: "none" };

  return (
    <>
      {/* Golden hour band */}
      <Geographies geography={goldenGeo.outer}>
        {({ geographies }) =>
          geographies.map((geo) => (
            <Geography
              key="golden-outer"
              geography={geo}
              style={{
                default: { fill: GOLDEN_HOUR.fill, stroke: GOLDEN_HOUR.stroke, strokeWidth: 0.5, ...noPointer },
                hover: { fill: GOLDEN_HOUR.fill, ...noPointer },
                pressed: { fill: GOLDEN_HOUR.fill, ...noPointer },
              }}
            />
          ))
        }
      </Geographies>

      {/* Night & twilight layers */}
      {nightLayers.map((layer) => (
        <Geographies key={layer.id} geography={layer.geo}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={layer.id}
                geography={geo}
                style={{
                  default: { fill: layer.fill, stroke: layer.stroke, strokeWidth: layer.stroke !== "none" ? 1 : 0, ...noPointer },
                  hover: { fill: layer.fill, ...noPointer },
                  pressed: { fill: layer.fill, ...noPointer },
                }}
              />
            ))
          }
        </Geographies>
      ))}

      {/* Stars in the night sky */}
      {nightStars.map(([sLon, sLat, brightness], i) => (
        <Marker key={`star-${i}`} coordinates={[sLon, sLat]}>
          <circle
            r={0.3 + brightness * 0.4}
            fill={`hsla(220, 20%, 95%, ${0.15 + brightness * 0.35})`}
            style={{
              pointerEvents: "none",
              animation: `twinkle ${1.5 + brightness * 2}s ease-in-out ${brightness * 3}s infinite`,
            }}
          />
        </Marker>
      ))}

      {/* City lights in the dark area */}
      {nightCities.map(([lon, lat, intensity], i) => (
        <Marker key={`light-${i}`} coordinates={[lon, lat]}>
          <circle
            r={1.2 * intensity + 0.4}
            fill={`hsla(45, 80%, 80%, ${0.5 * intensity + 0.2})`}
            style={{ pointerEvents: "none", filter: "blur(0.3px)" }}
          />
          <circle
            r={2.5 * intensity + 0.8}
            fill={`hsla(40, 70%, 65%, ${0.15 * intensity + 0.05})`}
            style={{ pointerEvents: "none" }}
          />
        </Marker>
      ))}

      {/* Shooting stars */}
      {shootingStars.map((star, i) => (
        <Marker key={`shoot-${i}`} coordinates={[star.lon, star.lat]}>
          <line
            x1="0"
            y1="0"
            x2="12"
            y2="0"
            stroke="url(#shootingStarGrad)"
            strokeWidth="0.6"
            strokeLinecap="round"
            transform={`rotate(${star.angle})`}
            style={{
              pointerEvents: "none",
              opacity: 0,
              animation: `shootingStar ${star.duration}s ease-out ${star.delay}s infinite`,
            }}
          />
        </Marker>
      ))}

      {/* Shooting star gradient definition */}
      <defs>
        <linearGradient id="shootingStarGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="hsla(220, 20%, 95%, 0)" />
          <stop offset="30%" stopColor="hsla(220, 20%, 95%, 0.8)" />
          <stop offset="100%" stopColor="hsla(220, 20%, 95%, 0)" />
        </linearGradient>
      </defs>
    </>
  );
};

export default SunTerminator;
