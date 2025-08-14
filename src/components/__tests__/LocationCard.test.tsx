import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import LocationCard from "@/components/LocationCard";
import { type Favourite } from "@/types/favourite";
import * as utils from "@/utils";

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

// Mock the ThreeDotsMenu component
jest.mock("@/components/ThreeDotsMenu", () => ({
  ThreeDotsMenu: ({ location }: { location: Favourite }) => (
    <div data-testid="three-dots-menu" data-location-id={location.id}>
      Menu
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

describe("LocationCard", () => {
  const mockLocation: Favourite = {
    id: "1",
    name: "London",
    lat: 51.5074,
    lon: -0.1278,
  };

  const mockCurrentWeather = {
    weather: [
      {
        description: "clear sky",
        icon: "01d",
      },
    ],
    main: {
      temp: 22.5,
    },
    wind: {
      speed: 3.2,
      deg: 180,
    },
    dt: 1692000000,
    timezone: 3600,
  };

  const mockForecastWeather = {
    list: [
      {
        wind: {
          speed: 2.8,
          deg: 200,
        },
      },
    ],
  };

  const mockedUtils = utils as jest.Mocked<typeof utils>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockedUtils.degreesToCardinal.mockReturnValue("S");
    mockedUtils.formatLocalTime.mockReturnValue("14:30");
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

    it("renders location name correctly", async () => {
      render(await LocationCard({ location: mockLocation }));

      expect(
        screen.getByRole("heading", { name: "London" })
      ).toBeInTheDocument();
    });

    it("displays current weather information", async () => {
      render(await LocationCard({ location: mockLocation }));

      await waitFor(() => {
        expect(screen.getByText("clear sky")).toBeInTheDocument();
        expect(screen.getByText("23°C")).toBeInTheDocument(); // Math.round(22.5) = 23
      });
    });

    it("displays weather icon with correct attributes", async () => {
      render(await LocationCard({ location: mockLocation }));

      await waitFor(() => {
        const weatherIcon = screen.getByAltText("clear sky");
        expect(weatherIcon).toBeInTheDocument();
        expect(weatherIcon).toHaveAttribute(
          "src",
          "https://openweathermap.org/img/wn/01d@2x.png"
        );
        expect(weatherIcon).toHaveAttribute("width", "50");
        expect(weatherIcon).toHaveAttribute("height", "50");
      });
    });

    it("displays wind information for current weather", async () => {
      render(await LocationCard({ location: mockLocation }));

      await waitFor(() => {
        expect(screen.getByText(/💨 Current: 3.2 m\/s S/)).toBeInTheDocument();
      });
    });

    it("displays forecast wind information", async () => {
      render(await LocationCard({ location: mockLocation }));

      await waitFor(() => {
        expect(screen.getByText(/Next 3h: 2.8 m\/s S/)).toBeInTheDocument();
      });
    });

    it("displays local time", async () => {
      render(await LocationCard({ location: mockLocation }));

      await waitFor(() => {
        expect(screen.getByText(/🕒 Local time: 14:30/)).toBeInTheDocument();
      });
    });

    it("displays last updated time", async () => {
      render(await LocationCard({ location: mockLocation }));

      await waitFor(() => {
        const expectedTime = new Date(1692000000 * 1000).toLocaleTimeString();
        expect(
          screen.getByText(`Last updated: ${expectedTime}`)
        ).toBeInTheDocument();
      });
    });

    it("applies correct CSS gradient class", async () => {
      render(await LocationCard({ location: mockLocation }));

      await waitFor(() => {
        const cardElement = screen
          .getByRole("heading", { name: "London" })
          .closest("div");
        expect(cardElement).toHaveClass(
          "bg-gradient-to-br",
          "from-blue-400",
          "to-blue-600"
        );
      });
    });

    it("renders ThreeDotsMenu component", async () => {
      render(await LocationCard({ location: mockLocation }));

      await waitFor(() => {
        expect(screen.getByTestId("three-dots-menu")).toBeInTheDocument();
      });
    });

    it("calls utility functions with correct parameters", async () => {
      render(await LocationCard({ location: mockLocation }));

      await waitFor(() => {
        expect(mockedUtils.getWeatherGradient).toHaveBeenCalledWith(
          "clear sky"
        );
        expect(mockedUtils.degreesToCardinal).toHaveBeenCalledWith(180);
        expect(mockedUtils.degreesToCardinal).toHaveBeenCalledWith(200);
        expect(mockedUtils.formatLocalTime).toHaveBeenCalledWith(
          1692000000,
          3600
        );
      });
    });

    it("makes correct API calls", async () => {
      render(await LocationCard({ location: mockLocation }));

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

      render(await LocationCard({ location: mockLocation }));

      expect(
        screen.getByRole("heading", { name: "London" })
      ).toBeInTheDocument();
      expect(
        screen.getByText("Failed to load weather data")
      ).toBeInTheDocument();
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

      render(await LocationCard({ location: mockLocation }));

      expect(
        screen.getByRole("heading", { name: "London" })
      ).toBeInTheDocument();
      expect(
        screen.getByText("Failed to load weather data")
      ).toBeInTheDocument();
    });

    it("renders error message when both APIs fail", async () => {
      (fetch as jest.MockedFunction<typeof fetch>)
        .mockResolvedValueOnce({
          ok: false,
        } as Response)
        .mockResolvedValueOnce({
          ok: false,
        } as Response);

      render(await LocationCard({ location: mockLocation }));

      expect(
        screen.getByRole("heading", { name: "London" })
      ).toBeInTheDocument();
      expect(
        screen.getByText("Failed to load weather data")
      ).toBeInTheDocument();
    });

    it("handles missing forecast data gracefully", async () => {
      const mockForecastEmpty = {
        list: [],
      };

      (fetch as jest.MockedFunction<typeof fetch>)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockCurrentWeather),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockForecastEmpty),
        } as Response);

      render(await LocationCard({ location: mockLocation }));

      await waitFor(() => {
        expect(screen.getByText("clear sky")).toBeInTheDocument();
        expect(screen.queryByText(/Next 3h:/)).not.toBeInTheDocument();
      });
    });
  });

  describe("Edge cases", () => {
    it("handles locations with special characters in name", async () => {
      const specialLocation: Favourite = {
        ...mockLocation,
        name: "São Paulo",
      };

      (fetch as jest.MockedFunction<typeof fetch>)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockCurrentWeather),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockForecastWeather),
        } as Response);

      render(await LocationCard({ location: specialLocation }));

      await waitFor(() => {
        expect(
          screen.getByRole("heading", { name: "São Paulo" })
        ).toBeInTheDocument();
      });
    });

    it("rounds temperature correctly for negative values", async () => {
      const coldWeather = {
        ...mockCurrentWeather,
        main: { temp: -2.7 },
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

      render(await LocationCard({ location: mockLocation }));

      await waitFor(() => {
        expect(screen.getByText("-3°C")).toBeInTheDocument(); // Math.round(-2.7) = -3
      });
    });

    it("handles very long location names", async () => {
      const longNameLocation: Favourite = {
        ...mockLocation,
        name: "This is a very long location name that might cause layout issues",
      };

      (fetch as jest.MockedFunction<typeof fetch>)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockCurrentWeather),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockForecastWeather),
        } as Response);

      render(await LocationCard({ location: longNameLocation }));

      await waitFor(() => {
        expect(
          screen.getByText(
            "This is a very long location name that might cause layout issues"
          )
        ).toBeInTheDocument();
      });
    });
  });
});
