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

const SunTerminator = ({ dateTime }: SunTerminatorProps) => {
  const nightGeoJson = useMemo(() => {
    const [lon, lat] = getSubsolarPoint(dateTime);
    // Night hemisphere = circle of 90° centered on anti-solar point
    const antiLon = ((lon + 180 + 540) % 360) - 180;
    const antiLat = -lat;

    const circle = geoCircle()
      .center([antiLon, antiLat])
      .radius(90)
      .precision(1)();

    return {
      type: "FeatureCollection" as const,
      features: [
        {
          type: "Feature" as const,
          properties: {},
          geometry: circle,
        },
      ],
    };
  }, [dateTime]);

  return (
    <Geographies geography={nightGeoJson}>
      {({ geographies }) =>
        geographies.map((geo) => (
          <Geography
            key="night-overlay"
            geography={geo}
            style={{
              default: {
                fill: "hsla(220, 40%, 5%, 0.45)",
                stroke: "hsla(45, 80%, 50%, 0.25)",
                strokeWidth: 1,
                outline: "none",
                pointerEvents: "none" as const,
              },
              hover: {
                fill: "hsla(220, 40%, 5%, 0.45)",
                outline: "none",
                pointerEvents: "none" as const,
              },
              pressed: {
                fill: "hsla(220, 40%, 5%, 0.45)",
                outline: "none",
                pointerEvents: "none" as const,
              },
            }}
          />
        ))
      }
    </Geographies>
  );
};

export default SunTerminator;
