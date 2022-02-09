import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { ConnectivityTraceView } from "./ConnectivityViewGql";
import { ConnectivityViewContext } from "./ConnectivityViewContext";

interface TraceViewProps {
  view: { view: ConnectivityTraceView | null; show: boolean };
}

function ConnectivityViewTraceView({ view }: TraceViewProps) {
  const { t } = useTranslation();
  const { state, dispatch } = useContext(ConnectivityViewContext);

  if (!view || !view.show || !view.view) return <></>;

  return (
    <div className="connectivity-view-trace-view">
      <div className="trace-view-title">
        {`${t("CIRCUIT_NAME")}: ${view.view?.circuitName ?? ""}`}
      </div>
      <div className="trace-view-header trace-view-grid">
        <div className="trace-view-header-item">{t("NODE")}</div>
        <div className="trace-view-header-item">{t("EQUIPMENT")}</div>
        <div className="trace-view-header-item">{t("TERMINAL_STRUCTURE")}</div>
        <div className="trace-view-header-item">{t("TERMINAL")}</div>
        <div className="trace-view-header-item">{t("CONNECTION_INFO")}</div>
        <div className="trace-view-header-item">{t("LENGTH")}</div>
      </div>
      <div className="trace-view-body ">
        {view.view?.hops.map((x) => {
          return (
            <div
              key={x.hopSeqNo}
              className={`trace-view-body-row trace-view-grid ${
                state.selectedConnectivityTraceHop === x
                  ? "trace-view-body-row--selected"
                  : ""
              }`}
              onClick={() =>
                dispatch({ type: "selectConnectivityTraceHop", hop: x })
              }
            >
              <div className="trace-view-body-item">
                {`${"->".repeat(x.level)} ${x.node}`}
              </div>
              <div className="trace-view-body-item">{x.equipment}</div>
              <div className="trace-view-body-item">{x.terminalStructure}</div>
              <div className="trace-view-body-item">{x.terminal}</div>
              <div className="trace-view-body-item">{x.connectionInfo}</div>
              <div className="trace-view-body-item">{x.totalLength}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ConnectivityViewTraceView;
