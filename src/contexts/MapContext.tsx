import { createContext, ReactNode, useState } from "react";

type FeatureType = "RouteNode" | "RouteSegment";

type IdentifiedFeature = {
  id: string | null;
  type: FeatureType | null;
};

type MapContextType = {
  selectedSegmentIds: string[];
  setSelectedSegmentIds: (selectedSegments: string[]) => void;
  identifiedFeature: IdentifiedFeature | null;
  setIdentifiedFeature: (identifiedNetworkElement: IdentifiedFeature) => void;
};

const MapContext = createContext<MapContextType>({
  selectedSegmentIds: [],
  setSelectedSegmentIds: () => {
    console.warn("no provider set");
  },
  identifiedFeature: { id: null, type: null },
  setIdentifiedFeature: () => {
    console.warn("no provider set");
  },
});

type MapProviderProps = {
  children: ReactNode;
};

const MapProvider = ({ children }: MapProviderProps) => {
  const [selectedSegments, setSelectedSegments] = useState<string[]>([]);
  const [
    identifiedNetworkElement,
    setIdentifiedNetworkElement,
  ] = useState<IdentifiedFeature | null>(null);

  return (
    <MapContext.Provider
      value={{
        selectedSegmentIds: selectedSegments,
        setSelectedSegmentIds: setSelectedSegments,
        identifiedFeature: identifiedNetworkElement,
        setIdentifiedFeature: setIdentifiedNetworkElement,
      }}
    >
      {children}
    </MapContext.Provider>
  );
};

export { MapContext, MapProvider };
