export const degreesToCardinal = (degrees: number): string => {
  const directions = [
    "N",
    "NNE",
    "NE",
    "ENE",
    "E",
    "ESE",
    "SE",
    "SSE",
    "S",
    "SSW",
    "SW",
    "WSW",
    "W",
    "WNW",
    "NW",
    "NNW",
  ];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
};

export function formatLocalTime(unix: number, offsetSec: number) {
  const utcMillis = unix * 1000;
  const localMillis = utcMillis + offsetSec * 1000;
  const date = new Date(localMillis);

  let hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";

  hours = hours % 12;
  hours = hours ? hours : 12;

  const minutesStr = minutes < 10 ? `0${minutes}` : minutes;

  return `${hours}:${minutesStr} ${ampm}`;
}

const weatherGradients: Record<string, string> = {
  cloud: "from-gray-300 to-gray-500",
  rain: "from-blue-400 to-blue-700",
  clear: "from-yellow-300 to-orange-500",
  snow: "from-blue-200 to-white",
};

export function getWeatherGradient(condition: string): string {
  const c = condition.toLowerCase();
  for (const key in weatherGradients) {
    if (c.includes(key)) return weatherGradients[key];
  }
  return "from-slate-200 to-slate-400";
}
