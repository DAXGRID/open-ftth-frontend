import { createContext, ReactNode, useState, useEffect } from "react";

type FeatureType = "RouteNode" | "RouteSegment" | "Deleted";

type IdentifiedFeature = {
  id: string | null;
  type: FeatureType | null;
};

export interface SearchResult {
  id: string;
  objectType: string;
  xwgs: number;
  ywgs: number;
  xetrs: number;
  yetrs: number;
}

type MapContextType = {
  selectedSegmentIds: string[];
  setSelectedSegmentIds: (selectedSegments: string[]) => void;
  identifiedFeature: IdentifiedFeature | null;
  setIdentifiedFeature: (identifiedNetworkElement: IdentifiedFeature) => void;
  traceRouteNetworkId: string;
  setTraceRouteNetworkId: (routeNetworkId: string) => void;
  searchResult: SearchResult | null;
  setSearchResult: (searchResult: SearchResult) => void;
};

const MapContext = createContext<MapContextType>({
  selectedSegmentIds: [],
  setSelectedSegmentIds: () => {
    console.warn("no provider set for setSelectedSegmentIds");
  },
  identifiedFeature: { id: null, type: null },
  setIdentifiedFeature: () => {
    console.warn("no provider set for setIdentifiedFeature");
  },
  traceRouteNetworkId: "",
  setTraceRouteNetworkId: () => {
    console.warn("no provider set for setTraceRouteNetwork");
  },
  searchResult: null,
  setSearchResult: () => {
    console.warn("no provider set for setSearchResult");
  },
});

type MapProviderProps = {
  children: ReactNode;
};

const MapProvider = ({ children }: MapProviderProps) => {
  const [selectedSegments, setSelectedSegments] = useState<string[]>([]);
  const [identifiedNetworkElement, setIdentifiedNetworkElement] =
    useState<IdentifiedFeature | null>(null);
  const [traceRouteNetworkId, setTraceRouteNetworkId] = useState<string>("");
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);

  useEffect(() => {
    if (!searchResult) return;
    if (searchResult?.objectType === "routeNode") {
      setIdentifiedNetworkElement({ id: searchResult.id, type: "RouteNode" });
    }
  }, [searchResult]);

  return (
    <MapContext.Provider
      value={{
        selectedSegmentIds: selectedSegments,
        setSelectedSegmentIds: setSelectedSegments,
        identifiedFeature: identifiedNetworkElement,
        setIdentifiedFeature: setIdentifiedNetworkElement,
        traceRouteNetworkId: traceRouteNetworkId,
        setTraceRouteNetworkId: setTraceRouteNetworkId,
        searchResult: searchResult,
        setSearchResult: setSearchResult,
      }}
    >
      {children}
    </MapContext.Provider>
  );
};

export { MapContext, MapProvider };
