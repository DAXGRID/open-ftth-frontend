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
  TERMINAL_EQUIPMENT_CONNECTIVITY_VIEW_UPDATED,
  TerminalEquipmentConnectivityViewUpdatedResponse,
  TerminalEquipmentConnectivityViewUpdatedParams,
  Hop,
} from "./TerminalEquipmentGql";
import { useClient, useSubscription } from "urql";
import { connectivityViewQuery } from "./TerminalEquipmentGql";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { MapContext } from "../../contexts/MapContext";

interface ShowFiberEditor {
  show: boolean;
  faceKind: string | null;
  terminalId: string | null;
  side: "A" | "Z" | null;
  terminalEquipmentOrRackId: string | null;
}

interface ShowDisconnectFiberEditor {
  show: boolean;
  terminalId: string | null;
  connectedToSegmentId: string | null;
  routeNodeId: string | null;
}

interface ShowEditTerminalEquipment {
  show: boolean;
  terminalEquipmentId: string | null;
}

interface TerminalEquipmentState {
  connectivityView: TerminalEquipmentConnectivityView | null;
  showFreeLines: { [id: string]: boolean };
  showFiberEditor: ShowFiberEditor;
  showDisconnectFiberEditor: ShowDisconnectFiberEditor;
  showEditTerminalEquipment: ShowEditTerminalEquipment;
  connectivityTraceViews: {
    [id: string]: { show: boolean; view: ConnectivityTraceView };
  };
  selectedConnectivityTraceHop: Hop | null;
  editable: boolean;
  terminalEquipmentOrRackId: string;
  routeNodeId: string | null;
}

type TerminalEquipmentAction =
  | {
      type: "setRouteNodeId";
      id: string;
    }
  | {
      type: "setConnectivityView";
      view: TerminalEquipmentConnectivityView;
    }
  | { type: "setShowFreeLines"; id: string }
  | { type: "clearShowFreeLines" }
  | { type: "setShowFiberEditor"; show: ShowFiberEditor }
  | { type: "resetShowFiberEditor" }
  | { type: "setShowDisconnectFiberEditor"; show: ShowDisconnectFiberEditor }
  | { type: "resetShowDisconnectFiberEditor" }
  | { type: "setShowConnectivityTraceViews"; id: string }
  | { type: "setShowEditTerminalEquipment"; show: ShowEditTerminalEquipment }
  | { type: "resetShowEditTerminalEquipment" }
  | {
      type: "setViewConnectivityTraceViews";
      params: { id: string; view: ConnectivityTraceView };
    }
  | {
      type: "selectConnectivityTraceHop";
      hop: Hop;
    }
  | {
      type: "setEditable";
      editable: boolean;
    }
  | {
      type: "setTerminalEquipmentOrRackId";
      id: string;
    }
  | {
      type: "setTerminalEquipmentOrRackId";
      id: string;
    };

const defaultShowFiberEditorValues: ShowFiberEditor = {
  show: false,
  faceKind: null,
  terminalId: null,
  side: null,
  terminalEquipmentOrRackId: null,
};

const defaultShowDisconnectFiberEditor: ShowDisconnectFiberEditor = {
  show: false,
  terminalId: null,
  connectedToSegmentId: null,
  routeNodeId: null,
};

const defaultShowEditTerminalEquipment: ShowEditTerminalEquipment = {
  show: false,
  terminalEquipmentId: null,
};

const terminalEquipmentInitialState: TerminalEquipmentState = {
  connectivityView: null,
  showFreeLines: {},
  showFiberEditor: defaultShowFiberEditorValues,
  showEditTerminalEquipment: defaultShowEditTerminalEquipment,
  connectivityTraceViews: {},
  selectedConnectivityTraceHop: null,
  editable: false,
  terminalEquipmentOrRackId: "",
  showDisconnectFiberEditor: defaultShowDisconnectFiberEditor,
  routeNodeId: null,
};

