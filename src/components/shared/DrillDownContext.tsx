"use client";

import { createContext, useContext, useMemo, useState } from "react";

export interface DrillDownState {
  isOpen: boolean;
  type: "position" | "stage" | "bu" | "contractor" | "studio" | null;
  id: string | null;
}

interface DrillDownContextValue {
  state: DrillDownState;
  previousState: DrillDownState | null;
  openDrillDown: (type: NonNullable<DrillDownState["type"]>, id: string) => void;
  closeDrillDown: () => void;
  goBack: () => void;
}

const DrillDownContext = createContext<DrillDownContextValue | null>(null);

export function DrillDownProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<DrillDownState>({
    isOpen: false,
    type: null,
    id: null,
  });
  const [previousState, setPreviousState] = useState<DrillDownState | null>(null);

  const value = useMemo<DrillDownContextValue>(
    () => ({
      state,
      previousState,
      openDrillDown: (type, id) => {
        // Save the currently-open panel before navigating to the new one
        setPreviousState(state.isOpen ? state : null);
        setState({ isOpen: true, type, id });
      },
      closeDrillDown: () => {
        setPreviousState(null);
        setState({ isOpen: false, type: null, id: null });
      },
      goBack: () => {
        setState(previousState ?? { isOpen: false, type: null, id: null });
        setPreviousState(null);
      },
    }),
    [state, previousState]
  );

  return <DrillDownContext.Provider value={value}>{children}</DrillDownContext.Provider>;
}

export function useDrillDown() {
  const context = useContext(DrillDownContext);
  if (!context) throw new Error("useDrillDown must be used within DrillDownProvider");
  return context;
}
