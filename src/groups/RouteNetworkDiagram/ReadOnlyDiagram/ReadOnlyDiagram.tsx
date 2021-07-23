import { useState, useContext, useCallback } from "react";
import { MapboxGeoJSONFeature } from "mapbox-gl";
import SchematicDiagram from "../SchematicDiagram";
import SpanEquipmentDetails from "../SpanEquipmentDetails";
import NodeContainerDetails from "../NodeContainerDetails";
import DiagramMenu from "../../../components/DiagramMenu";
import ActionButton from "../../../components/ActionButton";
import { MapContext } from "../../../contexts/MapContext";
import { EraserSvg } from "../../../assets";
import { useTranslation } from "react-i18next";
import FeatureInformation from "../FeatureInformation";

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
  const { setTraceRouteNetworkId } = useContext(MapContext);
  const [selectedFeature, setSelectedFeature] =
    useState<MapboxGeoJSONFeature | null>(null);
  const { t } = useTranslation();

  const onSelectedFeature = useCallback(
    (feature: MapboxGeoJSONFeature) => {
      const isSelected = feature.state?.selected as boolean;
      const featureType = feature.source;

      if (isSelected) {
        // If it can be traced otherwise we remove the current trace
        if (featureType === "InnerConduit" || featureType === "OuterConduit") {
          setTraceRouteNetworkId(feature.properties?.refId ?? "");
        } else {
          setTraceRouteNetworkId("");
        }
        setSelectedFeature(feature);
      } else {
        setTraceRouteNetworkId("");
        setSelectedFeature(null);
      }
    },
    [setTraceRouteNetworkId, setSelectedFeature]
  );

  const clearHighlights = () => {
    setTraceRouteNetworkId("");
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
    </div>
  );
}

export default ReadOnlyDiagram;
