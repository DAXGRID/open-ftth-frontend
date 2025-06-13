import {
  createContext,
  ReactNode,
  useState,
  useEffect,
  useCallback,
} from "react";
import { v4 as uuidv4 } from "uuid";
import { useClient } from "urql";
import { shortestPathBetweenSegments } from "./MapContextGql";

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
  appendSegmentSelection: (selectedSegment: string) => void;
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
  isLoading: boolean;
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
  isLoading: false,
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
  appendSegmentSelection: () => {
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
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [clickedSegments, setClickedSegments] = useState<{
    start: string | null;
    end: string | null;
  }>({ start: null, end: null });

  const client = useClient();

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

  const appendSegmentSelection = useCallback(
    (segmentId: string) => {
      setClickedSegments((prevClickedSegments) => {
        if (
          prevClickedSegments.start !== null &&
          prevClickedSegments.end !== null
        ) {
          return { ...prevClickedSegments, end: segmentId };
        } else if (
          prevClickedSegments.start &&
          prevClickedSegments.end === null
        ) {
          return { start: prevClickedSegments.start, end: segmentId };
        } else {
          return { start: segmentId, end: null };
        }
      });
    },
    [setClickedSegments],
  );

  const clearSelection = useCallback(() => {
    setSelectedSegments((prevSelectedSegments) => {
      return [];
    });

    setClickedSegments({ start: null, end: null });
  }, [setSelectedSegments, setClickedSegments]);

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

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (clickedSegments.start === null && clickedSegments.end === null) {
      return;
    }

    if (clickedSegments.start !== null && clickedSegments.end === null) {
      setSelectedSegmentsx([clickedSegments.start]);
      return;
    }

    setIsLoading(true);

    shortestPathBetweenSegments(
      client,
      clickedSegments.start,
      clickedSegments.end,
    )
      .then((data) => {
        if (data.data?.routeNetwork?.shortestPathBetweenSegments) {
          setSelectedSegmentsx(
            data.data.routeNetwork.shortestPathBetweenSegments,
          );
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [clickedSegments, client, setSelectedSegmentsx, setIsLoading]);

  return (
    <MapContext.Provider
      value={{
        selectedSegmentIds: selectedSegments,
        setIsInSelectionMode: setIsInSelectionMode,
        setSelectedSegmentIds: setSelectedSegmentsx,
        isInSelectionMode: isInSelectionMode,
        appendSegmentSelection: appendSegmentSelection,
        clearSelection: clearSelection,
        identifiedFeature: identifiedNetworkElement,
        setIdentifiedFeature: setIdentifiedNetworkElement,
        trace: trace,
        isLoading: isLoading,
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
