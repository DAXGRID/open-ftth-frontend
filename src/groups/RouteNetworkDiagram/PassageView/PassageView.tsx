import { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useClient } from "urql";
import { EditPropertiesSvg, MoveConduitSvg, PlusSvg } from "../../../assets";
import ActionButton from "../../../components/ActionButton";
import ModalContainer from "../../../components/ModalContainer";
import { MapContext } from "../../../contexts/MapContext";
import { OverlayContext } from "../../../contexts/OverlayContext";
import EditSpanEquipment from "../EditSpanEquipment";
import RerouteSpanEquipment from "../RerouteSpanEquipment";
import useBridgeConnector from "../../../bridge/useBridgeConnector";
import {
  Line,
  passageViewQuery,
  SpanEquipmentPassageView,
} from "./PassageViewGql";

interface SelectableLine extends Line {
  selected: boolean;
}

interface PassageViewProps {
  routeElementId: string;
  spanEquipmentOrSegmentIds: string;
  editable: boolean;
}

function PassageView({
  routeElementId,
  spanEquipmentOrSegmentIds,
  editable,
}: PassageViewProps) {
  const { t } = useTranslation();
  const { showElement } = useContext(OverlayContext);
  const client = useClient();
  const { setTrace } = useContext(MapContext);
  const [passageView, setPassageView] =
    useState<SpanEquipmentPassageView | null>(null);
  const [selectedLineIndex, setSelectedLineIndex] = useState<number | null>(
    null
  );
  const [showEditSpanEquipment, setShowEditSpanEquipment] = useState(false);
  const [showRerouteTube, setShowRerouteTube] = useState(false);
  const { selectRouteSegments } = useBridgeConnector();

  useEffect(() => {
    let isSubscribed = true;

    if (!routeElementId || !spanEquipmentOrSegmentIds) return;
    passageViewQuery(client, routeElementId, [spanEquipmentOrSegmentIds])
      .then((response) => {
        if (isSubscribed) {
          const view = response.data?.utilityNetwork.spanEquipmentPassageView;
          if (view) {
            setPassageView(view);
          } else {
            throw Error("Could not load SpanEquipmentPassageView");
          }
        }
      })
      .catch(() => {
        if (isSubscribed) {
          console.error("PassageViewQuery failed.");
        }
      });

    return () => {
      isSubscribed = false;
    };
  }, [client, routeElementId, spanEquipmentOrSegmentIds]);

  useEffect(() => {
    if (showRerouteTube) {
      showElement(
        <ModalContainer
          title={t("REROUTE_SPAN_EQUIPMENT")}
          closeCallback={() => setShowRerouteTube(false)}
        >
          <RerouteSpanEquipment
            selectedRouteSegmentMrid={spanEquipmentOrSegmentIds ?? ""}
          />
        </ModalContainer>
      );
    } else if (showEditSpanEquipment) {
      showElement(
        <ModalContainer
          title={t("EDIT_SPAN_EQUIPMENT")}
          closeCallback={() => setShowEditSpanEquipment(false)}
        >
          <EditSpanEquipment
            spanEquipmentMrid={spanEquipmentOrSegmentIds ?? ""}
          />
        </ModalContainer>
      );
    } else {
      showElement(null);
    }
  }, [
    showRerouteTube,
    showEditSpanEquipment,
    t,
    showElement,
    spanEquipmentOrSegmentIds,
  ]);

  if (!passageView || passageView.spanEquipments.length === 0) {
    return <div style={{ height: "200" }}></div>;
  }

  const selectAllLineSegmentsInMap = () => {
    selectRouteSegments(spanEquipment.lines.flatMap((x) => x.routeSegmentIds));
    setTrace({ geometries: [], ids: [], etrs89: null, wgs84: null });
  };

  const selectLine = (line: SelectableLine, index: number) => {
    setSelectedLineIndex(index);
    setTrace({
      geometries: line.routeSegmentGeometries,
      ids: line.routeSegmentIds,
      etrs89: null,
      wgs84: null,
    });
  };

  const spanEquipment = passageView.spanEquipments[0];

  return (
    <div className="passage-view">
      <div className="passage-view-container">
        <div className="passage-view-row-title-header">
          <div className="passage-view-row-title-header-info">
            <p className="passage-view_title">{spanEquipment.name}</p>
            <p className="passage-view_title">{spanEquipment.specName}</p>
            <p className="passage-view_title">{spanEquipment.info}</p>
          </div>
          <div className="passage-view-row-title-header-actions">
            {editable && (
              <>
                <ActionButton
                  action={() => setShowRerouteTube(true)}
                  icon={MoveConduitSvg}
                  title={t("MOVE")}
                  key={0}
                />
                <ActionButton
                  action={() => setShowEditSpanEquipment(true)}
                  icon={EditPropertiesSvg}
                  title={t("EDIT")}
                  key={1}
                />
                <ActionButton
                  action={() => selectAllLineSegmentsInMap()}
                  icon={PlusSvg}
                  title={t("SELECT")}
                  key={2}
                />
              </>
            )}
          </div>
        </div>
        <div className="passage-view-row-header">
          <div className="passage-view-row passage-view-grid-size">
            <div className="passage-view-row-item">
              <p>{t("FROM")}</p>
            </div>
            <div className="passage-view-row-item">
              <p>{t("TO")}</p>
            </div>
            <div className="passage-view-row-item">
              <p>{t("CONDUIT_ID")}</p>
            </div>
            <div className="passage-view-row-item">
              <p>{t("OUTER_CONDUIT")}</p>
            </div>
            <div className="passage-view-row-item">
              <p>{t("INNER_CONDUIT")}</p>
            </div>
            <div className="passage-view-row-item">
              <p>{t("LENGTH_UNITS")}</p>
            </div>
            <div className="passage-view-row-item">
              <p>{t("DISTANCE_UNITS")}</p>
            </div>
          </div>
        </div>
        <div className="passage-view-row-body">
          {(spanEquipment.lines as SelectableLine[]).map((x, i) => {
            return (
              <div
                className={`passage-view-row passage-view-grid-size ${
                  selectedLineIndex === i ? "passage-view-row--selected" : ""
                }`}
                key={i}
                onClick={() => {
                  selectLine(x, i);
                }}
              >
                <div className="passage-view-row-item">
                  <p>{x.from}</p>
                </div>
                <div className="passage-view-row-item">
                  <p>{x.to}</p>
                </div>
                <div className="passage-view-row-item">
                  <p>{x.conduitId}</p>
                </div>
                <div className="passage-view-row-item">
                  <p>{x.outerConduitInfo}</p>
                </div>
                <div className="passage-view-row-item">
                  <p>{x.innerConduitInfo}</p>
                </div>
                <div className="passage-view-row-item">
                  <p>{x.segmentLength}</p>
                </div>
                <div className="passage-view-row-item">
                  <p>{x.cumulativeDistance}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default PassageView;
