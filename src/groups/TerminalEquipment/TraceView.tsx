import { useTranslation } from "react-i18next";
import { ConnectivityTraceView } from "./TerminalEquipmentGql";

interface TraceViewProps {
  view: { view: ConnectivityTraceView | null; show: boolean };
}

function TraceView({ view }: TraceViewProps) {
  const { t } = useTranslation();

  if (!view || !view.show) return <></>;

  return (
    <div className="trace-view">
      <div className="trace-view-title">
        {`${t("CIRCUIT_NAME")}: ${view.view?.circuitName}`}
      </div>
      <div className="trace-view-header trace-view-grid">
        <div className="trace-view-header-item">{t("NODE")}</div>
        <div className="trace-view-header-item">{t("EQUIPMENT")}</div>
        <div className="trace-view-header-item">{t("TERMINAL_STRUCTURE")}</div>
        <div className="trace-view-header-item">{t("TERMINAL")}</div>
        <div className="trace-view-header-item">{t("CONNECTION_INFO")}</div>
        <div className="trace-view-header-item">{t("TOTAL_LENGTH")}</div>
      </div>
      <div className="trace-view-body ">
        {view.view?.hops.map((x) => {
          return (
            <div className="trace-view-body-row trace-view-grid">
              <div className="trace-view-body-item">{x.node}</div>
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

export default TraceView;
