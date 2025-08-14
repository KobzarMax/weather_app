import { create } from "zustand";

interface AlarmPanelState {
  openPanels: Record<string, boolean>;
  toggle: (locationId: string) => void;
}

export const useAlarmPanel = create<AlarmPanelState>((set) => ({
  openPanels: {},
  toggle: (locationId) =>
    set((state) => ({
      openPanels: {
        ...state.openPanels,
        [locationId]: !state.openPanels[locationId],
      },
    })),
}));
