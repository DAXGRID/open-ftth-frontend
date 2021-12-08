import { createContext, ReactNode, useState } from "react";

type OverlayContextType = {
  showElement: (childElement: ReactNode) => void;
  hideModal: () => void;
  overlayChild: ReactNode | null;
};

const OverlayContext = createContext<OverlayContextType>({
  showElement: () => {
    console.warn("No provider set for showModal");
  },
  hideModal: () => {
    console.warn("No provider set for hideModal");
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
        showElement: (childElement) => {
          setOverlayChild(childElement);
        },
        hideModal: () => setOverlayChild(null),
        overlayChild: overlayChild,
      }}
    >
      {children}
    </OverlayContext.Provider>
  );
};

export { OverlayContext, OverlayProvider };
