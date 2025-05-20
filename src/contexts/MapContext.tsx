import {
  createContext,
  ReactNode,
  useState,
  useEffect,
  useCallback,
} from "react";
import { v4 as uuidv4 } from "uuid";

type FeatureType = "RouteNode" | "RouteSegment" | "Deleted";

export type IdentifiedFeature = {
  id: string | null;
  type: FeatureType | null;
  extraMapInformation: {
    xCoordinate: number;
    yCoordinate: number;
    zoomLevel: number;
  } | null;
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
  isInSelectionMode: boolean;
  setIsInSelectionMode: (isInSelectionMode: boolean) => void;
  selectedSegmentIds: string[];
  setSelectedSegmentIds: (selectedSegments: string[]) => void;
  toggleSelectedSegmentId: (selectedSegment: string) => void;
  removeLastSelectedSegmentId: () => void;
  identifiedFeature: IdentifiedFeature | null;
  setIdentifiedFeature: (identifiedNetworkElement: IdentifiedFeature) => void;
  trace: Trace;
  setTrace: (trace: Trace) => void;
  searchResult: SearchResult | null;
  setSearchResult: (searchResult: SearchResult) => void;
  tilesetUpdated: (tilesetName: string) => void;
  subscribeTilesetUpdated: (callback: (tilesetName: string) => void) => string;
  unSubscribeTilesetUpdated: (token: string) => void;
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

function arraysEqual(a: any, b: any) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;

  for (var i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

const MapContext = createContext<MapContextType>({
  isInSelectionMode: false,
  setIsInSelectionMode: () => {
    console.warn("no provider set for setIsInSelectionMode");
  },
  selectedSegmentIds: [],
  setSelectedSegmentIds: () => {
    console.warn("no provider set for setSelectedSegmentIds");
  },
  identifiedFeature: { id: null, type: null, extraMapInformation: null },
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
  tilesetUpdated: () => {
    console.warn("no provider set for tilesetUpdated");
  },
  subscribeTilesetUpdated: () => {
    console.warn("no provider set for subscribeTilesetUpdated");
    return "";
  },
  unSubscribeTilesetUpdated: () => {
    console.warn("no provider set for unSubscribeTilesetUpdated");
  },
  toggleSelectedSegmentId: () => {
    console.warn("no provider set for addSelectedSegmentId");
  },
  removeLastSelectedSegmentId: () => {
    console.warn("no provider set for removeLastSelectedSegmentId");
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
  const [subscribeTilesetUpdated, setSubscriptionTileSetUpdated] = useState<
    Record<string, (tilesetName: string) => void>
  >({});
  const [isInSelectionMode, setIsInSelectionMode] = useState<boolean>(false);

  useEffect(() => {
    if (!searchResult) return;
    if (searchResult?.objectType === "routeNode") {
      setIdentifiedNetworkElement({
        id: searchResult.id,
        type: "RouteNode",
        extraMapInformation: null,
      });
    }
  }, [searchResult]);

  const toggleSelectedSegmentId = useCallback(
    (segmentId: string) => {
      setSelectedSegments((prevSelectedSegments) => {
        const indexAlreadyExist = prevSelectedSegments.indexOf(segmentId);
        if (indexAlreadyExist === -1) {
          return [...prevSelectedSegments, segmentId];
        } else {
          prevSelectedSegments.splice(indexAlreadyExist, 1);
          return [...prevSelectedSegments];
        }
      });
    },
    [setSelectedSegments],
  );

  const removeLastSelectedSegmentId = useCallback(() => {
    setSelectedSegments((prevSelectedSegments) => {
      prevSelectedSegments.pop();
      return [...prevSelectedSegments];
    });
  }, [setSelectedSegments]);

  function tileSetUpdated(tilesetName: string) {
    Object.entries(subscribeTilesetUpdated).forEach((x) => x[1](tilesetName));
  }

  const setSelectedSegmentsx = useCallback(
    (newSelectedSegments: string[]) => {
      setSelectedSegments((prevSelectedSegments) => {
        // This is done to prevent updating the value in case they're the same, since
        // it might result in a for-ever loop.
        if (!arraysEqual(prevSelectedSegments, newSelectedSegments)) {
          return newSelectedSegments;
        }

        return prevSelectedSegments;
      });
    },
    [setSelectedSegments],
  );

  return (
    <MapContext.Provider
      value={{
        selectedSegmentIds: selectedSegments,
        setIsInSelectionMode: setIsInSelectionMode,
        setSelectedSegmentIds: setSelectedSegmentsx,
        isInSelectionMode: isInSelectionMode,
        toggleSelectedSegmentId: toggleSelectedSegmentId,
        removeLastSelectedSegmentId: removeLastSelectedSegmentId,
        identifiedFeature: identifiedNetworkElement,
        setIdentifiedFeature: setIdentifiedNetworkElement,
        trace: trace,
        setTrace: setTrace,
        searchResult: searchResult,
        setSearchResult: setSearchResult,
        tilesetUpdated: tileSetUpdated,
        subscribeTilesetUpdated: (callback: (tilesetName: string) => void) => {
          const token = uuidv4();
          setSubscriptionTileSetUpdated((callbacks) => {
            callbacks[token] = callback;
            return callbacks;
          });

          return token;
        },
        unSubscribeTilesetUpdated: (token: string) => {
          setSubscriptionTileSetUpdated((callbacks) => {
            delete callbacks[token];
            return callbacks;
          });
        },
      }}
    >
      {children}
    </MapContext.Provider>
  );
};

export { MapContext, MapProvider };
