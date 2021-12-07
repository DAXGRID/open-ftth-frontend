import { useState, useContext, useCallback } from "react";
import { useClient } from "urql";
import { MapboxGeoJSONFeature } from "maplibre-gl";
import SchematicDiagram from "../SchematicDiagram";
import SpanEquipmentDetails from "../SpanEquipmentDetails";
import NodeContainerDetails from "../NodeContainerDetails";
import DiagramMenu from "../../../components/DiagramMenu";
import ActionButton from "../../../components/ActionButton";
import { MapContext } from "../../../contexts/MapContext";
import { EraserSvg } from "../../../assets";
import { useTranslation } from "react-i18next";
import FeatureInformation from "../FeatureInformation";
import TerminalEquipment from "../../TerminalEquipment";
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
  const [selectedFeature, setSelectedFeature] =
    useState<MapboxGeoJSONFeature | null>(null);
  const { t } = useTranslation();
  const client = useClient();

  const onSelectedFeature = useCallback(
    async (feature: MapboxGeoJSONFeature) => {
      const isSelected = feature.state?.selected as boolean;
      const featureType = feature.source;

      if (isSelected) {
        // If it can be traced otherwise we remove the current trace
        if (featureType === "InnerConduit" || featureType === "OuterConduit") {
          const spanSegmentTrace = await client
            .query<SpanSegmentTraceResponse>(SPAN_SEGMENT_TRACE, {
              spanSegmentId: feature.properties?.refId,
            })
            .toPromise();

          setTrace({
            geometries:
              spanSegmentTrace.data?.utilityNetwork.spanSegmentTrace
                .routeNetworkSegmentGeometries ?? [],
            ids:
              spanSegmentTrace.data?.utilityNetwork.spanSegmentTrace
                .routeNetworkSegmentIds ?? [],
          });
        } else {
          setTrace({ geometries: [], ids: [] });
        }
        setSelectedFeature(feature);
      } else {
        setTrace({ geometries: [], ids: [] });
        setSelectedFeature(null);
      }
    },
    [setTrace, setSelectedFeature, client]
  );

  const clearHighlights = () => {
    setTrace({ geometries: [], ids: [] });
  };

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
      />
      {selectedFeature?.source === "NodeContainer" && (
        <NodeContainerDetails
          nodeContainerMrid={selectedFeature.properties?.refId ?? ""}
          showActions={false}
        />
      )}
      {(selectedFeature?.source === "InnerConduit" ||
        selectedFeature?.source === "OuterConduit") && (
        <SpanEquipmentDetails
          spanEquipmentMrid={selectedFeature.properties?.refId ?? ""}
          showActions={false}
        />
      )}
      {(selectedFeature?.source === "Rack" ||
        selectedFeature?.source === "TerminalEquipment") && (
        <TerminalEquipment
          routeNodeId={identifiedFeature?.id ?? ""}
          terminalEquipmentOrRackId={selectedFeature.properties?.refId ?? ""}
        />
      )}
    </div>
  );
}

export default ReadOnlyDiagram;
