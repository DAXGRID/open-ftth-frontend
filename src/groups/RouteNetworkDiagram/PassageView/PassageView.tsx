import { useEffect, useState, useContext } from "react";
import { useClient } from "urql";
import { useTranslation } from "react-i18next";
import {
  passageViewQuery,
  SpanEquipmentPassageView,
  Line,
} from "./PassageViewGqp";
import { MapContext } from "../../../contexts/MapContext";

interface PassageViewProps {
  routeElementId: string;
  spanEquipmentOrSegmentIds: string;
}

interface SelectableLine extends Line {
  selected: boolean;
}

function PassageView({
  routeElementId,
  spanEquipmentOrSegmentIds,
}: PassageViewProps) {
  const { t } = useTranslation();
  const client = useClient();
  const { setTrace } = useContext(MapContext);
  const [passageView, setPassageView] =
    useState<SpanEquipmentPassageView | null>(null);
  const [selectedLineIndex, setSelectedLineIndex] = useState<number | null>(
    null
  );

  useEffect(() => {
    if (!routeElementId || !spanEquipmentOrSegmentIds) return;
    passageViewQuery(client, routeElementId, [spanEquipmentOrSegmentIds]).then(
      (response) => {
        const view = response.data?.utilityNetwork.spanEquipmentPassageView;
        if (view) setPassageView(view);
        else throw Error("Could not load SpanEquipmentPassageView");
      }
    );
  }, [client, routeElementId, spanEquipmentOrSegmentIds]);

  if (!passageView || passageView.spanEquipments.length === 0) {
    return <div style={{ height: "300px" }}></div>;
  }

  const selectLine = (line: SelectableLine, index: number) => {
    setSelectedLineIndex(index);
    setTrace({
      geometries: line.routeSegmentGeometries,
      ids: line.routeSegmentIds,
    });
  };

  const spanEquipment = passageView.spanEquipments[0];

  return (
    <div className="passage-view">
      <div className="passage-view-container">
        <p className="passage-view_title">{spanEquipment.name}</p>
        <p className="passage-view_title">{spanEquipment.specName}</p>
        <p className="passage-view_title">{spanEquipment.info}</p>
        <div className="passage-view-row-header">
          <div className="passage-view-row">
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
              <p>{t("LENGTH")}</p>
            </div>
            <div className="passage-view-row-item">
              <p>{t("DISTANCE")}</p>
            </div>
          </div>
        </div>
        <div className="passage-view-row-body">
          {(spanEquipment.lines as SelectableLine[]).map((x, i) => {
            return (
              <div
                className={`passage-view-row ${
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
