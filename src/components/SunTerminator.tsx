import { useMemo } from "react";
import { Geographies, Geography } from "react-simple-maps";
import { geoCircle } from "d3-geo";

interface SunTerminatorProps {
  dateTime: Date;
}

/**
 * Calculate the subsolar point (lat/lon where the sun is directly overhead)
 */
function getSubsolarPoint(date: Date): [number, number] {
  const jd = date.getTime() / 86400000 + 2440587.5;
  const n = jd - 2451545.0;

  // Solar mean longitude & mean anomaly
  const L = (280.46 + 0.9856474 * n) % 360;
  const g = ((357.528 + 0.9856003 * n) % 360) * (Math.PI / 180);

  // Ecliptic longitude
  const lambda = (L + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g)) * (Math.PI / 180);

  // Obliquity of ecliptic
  const epsilon = 23.439 * (Math.PI / 180);

  // Declination (latitude)
  const decl = Math.asin(Math.sin(epsilon) * Math.sin(lambda)) * (180 / Math.PI);

  // Right ascension → hour angle → longitude
  const eqTime = (L - (Math.atan2(Math.sin(lambda) * Math.cos(epsilon), Math.cos(lambda)) * (180 / Math.PI))) ;
  const utHours = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;
  const lon = -(utHours - 12) * 15 - eqTime;

  return [((lon + 540) % 360) - 180, decl];
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
  const layerGeoJsons = useMemo(() => {
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

    // Golden hour: ring on the sunlit side (circle from subsolar point)
    const goldenOuter = makeCircle([lon, lat], GOLDEN_HOUR.outerRadius);
    const goldenInner = makeCircle([lon, lat], GOLDEN_HOUR.innerRadius);
    const goldenGeo = {
      outer: { type: "FeatureCollection" as const, features: [{ type: "Feature" as const, properties: {}, geometry: goldenOuter }] },
      inner: { type: "FeatureCollection" as const, features: [{ type: "Feature" as const, properties: {}, geometry: goldenInner }] },
    };

    return { nightLayers, goldenGeo };
  }, [dateTime]);

  const noPointer = { pointerEvents: "none" as const, outline: "none" };

  return (
    <>
      {/* Golden hour band – render outer filled, then punch out inner with ocean color is complex;
          instead render outer with warm tint */}
      <Geographies geography={layerGeoJsons.goldenGeo.outer}>
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

      {/* Night & twilight layers (largest first so smaller/darker overlaps on top) */}
      {layerGeoJsons.nightLayers.map((layer) => (
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
    </>
  );
};

export default SunTerminator;
