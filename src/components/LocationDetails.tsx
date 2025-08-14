import { type Favourite } from "@/types/favourite";
import { type OpenWeatherCurrent } from "@/types/openWeatherCurrent";
import { type OpenWeatherForecast } from "@/types/openWeatherForecast";
import Image from "next/image";
import {
  degreesToCardinal,
  formatLocalTime,
  getWeatherGradient,
} from "@/utils";
import WeatherChart from "./WeatherChart";

interface LocationDetailsProps {
  location: Favourite;
}

export default async function LocationDetails({
  location,
}: LocationDetailsProps) {
  const [currentRes, forecastRes] = await Promise.all([
    fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/weather/current?lat=${location.lat}&lon=${location.lon}`,
      { cache: "no-store" }
    ),
    fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/weather/forecast?lat=${location.lat}&lon=${location.lon}`,
      { cache: "no-store" }
    ),
  ]);

  if (!currentRes.ok || !forecastRes.ok) {
    return <p className="text-red-500">Failed to load weather data</p>;
  }

  const current: OpenWeatherCurrent = await currentRes.json();
  const forecast: OpenWeatherForecast = await forecastRes.json();
  const gradient = getWeatherGradient(current.weather[0].description);

  const chartData = forecast.list.slice(0, 24).map((item) => ({
    time: formatLocalTime(item.dt, forecast.city.timezone),
    temp: Math.round(item.main.temp),
    feels_like: Math.round(item.main.feels_like),
    humidity: item.main.humidity,
    wind: item.wind.speed,
    windDeg: item.wind.deg,
  }));

  return (
    <div className="container text-white space-y-6 mx-auto">
      {/* Current Weather */}
      <div className="flex items-center gap-4">
        <Image
          width={80}
          height={80}
          src={`https://openweathermap.org/img/wn/${current.weather[0].icon}@2x.png`}
          alt={current.weather[0].description}
        />
        <div>
          <h1 className="text-2xl font-bold mb-1">
            {current.name}, {current.sys.country}
          </h1>
          <p className="text-xl capitalize">{current.weather[0].description}</p>
          <p className="text-3xl font-bold">
            {Math.round(current.main.temp)}°C
          </p>
          <p className="text-sm opacity-80">
            Feels like {Math.round(current.main.feels_like)}°C
          </p>
        </div>
      </div>

      {/* Weather Details */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm rounded-2xl shadow-2xl bg-white/20 p-5">
        <div>Humidity: {current.main.humidity}%</div>
        <div>Pressure: {current.main.pressure} hPa</div>
        <div>Clouds: {current.clouds.all}%</div>
        <div>
          Sunrise: {formatLocalTime(current.sys.sunrise, current.timezone)}
        </div>
        <div>
          Sunset: {formatLocalTime(current.sys.sunset, current.timezone)}
        </div>

        {/* Wind Display */}
        <div className="flex items-center gap-2">
          <svg
            className="w-6 h-6 transform"
            style={{ rotate: `${current.wind.deg}deg` }}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 2v20m0-20l6 6M12 2L6 8"
            />
          </svg>
          <span>
            {current.wind.speed} m/s ({degreesToCardinal(current.wind.deg)})
          </span>
        </div>
      </div>

      {/* Forecast */}
      <div
        className={`p-6 rounded-2xl shadow bg-gradient-to-br ${gradient} animate-gradient`}
      >
        <h2 className="text-lg font-semibold mb-2">Next Hours Forecast</h2>
        <div className="overflow-x-auto flex gap-4 text-xs">
          {forecast.list.slice(0, 24).map((item) => (
            <div
              key={item.dt}
              className="flex flex-col min-w-24 items-center bg-white/20 p-2 rounded-2xl"
            >
              <p>{formatLocalTime(item.dt, forecast.city.timezone)}</p>
              <Image
                width={40}
                height={40}
                src={`https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`}
                alt={item.weather[0].description}
              />
              <p>{Math.round(item.main.temp)}°C</p>
              <p className="capitalize">{item.weather[0].description}</p>
              <div className="flex items-center gap-1">
                <svg
                  className="w-4 h-4 transform"
                  style={{ rotate: `${item.wind.deg}deg` }}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 2v20m0-20l6 6M12 2L6 8"
                  />
                </svg>
                <span>{item.wind.speed} m/s</span>
              </div>
              <p className="text-xs opacity-80">
                {degreesToCardinal(item.wind.deg)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Weather Charts */}
      <h2 className="text-lg font-semibold">Weather Charts</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <WeatherChart
          data={chartData}
          dataKey="temp"
          name="Temperature"
          stroke="#FF6B6B"
          unit="°C"
        />
        <WeatherChart
          data={chartData}
          dataKey="feels_like"
          name="Feels Like"
          stroke="#FFA500"
          unit="°C"
        />
        <WeatherChart
          data={chartData}
          dataKey="humidity"
          name="Humidity"
          stroke="#00BFFF"
          unit="%"
        />
        <WeatherChart
          data={chartData}
          dataKey="wind"
          name="Wind Speed"
          stroke="#32CD32"
          unit="m/s"
        />
      </div>
    </div>
  );
}
