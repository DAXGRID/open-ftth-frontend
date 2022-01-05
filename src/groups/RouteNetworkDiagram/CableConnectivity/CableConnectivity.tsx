import { useContext } from "react";
import { useTranslation } from "react-i18next";
import {
  CableConnectivityContext,
  CableConnectivityProvider,
} from "./CableConnectivityContext";
import CableConnectivityTraceView from "./CableConnectivityTraceView";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronRight,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";

function CableConnectivityRow() {
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
                id: "7597e290-f0b1-4091-a629-646d88cd4176",
              })
            }
          >
            <FontAwesomeIcon
              icon={
                state.connectivityTraceViews[
                  "7597e290-f0b1-4091-a629-646d88cd4176"
                ]?.show ?? false
                  ? faChevronDown
                  : faChevronRight
              }
            />
          </span>
          <p> GALAH ODF 1-3-1 WDM 1-4 OLT-1-1-1</p>
        </div>
        <div className="cable-connectivity-row-item">
          <p>LISA Soem 1</p>
        </div>
        <div className="cable-connectivity-row-item">
          <p>2</p>
        </div>
        <div className="cable-connectivity-row-item">
          <p>1</p>
        </div>
        <div className="cable-connectivity-row-item">
          <p>1</p>
        </div>
        <div className="cable-connectivity-row-item">
          <p>Splitter 1 (1:32) Ind 1</p>
        </div>
        <div className="cable-connectivity-row-item">
          <p>sdfsdfs</p>
        </div>
      </div>
      <CableConnectivityTraceView
        view={
          state.connectivityTraceViews["7597e290-f0b1-4091-a629-646d88cd4176"]
        }
      />
    </>
  );
}

function CableConnectivity() {
  const { t } = useTranslation();

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
              <p>{t("NO")}</p>
            </div>
            <div className="cable-connectivity-row-item">
              <p>{t("TUBE")}</p>
            </div>
            <div className="cable-connectivity-row-item">
              <p>{t("FIBER")}</p>
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
          <CableConnectivityRow />
          <CableConnectivityRow />
          <CableConnectivityRow />
          <CableConnectivityRow />
          <CableConnectivityRow />
          <CableConnectivityRow />
        </div>
      </div>
    </div>
  );
}

interface CableConnectivityWrapperProps {
  routeNodeId: string;
  spanEquipmentId: string;
}

function CableConnectivityWrapper({
  routeNodeId,
  spanEquipmentId,
}: CableConnectivityWrapperProps) {
  return (
    <CableConnectivityProvider
      routeNodeId={routeNodeId}
      spanEquipmentId={spanEquipmentId}
    >
      <CableConnectivity />
    </CableConnectivityProvider>
  );
}

export default CableConnectivityWrapper;
