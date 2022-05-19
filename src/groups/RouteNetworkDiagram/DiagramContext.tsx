// This is an annoying hack to fix issue with webkit based browers wanting you to reuse webgl-contexts.

import {
  createContext,
  useState,
  ReactNode,
  useCallback,
  useEffect,
} from "react";
import { Map } from "maplibre-gl";

interface DiagramContextType {
  map: Map | null;
  setMap: (map: Map) => void;
  reRender: () => void;
}

const DiagramContext = createContext<DiagramContextType>({
  map: null,
  setMap: () => {
    console.warn("no provider set for setMap");
  },
  reRender: () => {
    console.warn("no provider set for reRender");
  },
});

interface DiagramProviderProps {
  children: ReactNode;
}

const DiagramProvider = ({ children }: DiagramProviderProps) => {
  const [map, setMap] = useState<Map | null>(null);

  useEffect(() => {
    if (!map) return;
    return () => {
      if (map !== null) {
        map?.remove();
        setMap(null);
      }
    };
  }, [map]);

  const reRender = useCallback(() => {
    if (!map) {
      throw Error("Map is null.");
    }

    const containerId = "schematic-diagram-container";
    const previousContainer = map.getContainer();

    if (previousContainer) {
      const container = document.getElementById(containerId);
      if (container) {
        container.replaceWith(previousContainer);
        map.resize();
      } else {
        throw Error(`Could not find container with id: ${containerId}`);
      }
    }
  }, [map]);

  return (
    <DiagramContext.Provider
      value={{
        map: map,
        setMap: setMap,
        reRender: reRender,
      }}
    >
      {children}
    </DiagramContext.Provider>
  );
};

export { DiagramContext, DiagramProvider };
