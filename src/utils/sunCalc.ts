/**
 * Calculate sunrise and sunset times for a given date and location.
 * Returns times in UTC as formatted strings, or null for polar day/night.
 */
export function getSunriseSunset(
  date: Date,
  lat: number,
  lon: number
): { sunrise: string; sunset: string } | { polar: "day" | "night" } {
  const rad = Math.PI / 180;
  const jd = date.getTime() / 86400000 + 2440587.5;
  const n = jd - 2451545.0;

  const L = (280.46 + 0.9856474 * n) % 360;
  const g = ((357.528 + 0.9856003 * n) % 360) * rad;
  const lambda = (L + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g)) * rad;
  const epsilon = 23.439 * rad;
  const decl = Math.asin(Math.sin(epsilon) * Math.sin(lambda));

  const cosH =
    (Math.sin(-0.8333 * rad) - Math.sin(lat * rad) * Math.sin(decl)) /
    (Math.cos(lat * rad) * Math.cos(decl));

  if (cosH < -1) return { polar: "day" }; // midnight sun
  if (cosH > 1) return { polar: "night" }; // polar night

  const H = Math.acos(cosH) / rad; // hour angle in degrees

  // Equation of time correction
  const eqTime =
    L -
    Math.atan2(Math.sin(lambda) * Math.cos(epsilon), Math.cos(lambda)) *
      (180 / Math.PI);

  const solarNoon = 720 - 4 * lon - eqTime; // minutes UTC
  const sunriseMin = solarNoon - H * 4;
  const sunsetMin = solarNoon + H * 4;

  const fmt = (mins: number) => {
    const m = ((mins % 1440) + 1440) % 1440;
    const hh = Math.floor(m / 60)
      .toString()
      .padStart(2, "0");
    const mm = Math.round(m % 60)
      .toString()
      .padStart(2, "0");
    return `${hh}:${mm}`;
  };

  return { sunrise: fmt(sunriseMin), sunset: fmt(sunsetMin) };
}
