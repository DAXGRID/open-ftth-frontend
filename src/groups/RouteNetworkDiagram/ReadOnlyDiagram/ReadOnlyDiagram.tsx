import { useState, useContext, useCallback, useEffect } from "react";
import { useClient } from "urql";
import { MapGeoJSONFeature } from "maplibre-gl";
import SchematicDiagram from "../SchematicDiagram";
import NodeContainerDetails from "../NodeContainerDetails";
import DiagramMenu from "../../../components/DiagramMenu";
import ActionButton from "../../../components/ActionButton";
import ToggleButton from "../../../components/ToggleButton";
import { MapContext } from "../../../contexts/MapContext";
import { EraserSvg, ZoomMapSvg } from "../../../assets";
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
    useState<MapGeoJSONFeature | null>(null);
  const [
    spanEquipmentTabViewSelectedId,
    setSpanEquipmentCableTabViewSelectedId,
  ] = useState("0");
  const [enabledTracePan, setEnabledTracePan] = useState<boolean>(true);

  const clearHighlights = useCallback(() => {
    setTrace({ geometries: [], ids: [], etrs89: null, wgs84: null });
  }, [setTrace]);

  // Trace
  useEffect(() => {
    if (!selectedFeature) {
      clearHighlights();
      return;
    }

    const featureType = selectedFeature.source;

    if (
      featureType === "InnerConduit" ||
      featureType === "OuterConduit" ||
      featureType === "FiberCable"
    ) {
      client
        .query<SpanSegmentTraceResponse>(SPAN_SEGMENT_TRACE, {
          spanSegmentIds: [selectedFeature.properties?.refId],
        })
        .toPromise()
        .then((spanSegmentTrace) => {
          const trace = spanSegmentTrace.data?.utilityNetwork.spanSegmentTrace;
          if (trace) {
            setTrace({
              geometries: trace.routeNetworkSegmentGeometries ?? [],
              ids: trace.routeNetworkSegmentIds ?? [],
              etrs89: enabledTracePan
                ? {
                    maxX: trace.etrs89MaxX,
                    maxY: trace.etrs89MaxY,
                    minX: trace.etrs89MinX,
                    minY: trace.etrs89MinY,
                  }
                : null,
              wgs84: enabledTracePan
                ? {
                    maxX: trace.wgs84MaxX,
                    maxY: trace.wgs84MaxY,
                    minX: trace.wgs84MinX,
                    minY: trace.wgs84MinY,
                  }
                : null,
            });
          } else {
            clearHighlights();
          }
        });
    } else {
      clearHighlights();
    }
  }, [selectedFeature, setTrace, enabledTracePan, client, clearHighlights]);

  const onSelectedFeature = useCallback(
    async (feature: MapGeoJSONFeature) => {
      const isSelected = feature.state?.selected as boolean;

      if (isSelected) {
        // If it can be traced otherwise we remove the current trace
        setSelectedFeature(feature);
      } else {
        setSelectedFeature(null);
      }
    },
    [setSelectedFeature]
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
        <ToggleButton
          toggled={enabledTracePan}
          id={"0"}
          toggle={() => setEnabledTracePan(!enabledTracePan)}
          icon={ZoomMapSvg}
          title={t("TOGGLE_AUTOMATIC_ZOOM_MAP")}
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