function terminalEquipmentReducer(
  state: TerminalEquipmentState,
  action: TerminalEquipmentAction
): TerminalEquipmentState {
  switch (action.type) {
    case "setRouteNodeId":
      return { ...state, routeNodeId: action.id };
    case "setConnectivityView":
      return {
        ...state,
        connectivityView: action.view,
        connectivityTraceViews: {},
        showFiberEditor: defaultShowFiberEditorValues,
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
    case "clearShowFreeLines":
      return { ...state, showFreeLines: {} };
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
    case "resetShowFiberEditor":
      return { ...state, showFiberEditor: defaultShowFiberEditorValues };
    case "setShowDisconnectFiberEditor":
      return { ...state, showDisconnectFiberEditor: action.show };
    case "resetShowDisconnectFiberEditor":
      return {
        ...state,
        showDisconnectFiberEditor: defaultShowDisconnectFiberEditor,
      };
    case "setShowEditTerminalEquipment":
      return { ...state, showEditTerminalEquipment: action.show };
    case "resetShowEditTerminalEquipment":
      return {
        ...state,
        showEditTerminalEquipment: defaultShowEditTerminalEquipment,
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
    case "setEditable":
      return {
        ...state,
        editable: action.editable,
      };
    case "setTerminalEquipmentOrRackId":
      return {
        ...state,
        terminalEquipmentOrRackId: action.id,
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
  editable: boolean;
  children: ReactNode;
}

const TerminalEquipmentProvider = ({
  routeNodeId,
  terminalEquipmentOrRackId,
  editable,
  children,
}: TerminalEquipmentProviderProps) => {
  const { setTrace } = useContext(MapContext);
  const { t } = useTranslation();
  const client = useClient();
  const [state, dispatch] = useReducer(
    terminalEquipmentReducer,
    terminalEquipmentInitialState
  );

  const [connectiviyViewUpdatedResult] =
    useSubscription<TerminalEquipmentConnectivityViewUpdatedResponse>({
      query: TERMINAL_EQUIPMENT_CONNECTIVITY_VIEW_UPDATED,
      variables: {
        routeNodeId: routeNodeId,
        terminalEquipmentOrRackId: terminalEquipmentOrRackId,
      } as TerminalEquipmentConnectivityViewUpdatedParams,
      pause: !routeNodeId || !terminalEquipmentOrRackId,
    });

  useEffect(() => {
    dispatch({
      type: "setTerminalEquipmentOrRackId",
      id: terminalEquipmentOrRackId,
    });
  }, [terminalEquipmentOrRackId, dispatch]);

  useEffect(() => {
    dispatch({ type: "clearShowFreeLines" });
  }, [terminalEquipmentOrRackId, dispatch]);

  useEffect(() => {
    if (
      connectiviyViewUpdatedResult.data?.terminalEquipmentConnectivityUpdated
    ) {
      dispatch({
        type: "setConnectivityView",
        view: connectiviyViewUpdatedResult.data
          ?.terminalEquipmentConnectivityUpdated,
      });
      dispatch({
        type: "resetShowFiberEditor",
      });
    }
  }, [connectiviyViewUpdatedResult, dispatch]);

  useEffect(() => {
    dispatch({ type: "setEditable", editable: editable });
  }, [editable, dispatch]);

  useEffect(() => {
    if (!routeNodeId || !terminalEquipmentOrRackId) return;
    connectivityViewQuery(client, routeNodeId, terminalEquipmentOrRackId)
      .then((response) => {
        if (!response.data) return;
        dispatch({
          type: "setConnectivityView",
          view: response.data?.utilityNetwork.terminalEquipmentConnectivityView,
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

  useEffect(() => {
    if (!routeNodeId) return;
    dispatch({ type: "setRouteNodeId", id: routeNodeId });
  }, [routeNodeId, dispatch]);

  return (
    <TerminalEquipmentContext.Provider
      value={{ state: state, dispatch: dispatch }}
    >
      {children}
    </TerminalEquipmentContext.Provider>
  );
};

export { TerminalEquipmentContext, TerminalEquipmentProvider };
