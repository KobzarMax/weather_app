import { render, screen, waitFor, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import LocationDetails from "@/components/LocationDetails";
import { type Favourite } from "@/types/favourite";
import * as utils from "@/utils";
import { WeatherChartProps } from "../WeatherChart";

// Mock Next.js Image component
interface MockImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
}

jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ src, alt, width, height }: MockImageProps) => (
    <img src={src} alt={alt} width={width} height={height} />
  ),
}));

// Mock WeatherChart component
jest.mock("@/components/WeatherChart", () => ({
  __esModule: true,
  default: ({ data, dataKey, name, stroke, unit }: WeatherChartProps) => (
    <div
      data-testid={`weather-chart-${dataKey}`}
      data-name={name}
      data-stroke={stroke}
      data-unit={unit}
    >
      Chart: {name} ({data.length} data points)
    </div>
  ),
}));

// Mock utility functions
jest.mock("@/utils", () => ({
  degreesToCardinal: jest.fn(),
  formatLocalTime: jest.fn(),
  getWeatherGradient: jest.fn(),
}));

// Mock environment variable
process.env.NEXT_PUBLIC_BASE_URL = "http://localhost:3000";

// Mock fetch globally
global.fetch = jest.fn();

describe("LocationDetails", () => {
  const mockLocation: Favourite = {
    id: "1",
    name: "London",
    lat: 51.5074,
    lon: -0.1278,
  };

  const mockCurrentWeather = {
    name: "London",
    sys: {
      country: "GB",
      sunrise: 1692000000,
      sunset: 1692050000,
    },
    weather: [
      {
        description: "clear sky",
        icon: "01d",
      },
    ],
    main: {
      temp: 22.5,
      feels_like: 24.2,
      humidity: 65,
      pressure: 1013,
    },
    wind: {
      speed: 3.2,
      deg: 180,
    },
    clouds: {
      all: 10,
    },
    dt: 1692000000,
    timezone: 3600,
  };

  const mockForecastWeather = {
    city: {
      timezone: 3600,
    },
    list: [
      {
        dt: 1692003600,
        main: {
          temp: 21.5,
          feels_like: 23.1,
          humidity: 70,
        },
        weather: [
          {
            description: "partly cloudy",
            icon: "02d",
          },
        ],
        wind: {
          speed: 2.8,
          deg: 200,
        },
      },
      {
        dt: 1692007200,
        main: {
          temp: 20.3,
          feels_like: 21.8,
          humidity: 75,
        },
        weather: [
          {
            description: "overcast",
            icon: "04d",
          },
        ],
        wind: {
          speed: 3.5,
          deg: 220,
        },
      },
      // Add more forecast items to test slicing
      ...Array.from({ length: 15 }, (_, i) => ({
        dt: 1692000000 + (i + 3) * 3600,
        main: {
          temp: 19 + i,
          feels_like: 20 + i,
          humidity: 60 + i,
        },
        weather: [
          {
            description: `weather ${i}`,
            icon: `0${(i % 9) + 1}d`,
          },
        ],
        wind: {
          speed: 2.5 + i * 0.1,
          deg: 180 + i * 10,
        },
      })),
    ],
  };

  const mockedUtils = utils as jest.Mocked<typeof utils>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockedUtils.degreesToCardinal.mockImplementation((deg) => {
      if (deg === 180) return "S";
      if (deg === 200) return "SSW";
      if (deg === 220) return "SW";
      return "N";
    });
    mockedUtils.formatLocalTime.mockImplementation((timestamp, timezone) => {
      const time = new Date(timestamp * 1000);
      return `${time.getUTCHours().toString().padStart(2, "0")}:${time
        .getUTCMinutes()
        .toString()
        .padStart(2, "0")}`;
    });
    mockedUtils.getWeatherGradient.mockReturnValue("from-blue-400 to-blue-600");
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("Successful weather data fetch", () => {
    beforeEach(() => {
      (fetch as jest.MockedFunction<typeof fetch>)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockCurrentWeather),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockForecastWeather),
        } as Response);
    });

    it("renders location name and country correctly", async () => {
      render(await LocationDetails({ location: mockLocation }));

      expect(screen.getByText("London, GB")).toBeInTheDocument();
    });

    it("displays current weather information", async () => {
      render(await LocationDetails({ location: mockLocation }));

      await waitFor(() => {
        // Current weather container
        const currentWeather = screen.getByText("clear sky").closest("div");
        expect(currentWeather).toBeInTheDocument();

        // Check temperature within current weather
        const currentTemp = within(currentWeather!).getByText("23°C");
        expect(currentTemp).toBeInTheDocument();

        // Check "Feels like" temperature
        const feelsLike = within(currentWeather!).getByText("Feels like 24°C");
        expect(feelsLike).toBeInTheDocument();
      });
    });

    it("displays main weather icon with correct attributes", async () => {
      render(await LocationDetails({ location: mockLocation }));

      await waitFor(() => {
        const weatherIcon = screen.getByAltText("clear sky");
        expect(weatherIcon).toBeInTheDocument();
        expect(weatherIcon).toHaveAttribute(
          "src",
          "https://openweathermap.org/img/wn/01d@2x.png"
        );
        expect(weatherIcon).toHaveAttribute("width", "80");
        expect(weatherIcon).toHaveAttribute("height", "80");
      });
    });

    it("displays weather details grid", async () => {
      render(await LocationDetails({ location: mockLocation }));

      await waitFor(() => {
        expect(screen.getByText("Humidity: 65%")).toBeInTheDocument();
        expect(screen.getByText("Pressure: 1013 hPa")).toBeInTheDocument();
        expect(screen.getByText("Clouds: 10%")).toBeInTheDocument();
      });
    });

    it("displays sunrise and sunset times", async () => {
      render(await LocationDetails({ location: mockLocation }));

      await waitFor(() => {
        expect(screen.getByText(/Sunrise: \d{2}:\d{2}/)).toBeInTheDocument();
        expect(screen.getByText(/Sunset: \d{2}:\d{2}/)).toBeInTheDocument();
        expect(mockedUtils.formatLocalTime).toHaveBeenCalledWith(
          1692000000,
          3600
        ); // sunrise
        expect(mockedUtils.formatLocalTime).toHaveBeenCalledWith(
          1692050000,
          3600
        ); // sunset
      });
    });

    it("displays wind information with arrow SVG", async () => {
      render(await LocationDetails({ location: mockLocation }));

      await waitFor(() => {
        expect(screen.getByText("3.2 m/s (S)")).toBeInTheDocument();
        // Check for SVG elements
        const windArrows = screen.getAllByRole("img", { hidden: true });
        expect(windArrows.length).toBeGreaterThan(0);
      });
    });

    it("displays forecast section with correct heading", async () => {
      render(await LocationDetails({ location: mockLocation }));

      await waitFor(() => {
        expect(screen.getByText("Next Hours Forecast")).toBeInTheDocument();
      });
    });

    it("displays forecast items (limited to first 12)", async () => {
      render(await LocationDetails({ location: mockLocation }));

      await waitFor(() => {
        // Get all forecast temperatures
        const forecastTemps = screen.getAllByText(/°C$/);

        // Expect the first forecast item temperature
        expect(
          forecastTemps.some((t) => t.textContent === "22°C")
        ).toBeTruthy();
        expect(
          forecastTemps.some((t) => t.textContent === "20°C")
        ).toBeTruthy();

        // Optional: you can also check descriptions for the forecast
        expect(screen.getByText("partly cloudy")).toBeInTheDocument();
        expect(screen.getByText("overcast")).toBeInTheDocument();
      });
    });

    it("displays weather charts section", async () => {
      render(await LocationDetails({ location: mockLocation }));

      await waitFor(() => {
        expect(screen.getByText("Weather Charts")).toBeInTheDocument();

        // Check all four chart components are rendered
        expect(screen.getByTestId("weather-chart-temp")).toBeInTheDocument();
        expect(
          screen.getByTestId("weather-chart-feels_like")
        ).toBeInTheDocument();
        expect(
          screen.getByTestId("weather-chart-humidity")
        ).toBeInTheDocument();
        expect(screen.getByTestId("weather-chart-wind")).toBeInTheDocument();
      });
    });

    it("passes correct props to WeatherChart components", async () => {
      render(await LocationDetails({ location: mockLocation }));

      await waitFor(() => {
        const tempChart = screen.getByTestId("weather-chart-temp");
        expect(tempChart).toHaveAttribute("data-name", "Temperature");
        expect(tempChart).toHaveAttribute("data-stroke", "#FF6B6B");
        expect(tempChart).toHaveAttribute("data-unit", "°C");

        const humidityChart = screen.getByTestId("weather-chart-humidity");
        expect(humidityChart).toHaveAttribute("data-name", "Humidity");
        expect(humidityChart).toHaveAttribute("data-stroke", "#00BFFF");
        expect(humidityChart).toHaveAttribute("data-unit", "%");

        const windChart = screen.getByTestId("weather-chart-wind");
        expect(windChart).toHaveAttribute("data-name", "Wind Speed");
        expect(windChart).toHaveAttribute("data-stroke", "#32CD32");
        expect(windChart).toHaveAttribute("data-unit", "m/s");
      });
    });

    it("applies correct gradient background to forecast section", async () => {
      render(await LocationDetails({ location: mockLocation }));

      await waitFor(() => {
        const forecastSection = screen
          .getByText("Next Hours Forecast")
          .closest("div");
        expect(forecastSection).toHaveClass(
          "bg-gradient-to-br",
          "from-blue-400",
          "to-blue-600"
        );
      });
    });

    it("makes correct API calls", async () => {
      render(await LocationDetails({ location: mockLocation }));

      expect(fetch).toHaveBeenCalledTimes(2);
      expect(fetch).toHaveBeenCalledWith(
        "http://localhost:3000/api/weather/current?lat=51.5074&lon=-0.1278",
        { cache: "no-store" }
      );
      expect(fetch).toHaveBeenCalledWith(
        "http://localhost:3000/api/weather/forecast?lat=51.5074&lon=-0.1278",
        { cache: "no-store" }
      );
    });

    it("calls utility functions with correct parameters", async () => {
      render(await LocationDetails({ location: mockLocation }));

      await waitFor(() => {
        expect(mockedUtils.getWeatherGradient).toHaveBeenCalledWith(
          "clear sky"
        );
        expect(mockedUtils.degreesToCardinal).toHaveBeenCalledWith(180);
        expect(mockedUtils.formatLocalTime).toHaveBeenCalledWith(
          1692000000,
          3600
        );
      });
    });

    it("limits forecast display to 12 items", async () => {
      render(await LocationDetails({ location: mockLocation }));

      await waitFor(() => {
        // Count forecast item containers
        const forecastItems = screen
          .getAllByText(/\d{2}:\d{2}/)
          .filter((el) => el.closest(".bg-white\\/20"));
        expect(forecastItems.length).toBeLessThanOrEqual(12);
      });
    });

    it("transforms forecast data correctly for charts", async () => {
      render(await LocationDetails({ location: mockLocation }));

      await waitFor(() => {
        // Check that charts receive data with correct length (12 items)
        const tempChart = screen.getByTestId("weather-chart-temp");
        expect(tempChart).toHaveTextContent("12 data points");

        const windChart = screen.getByTestId("weather-chart-wind");
        expect(windChart).toHaveTextContent("12 data points");
      });
    });
  });

  describe("Error handling", () => {
    it("renders error message when current weather API fails", async () => {
      (fetch as jest.MockedFunction<typeof fetch>)
        .mockResolvedValueOnce({
          ok: false,
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockForecastWeather),
        } as Response);

      render(await LocationDetails({ location: mockLocation }));

      expect(
        screen.getByText("Failed to load weather data")
      ).toBeInTheDocument();
      expect(screen.queryByText("London, GB")).not.toBeInTheDocument();
    });

    it("renders error message when forecast API fails", async () => {
      (fetch as jest.MockedFunction<typeof fetch>)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockCurrentWeather),
        } as Response)
        .mockResolvedValueOnce({
          ok: false,
        } as Response);

      render(await LocationDetails({ location: mockLocation }));

      expect(
        screen.getByText("Failed to load weather data")
      ).toBeInTheDocument();
      expect(screen.queryByText("London, GB")).not.toBeInTheDocument();
    });

    it("renders error message when both APIs fail", async () => {
      (fetch as jest.MockedFunction<typeof fetch>)
        .mockResolvedValueOnce({
          ok: false,
        } as Response)
        .mockResolvedValueOnce({
          ok: false,
        } as Response);

      render(await LocationDetails({ location: mockLocation }));

      expect(
        screen.getByText("Failed to load weather data")
      ).toBeInTheDocument();
    });
  });

  describe("Edge cases", () => {
    it("handles empty forecast list gracefully", async () => {
      const mockEmptyForecast = {
        ...mockForecastWeather,
        list: [],
      };

      (fetch as jest.MockedFunction<typeof fetch>)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockCurrentWeather),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockEmptyForecast),
        } as Response);

      render(await LocationDetails({ location: mockLocation }));

      await waitFor(() => {
        expect(screen.getByText("London, GB")).toBeInTheDocument();
        expect(screen.getByText("Next Hours Forecast")).toBeInTheDocument();
        // Charts should still render but with 0 data points
        expect(
          screen.getByText("Chart: Temperature (0 data points)")
        ).toBeInTheDocument();
      });
    });

    it("handles negative temperatures correctly", async () => {
      const coldWeather = {
        ...mockCurrentWeather,
        main: {
          ...mockCurrentWeather.main,
          temp: -5.7,
          feels_like: -8.2,
        },
      };

      (fetch as jest.MockedFunction<typeof fetch>)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(coldWeather),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockForecastWeather),
        } as Response);

      render(await LocationDetails({ location: mockLocation }));

      await waitFor(() => {
        expect(screen.getByText("-6°C")).toBeInTheDocument(); // Math.round(-5.7)
        expect(screen.getByText("Feels like -8°C")).toBeInTheDocument(); // Math.round(-8.2)
      });
    });

    it("handles locations with long names", async () => {
      const longNameWeather = {
        ...mockCurrentWeather,
        name: "Very Long Location Name That Might Cause Issues",
      };

      (fetch as jest.MockedFunction<typeof fetch>)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(longNameWeather),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockForecastWeather),
        } as Response);

      render(await LocationDetails({ location: mockLocation }));

      await waitFor(() => {
        expect(
          screen.getByText(
            "Very Long Location Name That Might Cause Issues, GB"
          )
        ).toBeInTheDocument();
      });
    });

    it("handles forecast with less than 12 items", async () => {
      const shortForecast = {
        ...mockForecastWeather,
        list: mockForecastWeather.list.slice(0, 5),
      };

      (fetch as jest.MockedFunction<typeof fetch>)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockCurrentWeather),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(shortForecast),
        } as Response);

      render(await LocationDetails({ location: mockLocation }));

      await waitFor(() => {
        expect(
          screen.getByText("Chart: Temperature (5 data points)")
        ).toBeInTheDocument();
        expect(
          screen.getByText("Chart: Wind Speed (5 data points)")
        ).toBeInTheDocument();
      });
    });
  });
});
