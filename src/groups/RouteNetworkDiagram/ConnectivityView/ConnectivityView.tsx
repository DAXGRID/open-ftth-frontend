import { useContext } from "react";
import { useTranslation } from "react-i18next";
import {
  ConnectivityViewContext,
  ConnectivityViewProvider,
} from "./ConnectivityViewContext";
import ConnectivityViewTraceView from "./ConnectivityViewTraceView";
import { Line } from "./ConnectivityViewGql";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronRight,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";
import ColorCodedElement from "../../ColorCodedElement";
import { TFunction } from "i18next";

interface ConnectivityViewRowProps {
  line: Line;
  isCable: boolean;
  t: TFunction;
}

function ConnectivityViewRow({ line, isCable, t }: ConnectivityViewRowProps) {
  const { dispatch, state } = useContext(ConnectivityViewContext);

  return (
    <>
      <div className="connectivity-view-row">
        <div className="connectivity-view-row-item">
          {isCable && (
            <span
              className="connectivity-view-row-item__icon"
              onClick={() =>
                dispatch({
                  type: "setShowConnectivityTraceViews",
                  id: line.spanSegmentId,
                })
              }
            >
              <FontAwesomeIcon
                icon={
                  (state.connectivityTraceViews[line.spanSegmentId]?.show ??
                  false)
                    ? faChevronDown
                    : faChevronRight
                }
              />
            </span>
          )}
          <p>{line.a.end}</p>
        </div>
        <div className="connectivity-view-row-item">
          <p>{line.a.connectedTo}</p>
        </div>
        <div className="connectivity-view-row-item">
          <p>{line.sequenceNumber}</p>
        </div>
        <div className="connectivity-view-row-item">
          <p>{ColorCodedElement(line.name, t)}</p>
        </div>
        <div className="connectivity-view-row-item">
          <p>{line.z.connectedto}</p>
        </div>
        <div className="connectivity-view-row-item">
          <p>{line.z.end}</p>
        </div>
      </div>
      <ConnectivityViewTraceView
        view={state.connectivityTraceViews[line.spanSegmentId]}
      />
    </>
  );
}

function ConnectivityView() {
  const { t } = useTranslation();
  const { state } = useContext(ConnectivityViewContext);

  if (
    !state.connectivityView ||
    state.connectivityView.spanEquipments.length === 0
  )
    return <div style={{ height: "300px" }}></div>;

  const spanEquipment = state.connectivityView?.spanEquipments[0];

  return (
    <div className="connectivity-view">
      <div className="connectivity-view-container">
        <p className="connectivity-view__title">{spanEquipment.name}</p>
        <p className="connectivity-view__title">{spanEquipment.specName}</p>
        <p className="connectivity-view__title">{spanEquipment.info}</p>
        <div className="connectivity-view-header">
          <div className="connectivity-view-row">
            <div className="connectivity-view-row-item">
              <p>{t("A-INFO")}</p>
            </div>
            <div className="connectivity-view-row-item">
              <p>{t("FROM")}</p>
            </div>
            <div className="connectivity-view-row-item">
              <p>{t("NUMBER")}</p>
            </div>
            <div className="connectivity-view-row-item">
              <p>{t("NAME")}</p>
            </div>
            <div className="connectivity-view-row-item">
              <p>{t("TO")}</p>
            </div>
            <div className="connectivity-view-row-item">
              <p>{t("Z-INFO")}</p>
            </div>
          </div>
        </div>
        <div className="connectivity-view-body">
          {state.connectivityView?.spanEquipments[0].lines.map((x) => {
            return (
              <ConnectivityViewRow
                isCable={spanEquipment.isCable}
                line={x}
                key={x.spanSegmentId}
              ></ConnectivityViewRow>
            );
          })}
        </div>
      </div>
    </div>
  );
}

interface ConnectivityViewWrapperProps {
  routeNetworkElementId: string;
  spanEquipmentId: string;
}

function ConnectivityViewWrapper({
  routeNetworkElementId,
  spanEquipmentId,
}: ConnectivityViewWrapperProps) {
  return (
    <ConnectivityViewProvider
      routeNodeId={routeNetworkElementId}
      spanEquipmentId={spanEquipmentId}
    >
      <ConnectivityView />
    </ConnectivityViewProvider>
  );
}

export default ConnectivityViewWrapper;
