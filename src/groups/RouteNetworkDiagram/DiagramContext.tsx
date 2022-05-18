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
      map?.remove();
      setMap(null);
    };
  }, [map]);

  const reRender = useCallback(() => {
    if (map?.getContainer()) {
      document
        .getElementsByClassName("schematic-diagram-container")[0]
        .replaceWith(map.getContainer());
      map.resize();
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
