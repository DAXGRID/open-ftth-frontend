import { useState, useContext, useCallback } from "react";
import { useClient } from "urql";
import { MapboxGeoJSONFeature } from "maplibre-gl";
import SchematicDiagram from "../SchematicDiagram";
import NodeContainerDetails from "../NodeContainerDetails";
import DiagramMenu from "../../../components/DiagramMenu";
import ActionButton from "../../../components/ActionButton";
import { MapContext } from "../../../contexts/MapContext";
import { EraserSvg } from "../../../assets";
import { useTranslation } from "react-i18next";
import FeatureInformation from "../FeatureInformation";
import TerminalEquipment from "../../TerminalEquipment";
import ConnectivityView from "../ConnectivityView";
import PassageView from "../PassageView";
import TabView from "../../../components/TabView";
import {
  SPAN_SEGMENT_TRACE,
  SpanSegmentTraceResponse,
} from "./ReadOnlyDiagramGql";

interface Envelope {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

interface Geometry {
  type: string;
  coordinates: string;
}

interface Diagram {
  refId?: string;
  refClass?: string;
  style: string;
  label?: string;
  geometry: Geometry;
  drawingOrder: number;
}

type RouteSegmentDiagramProps = {
  diagramObjects: Diagram[];
  envelope: Envelope;
};

function ReadOnlyDiagram({
  diagramObjects,
  envelope,
}: RouteSegmentDiagramProps) {
  const { setTrace, identifiedFeature } = useContext(MapContext);
  const { t } = useTranslation();
  const client = useClient();
  const [selectedFeature, setSelectedFeature] =
    useState<MapboxGeoJSONFeature | null>(null);
  const [
    spanEquipmentTabViewSelectedId,
    setSpanEquipmentCableTabViewSelectedId,
  ] = useState("0");

  const clearHighlights = useCallback(() => {
    setTrace({ geometries: [], ids: [], etrs89: null, wgs84: null });
  }, [setTrace]);

  const onSelectedFeature = useCallback(
    async (feature: MapboxGeoJSONFeature) => {
      const isSelected = feature.state?.selected as boolean;
      const featureType = feature.source;

      if (isSelected) {
        // If it can be traced otherwise we remove the current trace
        if (
          featureType === "InnerConduit" ||
          featureType === "OuterConduit" ||
          featureType === "FiberCable"
        ) {
          const spanSegmentTrace = await client
            .query<SpanSegmentTraceResponse>(SPAN_SEGMENT_TRACE, {
              spanSegmentIds: [feature.properties?.refId],
            })
            .toPromise();

          const trace = spanSegmentTrace.data?.utilityNetwork.spanSegmentTrace;

          if (trace) {
            setTrace({
              geometries: trace.routeNetworkSegmentGeometries ?? [],
              ids: trace.routeNetworkSegmentIds ?? [],
              etrs89: {
                maxX: trace.etrs89MaxX,
                maxY: trace.etrs89MaxY,
                minX: trace.etrs89MinX,
                minY: trace.etrs89MinY,
              },
              wgs84: {
                maxX: trace.wgs84MaxX,
                maxY: trace.wgs84MaxY,
                minX: trace.wgs84MinX,
                minY: trace.wgs84MinY,
              },
            });
          } else {
            clearHighlights();
          }
        } else {
          clearHighlights();
        }
        setSelectedFeature(feature);
      } else {
        clearHighlights();
        setSelectedFeature(null);
      }
    },
    [setTrace, setSelectedFeature, clearHighlights, client]
  );

  return (
    <div>
      <FeatureInformation />
      <DiagramMenu>
        <ActionButton
          icon={EraserSvg}
          action={() => clearHighlights()}
          title={t("CLEAR_HIGHLIGHT")}
        />
      </DiagramMenu>
      <SchematicDiagram
        diagramObjects={diagramObjects}
        editMode={false}
        envelope={envelope}
        onSelectFeature={onSelectedFeature}
        routeElementId={identifiedFeature?.id ?? ""}
      />
      {selectedFeature?.source === "NodeContainer" && (
        <NodeContainerDetails
          nodeContainerMrid={selectedFeature.properties?.refId ?? ""}
          showActions={false}
        />
      )}
      {(selectedFeature?.source === "Rack" ||
        selectedFeature?.source === "TerminalEquipment") && (
        <div className="container-max-size container-center">
          <TabView
            select={() => {}}
            key="0"
            selectedId="0"
            views={[
              {
                title: t("CONNECTIVITY"),
                id: "0",
                view: (
                  <TerminalEquipment
                    routeNodeId={identifiedFeature?.id ?? ""}
                    terminalEquipmentOrRackId={
                      selectedFeature.properties?.refId ?? ""
                    }
                    editable={false}
                  />
                ),
              },
            ]}
          ></TabView>
        </div>
      )}
      {(selectedFeature?.source === "FiberCable" ||
        selectedFeature?.source.includes("Conduit")) && (
        <div className="container-max-size container-center">
          <TabView
            selectedId={spanEquipmentTabViewSelectedId}
            select={setSpanEquipmentCableTabViewSelectedId}
            views={[
              {
                title: t("PASSAGE_VIEW"),
                view: (
                  <PassageView
                    editable={false}
                    routeElementId={identifiedFeature?.id ?? ""}
                    spanEquipmentOrSegmentIds={
                      selectedFeature.properties?.refId ?? ""
                    }
                  />
                ),
                id: "0",
              },
              {
                title: t("CONNECTIVITY"),
                view: (
                  <ConnectivityView
                    routeNetworkElementId={identifiedFeature?.id ?? ""}
                    spanEquipmentId={selectedFeature.properties?.refId ?? ""}
                  />
                ),
                id: "1",
              },
            ]}
          />
        </div>
      )}
    </div>
  );
}

export default ReadOnlyDiagram;
