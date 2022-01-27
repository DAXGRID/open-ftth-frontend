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

  if (!passageView || passageView.spanEquipments.length === 0) return <></>;

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
            <p>{t("FROM")}</p>
            <p>{t("TO")}</p>
            <p>{t("CONDUIT_ID")}</p>
            <p>{t("OUTER_CONDUIT")}</p>
            <p>{t("INNER_CONDUIT")}</p>
            <p>{t("LENGTH")}</p>
            <p>{t("DISTANCE")}</p>
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
                <p>{x.from}</p>
                <p>{x.to}</p>
                <p>{x.conduitId}</p>
                <p>{x.outerConduitInfo}</p>
                <p>{x.innerConduitInfo}</p>
                <p>{x.segmentLength}</p>
                <p>{x.cumulativeDistance}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default PassageView;
