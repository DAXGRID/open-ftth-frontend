import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { ConnectivityTraceView } from "./TerminalEquipmentGql";
import { TerminalEquipmentContext } from "./TerminalEquipmentContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlassLocation } from "@fortawesome/free-solid-svg-icons";

interface TraceViewProps {
  view: { view: ConnectivityTraceView | null; show: boolean };
}

function TerminalEquipmentTraceView({ view }: TraceViewProps) {
  const { t } = useTranslation();
  const { state, dispatch } = useContext(TerminalEquipmentContext);

  if (!view || !view.show || !view.view) return <></>;

  return (
    <div className="terminal-equipment-trace-view">
      <div className="trace-view-title-header">
        <div className="trace-view-title">
          {`${t("CIRCUIT_NAME")}: ${view.view?.circuitName ?? ""}`}
        </div>
        <div className="trace-view-actions">
          <div
            className="trace-view-actions-action"
            onClick={() =>
              dispatch({
                type: "selectConnectivityTraceHops",
                hops: view.view?.hops ?? [],
                envelope: view.view?.envelope ?? null,
              })
            }
          >
            <FontAwesomeIcon icon={faMagnifyingGlassLocation} />
          </div>
        </div>
      </div>
      <div className="trace-view-header trace-view-grid">
        <div className="trace-view-header-item">{t("NODE")}</div>
        <div className="trace-view-header-item">{t("EQUIPMENT")}</div>
        <div className="trace-view-header-item">{t("TERMINAL_STRUCTURE")}</div>
        <div className="trace-view-header-item">{t("TERMINAL")}</div>
        <div className="trace-view-header-item">{t("CONNECTION_INFO")}</div>
        <div className="trace-view-header-item">{t("LENGTH_UNITS")}</div>
      </div>
      <div className="trace-view-body ">
        {view.view?.hops.map((x, i) => {
          return (
            <div
              key={i}
              className={`trace-view-body-row trace-view-grid ${
                state.selectedConnectivityTraceHops?.find((y) => y === x)
                  ? "trace-view-body-row--selected"
                  : ""
              }`}
              onClick={() =>
                dispatch({
                  type: "selectConnectivityTraceHops",
                  hops: [x],
                  envelope: null,
                })
              }
            >
              <div className="trace-view-body-item">
                {`${"->".repeat(x.level)} ${x.node ?? ""}`}
              </div>
              <div className="trace-view-body-item">{x.equipment ?? ""}</div>
              <div className="trace-view-body-item">
                {x.terminalStructure ?? ""}
              </div>
              <div className="trace-view-body-item">{x.terminal ?? ""}</div>
              <div className="trace-view-body-item">
                {x.connectionInfo ?? ""}
              </div>
              <div className="trace-view-body-item">{x.totalLength ?? ""}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default TerminalEquipmentTraceView;
