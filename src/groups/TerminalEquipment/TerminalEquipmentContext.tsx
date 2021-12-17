import {
  createContext,
  useReducer,
  ReactNode,
  useEffect,
  useContext,
} from "react";
import {
  ConnectivityTraceView,
  connectivityTraceViewQuery,
  TerminalEquipmentConnectivityView,
  Hop,
} from "./TerminalEquipmentGql";
import { useClient } from "urql";
import { connectivityViewQuery } from "./TerminalEquipmentGql";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { MapContext } from "../../contexts/MapContext";

interface TerminalEquipmentState {
  connectivityView: TerminalEquipmentConnectivityView | null;
  showFreeLines: { [id: string]: boolean };
  showFiberEditor: boolean;
  connectivityTraceViews: {
    [id: string]: { show: boolean; view: ConnectivityTraceView };
  };
  selectedConnectivityTraceHop: Hop | null;
}

type TerminalEquipmentAction =
  | {
      type: "setConnectivityView";
      id: TerminalEquipmentConnectivityView;
    }
  | { type: "setShowFreeLines"; id: string }
  | { type: "setShowFiberEditor"; show: boolean }
  | { type: "setShowConnectivityTraceViews"; id: string }
  | {
      type: "setViewConnectivityTraceViews";
      params: { id: string; view: ConnectivityTraceView };
    }
  | {
      type: "selectConnectivityTraceHop";
      hop: Hop;
    };

const terminalEquipmentInitialState: TerminalEquipmentState = {
  connectivityView: null,
  showFreeLines: {},
  showFiberEditor: false,
  connectivityTraceViews: {},
  selectedConnectivityTraceHop: null,
};

function terminalEquipmentReducer(
  state: TerminalEquipmentState,
  action: TerminalEquipmentAction
): TerminalEquipmentState {
  switch (action.type) {
    case "setConnectivityView":
      return {
        ...state,
        connectivityView: action.id,
        connectivityTraceViews: {},
        showFreeLines: {},
        showFiberEditor: false,
        selectedConnectivityTraceHop: null,
      };
    case "setShowFreeLines":
      return {
        ...state,
        showFreeLines: {
          ...state.showFreeLines,
          [action.id]: !state.showFreeLines[action.id],
        },
      };
    case "setShowFiberEditor":
      return { ...state, showFiberEditor: action.show };
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
    default:
      throw new Error(`No action for ${action}`);
  }
}

interface TerminalEquipmentContextDefinition {
  state: TerminalEquipmentState;
  dispatch: React.Dispatch<TerminalEquipmentAction>;
}

const TerminalEquipmentContext =
  createContext<TerminalEquipmentContextDefinition>({
    state: terminalEquipmentInitialState,
    dispatch: () => {
      console.warn("No provider set for dispatch.");
    },
  });

interface TerminalEquipmentProviderProps {
  routeNodeId: string;
  terminalEquipmentOrRackId: string;
  children: ReactNode;
}

const TerminalEquipmentProvider = ({
  routeNodeId,
  terminalEquipmentOrRackId,
  children,
}: TerminalEquipmentProviderProps) => {
  const { setTrace } = useContext(MapContext);
  const { t } = useTranslation();
  const client = useClient();
  const [state, dispatch] = useReducer(
    terminalEquipmentReducer,
    terminalEquipmentInitialState
  );

  useEffect(() => {
    if (!routeNodeId || !terminalEquipmentOrRackId) return;
    connectivityViewQuery(client, routeNodeId, terminalEquipmentOrRackId)
      .then((response) => {
        if (!response.data) return;
        dispatch({
          type: "setConnectivityView",
          id: response.data?.utilityNetwork.terminalEquipmentConnectivityView,
        });
      })
      .catch(() => {
        toast.error(t("ERROR"));
      });
  }, [routeNodeId, terminalEquipmentOrRackId, client, dispatch, t]);

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
    <TerminalEquipmentContext.Provider
      value={{ state: state, dispatch: dispatch }}
    >
      {children}
    </TerminalEquipmentContext.Provider>
  );
};

export { TerminalEquipmentContext, TerminalEquipmentProvider };
