import { createContext, useReducer, ReactNode, useEffect } from "react";
import { TerminalEquipmentConnectivityView } from "./TerminalEquipmentGql";
import { useClient } from "urql";
import { connectivityViewQuery } from "./TerminalEquipmentGql";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

interface TerminalEquipmentState {
  connectivityView: TerminalEquipmentConnectivityView | null;
  showFreeLines: { [id: string]: boolean };
  showFiberEditor: boolean;
  showConnectivityTraceViews: { [id: string]: boolean };
}

type TerminalEquipmentAction =
  | {
      type: "setConnectivityView";
      id: TerminalEquipmentConnectivityView;
    }
  | { type: "setShowFreeLines"; id: string }
  | { type: "setShowFiberEditor"; show: boolean }
  | { type: "setShowConnectivityTraceViews"; id: string };

const terminalEquipmentInitialState: TerminalEquipmentState = {
  connectivityView: null,
  showFreeLines: {},
  showFiberEditor: false,
  showConnectivityTraceViews: {},
};

function terminalEquipmentReducer(
  state: TerminalEquipmentState,
  action: TerminalEquipmentAction
): TerminalEquipmentState {
  switch (action.type) {
    case "setConnectivityView":
      return { ...state, connectivityView: action.id };
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
        showConnectivityTraceViews: {
          ...state.showConnectivityTraceViews,
          [action.id]: !state.showConnectivityTraceViews[action.id],
        },
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

  return (
    <TerminalEquipmentContext.Provider
      value={{ state: state, dispatch: dispatch }}
    >
      {children}
    </TerminalEquipmentContext.Provider>
  );
};

export { TerminalEquipmentContext, TerminalEquipmentProvider };
