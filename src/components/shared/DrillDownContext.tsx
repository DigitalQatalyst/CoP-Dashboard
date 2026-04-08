"use client";

import { createContext, useContext, useMemo, useState } from "react";

export interface DrillDownState {
  isOpen: boolean;
  type: "position" | "stage" | "bu" | "contractor" | "studio" | null;
  id: string | null;
}

interface DrillDownContextValue {
  state: DrillDownState;
  openDrillDown: (type: NonNullable<DrillDownState["type"]>, id: string) => void;
  closeDrillDown: () => void;
}

const DrillDownContext = createContext<DrillDownContextValue | null>(null);

export function DrillDownProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<DrillDownState>({
    isOpen: false,
    type: null,
    id: null,
  });

  const value = useMemo<DrillDownContextValue>(
    () => ({
      state,
      openDrillDown: (type, id) => setState({ isOpen: true, type, id }),
      closeDrillDown: () => setState({ isOpen: false, type: null, id: null }),
    }),
    [state]
  );

  return <DrillDownContext.Provider value={value}>{children}</DrillDownContext.Provider>;
}

export function useDrillDown() {
  const context = useContext(DrillDownContext);
  if (!context) throw new Error("useDrillDown must be used within DrillDownProvider");
  return context;
}
