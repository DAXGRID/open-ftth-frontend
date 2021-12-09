import { createContext, ReactNode, useState } from "react";

type OverlayContextType = {
  showElement: (childElement: ReactNode) => void;
  overlayChild: ReactNode | null;
};

const OverlayContext = createContext<OverlayContextType>({
  showElement: () => {
    console.warn("No provider set for showModal");
  },
  overlayChild: null,
});

interface OverlayProviderProps {
  children: ReactNode;
}

const OverlayProvider = ({ children }: OverlayProviderProps) => {
  const [overlayChild, setOverlayChild] = useState<ReactNode | null>(null);

  return (
    <OverlayContext.Provider
      value={{
        showElement: setOverlayChild,
        overlayChild: overlayChild,
      }}
    >
      {children}
    </OverlayContext.Provider>
  );
};

export { OverlayContext, OverlayProvider };
