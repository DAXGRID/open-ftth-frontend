// This is an annoying hack to fix issue with webkit based browers wanting you to reuse webgl-contexts.

import {
  createContext,
  useState,
  ReactNode,
  useCallback,
  useEffect,
} from "react";
import { Map } from "maplibre-gl";

const LOCAL_STORAGE_ENABLE_TRACE_PAN = "enabled_trace_pan";

interface DiagramContextType {
  map: Map | null;
  setMap: (map: Map) => void;
  enabledTracePan: boolean;
  setEnabledTracePan: (zoom: boolean) => void;
  reRender: () => void;
}

const DiagramContext = createContext<DiagramContextType>({
  map: null,
  setMap: () => {
    console.warn("no provider set for setMap");
  },
  enabledTracePan: false,
  setEnabledTracePan: () => {
    console.warn("no provider set for setAutomaticZoom");
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
  const [enabledTracePan, setEnabledTracePan] = useState<boolean>(() => {
    return JSON.parse(
      localStorage.getItem(LOCAL_STORAGE_ENABLE_TRACE_PAN) ?? "true"
    );
  });

  useEffect(() => {
    localStorage.setItem(
      LOCAL_STORAGE_ENABLE_TRACE_PAN,
      JSON.stringify(enabledTracePan)
    );
  }, [enabledTracePan]);

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
        enabledTracePan: enabledTracePan,
        setEnabledTracePan: setEnabledTracePan,
        reRender: reRender,
      }}
    >
      {children}
    </DiagramContext.Provider>
  );
};

export { DiagramContext, DiagramProvider };
