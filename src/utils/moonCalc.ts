/**
 * Simplified lunar calculations for moon phase, position, and rise/set times.
 */

const RAD = Math.PI / 180;
const DEG = 180 / Math.PI;

/** Get the moon's ecliptic longitude and latitude (simplified) */
function getMoonPosition(date: Date) {
  const jd = date.getTime() / 86400000 + 2440587.5;
  const T = (jd - 2451545.0) / 36525;

  // Mean elements
  const L0 = (218.3165 + 481267.8813 * T) % 360; // mean longitude
  const M = ((134.963 + 477198.8676 * T) % 360) * RAD; // mean anomaly
  const F = ((93.272 + 483202.0175 * T) % 360) * RAD; // argument of latitude
  const D = ((297.8502 + 445267.1115 * T) % 360) * RAD; // mean elongation
  const Ms = ((357.5291 + 35999.0503 * T) % 360) * RAD; // sun mean anomaly

  // Longitude corrections
  const lon =
    L0 +
    6.289 * Math.sin(M) +
    1.274 * Math.sin(2 * D - M) +
    0.658 * Math.sin(2 * D) +
    0.214 * Math.sin(2 * M) -
    0.186 * Math.sin(Ms) -
    0.114 * Math.sin(2 * F);

  const lat =
    5.128 * Math.sin(F) +
    0.281 * Math.sin(M + F) +
    0.278 * Math.sin(M - F);

  // Right ascension and declination
  const eclLon = lon * RAD;
  const eclLat = lat * RAD;
  const epsilon = 23.439 * RAD;

  const ra = Math.atan2(
    Math.sin(eclLon) * Math.cos(epsilon) - Math.tan(eclLat) * Math.sin(epsilon),
    Math.cos(eclLon)
  );
  const decl = Math.asin(
    Math.sin(eclLat) * Math.cos(epsilon) +
    Math.cos(eclLat) * Math.sin(epsilon) * Math.sin(eclLon)
  );

  return { ra, decl, eclLon: lon, D };
}

/** Get sub-lunar point (geographic coordinates where moon is directly overhead) */
export function getSublunarPoint(date: Date): [number, number] {
  const { ra, decl } = getMoonPosition(date);
  const utHours = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;
  // Greenwich Mean Sidereal Time
  const jd = date.getTime() / 86400000 + 2440587.5;
  const T = (jd - 2451545.0) / 36525;
  const GMST = (280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * T * T) % 360;
  let lon = (ra * DEG - GMST + 720) % 360;
  if (lon > 180) lon -= 360;
  const lat = decl * DEG;
  return [lon, lat];
}

/**
 * Moon phase: 0 = new moon, 0.5 = full moon, 1 = next new moon
 * Returns phase (0-1) and age in days (0-29.53)
 */
export function getMoonPhase(date: Date): { phase: number; age: number; name: string; emoji: string } {
  const jd = date.getTime() / 86400000 + 2440587.5;
  const T = (jd - 2451545.0) / 36525;
  const D = ((297.8502 + 445267.1115 * T) % 360 + 360) % 360; // mean elongation in degrees
  const phase = D / 360; // 0 to 1
  const age = phase * 29.53;

  let name: string;
  let emoji: string;
  if (phase < 0.0625) { name = "New Moon"; emoji = "🌑"; }
  else if (phase < 0.1875) { name = "Waxing Crescent"; emoji = "🌒"; }
  else if (phase < 0.3125) { name = "First Quarter"; emoji = "🌓"; }
  else if (phase < 0.4375) { name = "Waxing Gibbous"; emoji = "🌔"; }
  else if (phase < 0.5625) { name = "Full Moon"; emoji = "🌕"; }
  else if (phase < 0.6875) { name = "Waning Gibbous"; emoji = "🌖"; }
  else if (phase < 0.8125) { name = "Last Quarter"; emoji = "🌗"; }
  else if (phase < 0.9375) { name = "Waning Crescent"; emoji = "🌘"; }
  else { name = "New Moon"; emoji = "🌑"; }

  return { phase, age, name, emoji };
}

/**
 * Calculate approximate moonrise and moonset for a given date and location.
 * Returns UTC times as strings, or null for always-up/always-down.
 */
export function getMoonriseMoonset(
  date: Date,
  lat: number,
  lon: number
): { moonrise: string; moonset: string } | { status: "always-up" | "always-down" } {
  const { decl } = getMoonPosition(date);

  // Hour angle for moon at horizon (accounting for moon's larger angular diameter)
  const cosH =
    (Math.sin(0.125 * RAD) - Math.sin(lat * RAD) * Math.sin(decl)) /
    (Math.cos(lat * RAD) * Math.cos(decl));

  if (cosH < -1) return { status: "always-up" };
  if (cosH > 1) return { status: "always-down" };

  const H = Math.acos(cosH) * DEG;

  // Transit time approximation
  const jd = date.getTime() / 86400000 + 2440587.5;
  const T = (jd - 2451545.0) / 36525;
  const { ra } = getMoonPosition(date);
  const GMST = (280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * T * T) % 360;
  const transit = ((ra * DEG - GMST - lon + 720) % 360) / 15; // hours

  const riseHours = ((transit - H / 15 + 24) % 24);
  const setHours = ((transit + H / 15 + 24) % 24);

  const fmt = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
  };

  return { moonrise: fmt(riseHours), moonset: fmt(setHours) };
}

/** Get illumination percentage (0-100) */
export function getMoonIllumination(date: Date): number {
  const { phase } = getMoonPhase(date);
  return Math.round((1 - Math.cos(phase * 2 * Math.PI)) / 2 * 100);
}
