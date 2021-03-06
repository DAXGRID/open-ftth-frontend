import { createContext, ReactNode, useState } from "react";

type MapContextType = {
  selectedSegmentIds: string[];
  setSelectedSegmentIds: (selectedSegments: string[]) => void;
  identifiedFeatureId: string | undefined;
  setIdentifiedFeatureId: (identifiedNetworkElement: string) => void;
};

const MapContext = createContext<MapContextType>({
  selectedSegmentIds: [],
  setSelectedSegmentIds: () => {
    console.warn("no provider set");
  },
  identifiedFeatureId: "",
  setIdentifiedFeatureId: () => {
    console.warn("no provider set");
  },
});

type MapProviderProps = {
  children: ReactNode;
};

const MapProvider = ({ children }: MapProviderProps) => {
  const [selectedSegments, setSelectedSegments] = useState<string[]>([]);
  const [identifiedNetworkElement, setIdentifiedNetworkElement] = useState<
    string | undefined
  >();

  return (
    <MapContext.Provider
      value={{
        selectedSegmentIds: selectedSegments,
        setSelectedSegmentIds: setSelectedSegments,
        identifiedFeatureId: identifiedNetworkElement,
        setIdentifiedFeatureId: setIdentifiedNetworkElement,
      }}
    >
      {children}
    </MapContext.Provider>
  );
};

export { MapContext, MapProvider };
