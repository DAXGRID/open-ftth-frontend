import { createContext, ReactNode, useState, useEffect } from "react";

type FeatureType = "RouteNode" | "RouteSegment" | "Deleted";

export type IdentifiedFeature = {
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
  trace: Trace;
  setTrace: (trace: Trace) => void;
  searchResult: SearchResult | null;
  setSearchResult: (searchResult: SearchResult) => void;
};

type Trace = {
  ids: string[];
  geometries: string[];
  wgs84: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  } | null;
  etrs89: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  } | null;
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
  trace: {
    geometries: [],
    ids: [],
    etrs89: null,
    wgs84: null,
  },
  setTrace: () => {
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
  const [trace, setTrace] = useState<Trace>({
    geometries: [],
    ids: [],
    etrs89: null,
    wgs84: null,
  });
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
        trace: trace,
        setTrace: setTrace,
        searchResult: searchResult,
        setSearchResult: setSearchResult,
      }}
    >
      {children}
    </MapContext.Provider>
  );
};

export { MapContext, MapProvider };
