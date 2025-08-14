import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";

jest.mock("@/store/useAddFavoriteDialog", () => ({
  useAddFavoriteDialog: jest.fn(),
}));

import { useAddFavoriteDialog } from "@/store/useAddFavoriteDialog";
import { AddFavoriteButton } from "../AddFavoriteButton";

const mockedUseAddFavoriteDialog = useAddFavoriteDialog as jest.MockedFunction<
  typeof useAddFavoriteDialog
>;

describe("AddFavoriteButton", () => {
  it("renders with correct text", () => {
    mockedUseAddFavoriteDialog.mockReturnValue(() => {});

    render(<AddFavoriteButton />);
    expect(
      screen.getByRole("button", { name: /add favorite location/i })
    ).toBeInTheDocument();
  });

  it("calls open when clicked", () => {
    const mockOpen = jest.fn();
    mockedUseAddFavoriteDialog.mockReturnValue(mockOpen);

    render(<AddFavoriteButton />);
    fireEvent.click(
      screen.getByRole("button", { name: /add favorite location/i })
    );

    expect(mockOpen).toHaveBeenCalledTimes(1);
  });
});
