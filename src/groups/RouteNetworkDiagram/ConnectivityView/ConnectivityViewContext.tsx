import React, {
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
  Envelope,
} from "./ConnectivityViewGql";
import { MapContext } from "../../../contexts/MapContext";
import { OverlayContext } from "../../../contexts/OverlayContext";
import EditTags from "../../TerminalEquipment/EditTags";
import ModalContainer from "../../../components/ModalContainer";
import { useTranslation } from "react-i18next";

interface ShowEditTags {
  show: boolean;
  terminalOrSpanSegmentIds: string[];
  equipmentId: string;
}

interface ConnectivityViewState {
  connectivityTraceViews: {
    [id: string]: {
      show: boolean;
      view: ConnectivityTraceView;
      aId: string;
      zId: string;
    };
  };
  selectedConnectivityTraceHops: Hop[] | null;
  selectedEnvelope: Envelope | null;
  connectivityView: SpanEquipmentConnectivityView | null;
  showEditTags: ShowEditTags | null;
}

type ConnectivityViewAction =
  | {
      type: "setViewConnectivityTraceViews";
      params: {
        id: string;
        view: ConnectivityTraceView;
        aId: string;
        zId: string;
      };
    }
  | {
      type: "selectConnectivityTraceHops";
      hops: Hop[];
      envelope: Envelope | null;
    }
  | {
      type: "setShowConnectivityTraceViews";
      id: string;
    }
  | {
      type: "setSpanEquipmentConnectivityView";
      view: SpanEquipmentConnectivityView;
    }
  | {
      type: "setShowEditTags";
      view: ShowEditTags;
    }
  | {
      type: "resetShowEditTags";
    };

function connectivityViewReducer(
  state: ConnectivityViewState,
  action: ConnectivityViewAction,
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
    case "selectConnectivityTraceHops":
      return {
        ...state,
        selectedConnectivityTraceHops: [...action.hops],
        selectedEnvelope:
          action.envelope !== null ? { ...action.envelope } : null,
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
    case "setShowEditTags":
      return {
        ...state,
        showEditTags: action.view,
      };
    case "resetShowEditTags":
      return {
        ...state,
        showEditTags: null,
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
  selectedConnectivityTraceHops: null,
  selectedEnvelope: null,
  connectivityView: null,
  showEditTags: null,
};

const ConnectivityViewContext = createContext<ConnectivityViewContextDefintion>(
  {
    state: initialState,
    dispatch: () => {
      console.warn("No provider set for dispatch.");
    },
  },
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
  const { t } = useTranslation();
  const [state, dispatch] = useReducer(connectivityViewReducer, initialState);
  const client = useClient();
  const { setTrace } = useContext(MapContext);
  const { showElement } = useContext(OverlayContext);

  useEffect(() => {
    if (state.showEditTags?.show) {
      showElement(
        <ModalContainer
          maxWidth="1200px"
          title={t("EDIT_TAGS")}
          closeCallback={() => dispatch({ type: "resetShowEditTags" })}
        >
          <EditTags
            terminalOrSpanSegmentIds={
              state.showEditTags.terminalOrSpanSegmentIds
            }
            terminalOrSpanEquipmentId={
              state.showEditTags.terminalOrSpanEquipmentId
            }
            equipmentId={state.showEditTags.equipmentId}
          />
        </ModalContainer>,
      );
    } else {
      showElement(null);
    }
  }, [state.showEditTags, showElement]);

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
      (x) => x[1].show && !x[1].view,
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
    if (!state.selectedConnectivityTraceHops) return;

    const routeSegmentIds = state.selectedConnectivityTraceHops.flatMap(
      (x) => x.routeSegmentIds,
    );
    const routeSegmentGeometries = state.selectedConnectivityTraceHops.flatMap(
      (x) => x.routeSegmentGeometries,
    );

    setTrace({
      ids: routeSegmentIds,
      geometries: routeSegmentGeometries,
      etrs89:
        state.selectedEnvelope !== null
          ? {
              minX: state.selectedEnvelope.eTRS89MinX,
              minY: state.selectedEnvelope.eTRS89MinY,
              maxX: state.selectedEnvelope.eTRS89MaxX,
              maxY: state.selectedEnvelope.eTRS89MaxY,
            }
          : null,
      wgs84:
        state.selectedEnvelope !== null
          ? {
              minX: state.selectedEnvelope.wGS84MinX,
              minY: state.selectedEnvelope.wGS84MinY,
              maxX: state.selectedEnvelope.wGS84MaxX,
              maxY: state.selectedEnvelope.wGS84MaxY,
            }
          : null,
    });
  }, [state.selectedConnectivityTraceHops, state.selectedEnvelope, setTrace]);

  return (
    <ConnectivityViewContext.Provider
      value={{ dispatch: dispatch, state: state }}
    >
      {children}
    </ConnectivityViewContext.Provider>
  );
}

export { ConnectivityViewContext, ConnectivityViewProvider };
