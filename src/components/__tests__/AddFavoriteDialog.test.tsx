import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { act } from "react";
import { AddFavoriteDialog } from "@/components/AddFavoriteDialog";
import { useAddFavoriteDialog } from "@/store/useAddFavoriteDialog";
import * as actions from "@/actions/favourites";
import { useRouter } from "next/navigation";

jest.mock("@/store/useAddFavoriteDialog");
jest.mock("@/actions/favourites");
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

const useRouterMock = useRouter as jest.MockedFunction<typeof useRouter>;
const mockedUseAddFavoriteDialog = useAddFavoriteDialog as unknown as jest.Mock;
const closeMock = jest.fn();
const routerRefreshMock = jest.fn();

global.fetch = jest.fn();

beforeEach(() => {
  jest.useFakeTimers();
  jest.clearAllMocks();
  (global.fetch as jest.Mock).mockReset();

  mockedUseAddFavoriteDialog.mockReturnValue({
    isOpen: true,
    close: closeMock,
  });

  useRouterMock.mockReturnValue({
    back: jest.fn(),
    forward: jest.fn(),
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    refresh: routerRefreshMock,
  });
});

afterEach(() => {
  jest.useRealTimers();
});

describe("AddFavoriteDialog", () => {
  it("renders dialog when open", () => {
    render(<AddFavoriteDialog />);
    expect(screen.getByText("Add New Favourite")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Search Location")).toBeInTheDocument();
  });

  it("closes dialog when cancel button or X is clicked", async () => {
    render(<AddFavoriteDialog />);

    await act(async () => {
      fireEvent.click(screen.getByText("Cancel"));
      jest.advanceTimersByTime(300);
    });
    await waitFor(() => {
      expect(closeMock).toHaveBeenCalledTimes(1);
    });

    const closeButton = screen.getByRole("button", { name: /close/i });
    await act(async () => {
      fireEvent.click(closeButton);
      jest.advanceTimersByTime(300);
    });
    await waitFor(() => {
      expect(closeMock).toHaveBeenCalledTimes(2);
    });
  });

  it("shows search results when typing in input", async () => {
    const mockResults = [
      { name: "London", lat: 51.5074, lon: -0.1278, country: "UK" },
    ];
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockResults,
    });

    render(<AddFavoriteDialog />);
    const input = screen.getByPlaceholderText("Search Location");

    await act(async () => {
      fireEvent.change(input, { target: { value: "Lon" } });
      jest.advanceTimersByTime(500);
    });

    await waitFor(() => {
      expect(screen.getByText("London, UK")).toBeInTheDocument();
    });
  });

  it("fills lat/lon when clicking search result", async () => {
    const mockResults = [
      { name: "Paris", lat: 48.8566, lon: 2.3522, country: "France" },
    ];
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockResults,
    });

    render(<AddFavoriteDialog />);
    const input = screen.getByPlaceholderText("Search Location");

    await act(async () => {
      fireEvent.change(input, { target: { value: "Par" } });
      jest.advanceTimersByTime(500);
    });

    await waitFor(() => screen.getByText("Paris, France"));

    await act(async () => {
      fireEvent.click(screen.getByText("Paris, France"));
    });

    expect(
      (screen.getByPlaceholderText("Latitude") as HTMLInputElement).value
    ).toBe("48.8566");
    expect(
      (screen.getByPlaceholderText("Longitude") as HTMLInputElement).value
    ).toBe("2.3522");
    expect(
      (screen.getByPlaceholderText("Search Location") as HTMLInputElement).value
    ).toBe("Paris, France");
  });

  it("submits the form", async () => {
    (actions.addFavourite as jest.Mock).mockResolvedValue({});

    render(<AddFavoriteDialog />);
    const nameInput = screen.getByPlaceholderText("Search Location");
    const latInput = screen.getByPlaceholderText("Latitude");
    const lonInput = screen.getByPlaceholderText("Longitude");

    await act(async () => {
      fireEvent.change(nameInput, { target: { value: "Test" } });
      fireEvent.change(latInput, { target: { value: 12.34 } });
      fireEvent.change(lonInput, { target: { value: 56.78 } });
    });

    await act(async () => {
      fireEvent.click(screen.getByText("Save"));
    });

    await waitFor(() => {
      expect(actions.addFavourite).toHaveBeenCalledWith({
        name: "Test",
        lat: 12.34,
        lon: 56.78,
      });
      expect(closeMock).toHaveBeenCalled();
      expect(routerRefreshMock).toHaveBeenCalled();
    });
  });

  it("shows validation errors", async () => {
    render(<AddFavoriteDialog />);

    await act(async () => {
      fireEvent.click(screen.getByText("Save"));
    });

    await waitFor(() => {
      expect(screen.getByText(/too short/i)).toBeInTheDocument();
    });
  });

  it("does not show results if API fails", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: false });

    render(<AddFavoriteDialog />);
    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText("Search Location"), {
        target: { value: "XYZ" },
      });
      jest.advanceTimersByTime(500);
    });

    await waitFor(() => {
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });
  });

  it("shows saving state while submitting", async () => {
    let resolveFn!: (value?: unknown) => void;
    (actions.addFavourite as jest.Mock).mockReturnValue(
      new Promise((resolve) => {
        resolveFn = resolve;
      })
    );

    render(<AddFavoriteDialog />);
    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText("Search Location"), {
        target: { value: "Test" },
      });
      fireEvent.change(screen.getByPlaceholderText("Latitude"), {
        target: { value: 1 },
      });
      fireEvent.change(screen.getByPlaceholderText("Longitude"), {
        target: { value: 2 },
      });
    });

    await act(async () => {
      fireEvent.click(screen.getByText("Save"));
    });

    expect(screen.getByText("Saving...")).toBeInTheDocument();

    await act(async () => {
      resolveFn!();
    });
  });
});
