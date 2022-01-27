import {
  createContext,
  ReactNode,
  useReducer,
  useEffect,
  useContext,
} from "react";
import { useClient } from "urql";
import {
  connectivityTraceViewQuery,
  ConnectivityTraceView,
  Hop,
  spanEquipmentConnectivityViewQuery,
  SpanEquipmentConnectivityView,
} from "./ConnectivityViewGql";
import { MapContext } from "../../../contexts/MapContext";

interface ConnectivityViewState {
  connectivityTraceViews: {
    [id: string]: { show: boolean; view: ConnectivityTraceView };
  };
  selectedConnectivityTraceHop: Hop | null;
  connectivityView: SpanEquipmentConnectivityView | null;
}

type ConnectivityViewAction =
  | {
      type: "setViewConnectivityTraceViews";
      params: { id: string; view: ConnectivityTraceView };
    }
  | {
      type: "selectConnectivityTraceHop";
      hop: Hop;
    }
  | {
      type: "setShowConnectivityTraceViews";
      id: string;
    }
  | {
      type: "setSpanEquipmentConnectivityView";
      view: SpanEquipmentConnectivityView;
    };

function connectivityViewReducer(
  state: ConnectivityViewState,
  action: ConnectivityViewAction
): ConnectivityViewState {
  switch (action.type) {
    case "setViewConnectivityTraceViews":
      return {
        ...state,
        connectivityTraceViews: {
          ...state.connectivityTraceViews,
          [action.params.id]: {
            ...state.connectivityTraceViews[action.params.id],
            view: action.params.view,
          },
        },
      };
    case "selectConnectivityTraceHop":
      return {
        ...state,
        selectedConnectivityTraceHop: action.hop,
      };
    case "setShowConnectivityTraceViews":
      return {
        ...state,
        connectivityTraceViews: {
          ...state.connectivityTraceViews,
          [action.id]: {
            ...state.connectivityTraceViews[action.id],
            show: !state.connectivityTraceViews[action.id]?.show,
          },
        },
      };
    case "setSpanEquipmentConnectivityView":
      return {
        ...state,
        connectivityView: action.view,
      };
    default:
      throw new Error(`No action for ${action}`);
  }
}

interface ConnectivityViewContextDefintion {
  state: ConnectivityViewState;
  dispatch: React.Dispatch<ConnectivityViewAction>;
}

const initialState: ConnectivityViewState = {
  connectivityTraceViews: {},
  selectedConnectivityTraceHop: null,
  connectivityView: null,
};

const ConnectivityViewContext = createContext<ConnectivityViewContextDefintion>(
  {
    state: initialState,
    dispatch: () => {
      console.warn("No provider set for dispatch.");
    },
  }
);

interface ConnectivityViewProviderProps {
  routeNodeId: string;
  spanEquipmentId: string;
  children: ReactNode;
}

function ConnectivityViewProvider({
  routeNodeId,
  spanEquipmentId,
  children,
}: ConnectivityViewProviderProps) {
  const [state, dispatch] = useReducer(connectivityViewReducer, initialState);
  const client = useClient();
  const { setTrace } = useContext(MapContext);

  useEffect(() => {
    if (!spanEquipmentId || !routeNodeId) return;
    spanEquipmentConnectivityViewQuery(client, routeNodeId, [
      spanEquipmentId,
    ]).then((response) => {
      const view = response.data?.utilityNetwork.spanEquipmentConnectivityView;
      if (view) {
        dispatch({ type: "setSpanEquipmentConnectivityView", view: view });
      } else {
        throw Error("Could not load SpanEquipmentConnectivity view.");
      }
    });
  }, [client, dispatch, spanEquipmentId, routeNodeId]);

  useEffect(() => {
    const notLoaded = Object.entries(state.connectivityTraceViews).filter(
      (x) => x[1].show && !x[1].view
    );

    notLoaded.forEach((x) => {
      connectivityTraceViewQuery(client, routeNodeId, x[0]).then((response) => {
        const view = response.data?.utilityNetwork.connectivityTraceView;
        if (view) {
          dispatch({
            type: "setViewConnectivityTraceViews",
            params: { id: x[0], view: view },
          });
        } else {
          throw Error("Could not load connectivity trace view.");
        }
      });
    });
  }, [state.connectivityTraceViews, dispatch, client, routeNodeId]);

  useEffect(() => {
    if (!state.selectedConnectivityTraceHop) return;
    const { routeSegmentIds, routeSegmentGeometries } =
      state.selectedConnectivityTraceHop;
    setTrace({
      ids: routeSegmentIds,
      geometries: routeSegmentGeometries,
    });
  }, [state.selectedConnectivityTraceHop, setTrace]);

  return (
    <ConnectivityViewContext.Provider
      value={{ dispatch: dispatch, state: state }}
    >
      {children}
    </ConnectivityViewContext.Provider>
  );
}

export { ConnectivityViewContext, ConnectivityViewProvider };
