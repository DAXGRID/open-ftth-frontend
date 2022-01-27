import { useContext } from "react";
import { useTranslation } from "react-i18next";
import {
  CableConnectivityContext,
  CableConnectivityProvider,
} from "./CableConnectivityContext";
import CableConnectivityTraceView from "./CableConnectivityTraceView";
import { Line } from "./CableConnectivityGql";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronRight,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";

interface CableConnectivityRowProps {
  line: Line;
}

function CableConnectivityRow({ line }: CableConnectivityRowProps) {
  const { dispatch, state } = useContext(CableConnectivityContext);

  return (
    <>
      <div className="cable-connectivity-row">
        <div className="cable-connectivity-row-item">
          <span
            className="cable-connectivity-row-item__icon"
            onClick={() =>
              dispatch({
                type: "setShowConnectivityTraceViews",
                id: line.spanSegmentId,
              })
            }
          >
            <FontAwesomeIcon
              icon={
                state.connectivityTraceViews[line.spanSegmentId]?.show ?? false
                  ? faChevronDown
                  : faChevronRight
              }
            />
          </span>
          <p>{line.a.end}</p>
        </div>
        <div className="cable-connectivity-row-item">
          <p>{line.a.connectedTo}</p>
        </div>
        <div className="cable-connectivity-row-item">
          <p>{line.sequenceNumber}</p>
        </div>
        <div className="cable-connectivity-row-item">
          <p>{line.name}</p>
        </div>
        <div className="cable-connectivity-row-item">
          <p>{line.z.connectedto}</p>
        </div>
        <div className="cable-connectivity-row-item">
          <p>{line.z.end}</p>
        </div>
      </div>
      <CableConnectivityTraceView
        view={state.connectivityTraceViews[line.spanSegmentId]}
      />
    </>
  );
}

function CableConnectivity() {
  const { t } = useTranslation();
  const { state } = useContext(CableConnectivityContext);

  return (
    <div className="cable-connectivity">
      <div className="cable-connectivity-container">
        <p className="cable-connectivity__title">K123456789</p>
        <p className="cable-connectivity__title">12 Fiber</p>
        <div className="cable-connectivity-header">
          <div className="cable-connectivity-row">
            <div className="cable-connectivity-row-item">
              <p>{t("A-INFO")}</p>
            </div>
            <div className="cable-connectivity-row-item">
              <p>{t("FROM")}</p>
            </div>
            <div className="cable-connectivity-row-item">
              <p>{t("NUMBER")}</p>
            </div>
            <div className="cable-connectivity-row-item">
              <p>{t("NAME")}</p>
            </div>
            <div className="cable-connectivity-row-item">
              <p>{t("TO")}</p>
            </div>
            <div className="cable-connectivity-row-item">
              <p>{t("Z-INFO")}</p>
            </div>
          </div>
        </div>
        <div className="cable-connectivity-body">
          {state.connectivityView?.spanEquipments[0].lines.map((x) => {
            return (
              <CableConnectivityRow
                line={x}
                key={x.spanSegmentId}
              ></CableConnectivityRow>
            );
          })}
        </div>
      </div>
    </div>
  );
}

interface CableConnectivityWrapperProps {
  routeNetworkElementId: string;
  spanEquipmentId: string;
}

function CableConnectivityWrapper({
  routeNetworkElementId,
  spanEquipmentId,
}: CableConnectivityWrapperProps) {
  return (
    <CableConnectivityProvider
      routeNodeId={routeNetworkElementId}
      spanEquipmentId={spanEquipmentId}
    >
      <CableConnectivity />
    </CableConnectivityProvider>
  );
}

export default CableConnectivityWrapper;
