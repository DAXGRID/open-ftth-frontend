import { Feature } from "geojson";
import mapboxgl, {
  Map,
  MapboxGeoJSONFeature,
  PointLike,
  NavigationControl,
} from "maplibre-gl";
import { useLayoutEffect, useRef } from "react";
import {
  createFeature,
  createSource,
  getLayer,
  innerConduitSelect,
  nodeContainerSideSelect,
  outerConduitSelect,
  nodeContainerSelect,
  rackSelect,
  terminalEquipmentSelect,
  fiberCableSymbolLayer,
  fiberCableUnderLayer,
} from "./diagramLayer";

interface Envelope {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

interface Diagram {
  refId?: string;
  refClass?: string;
  style: string;
  label?: string;
  geometry: Geometry;
  drawingOrder: number;
}

interface Geometry {
  type: string;
  coordinates: string;
}

type SchematicDiagramProps = {
  diagramObjects: Diagram[];
  envelope: Envelope;
  onSelectFeature: (feature: MapboxGeoJSONFeature) => void;
  editMode: boolean;
};

const loadDiagram = (map: Map, diagramObjects: Diagram[]) => {
  const t: { [id: string]: Feature[] } = {};

  diagramObjects.forEach((x, i) => {
    const feature = createFeature(
      i,
      x.label ?? "",
      x.geometry.type,
      x.geometry.coordinates,
      x.style,
      x.refId ?? "",
      x.drawingOrder
    );

    let styleName = x.style;
    if (styleName.startsWith("InnerConduit")) {
      styleName = "InnerConduit";
    } else if (styleName.startsWith("OuterConduit")) {
      styleName = "OuterConduit";
    } else if (styleName.startsWith("NodeContainerSide")) {
      styleName = "NodeContainerSide";
    }

    if (!t[styleName]) {
      t[styleName] = [];
    }

    t[styleName].push(feature);
  });

  for (const key in t) {
    const features = t[key];
    const source = createSource(features);
    map.addSource(key, source);
  }

  diagramObjects.forEach((x) => {
    const layer = getLayer(x.style);

    if (!map.getLayer(layer.id)) {
      map.addLayer(layer);
    }
  });
};

function mapFitBounds(envelope: Envelope, map: mapboxgl.Map) {
  map.fitBounds(
    [
      [envelope.minX, envelope.minY],
      [envelope.maxX, envelope.maxY],
    ],
    {
      animate: false,
    }
  );
}

function hoverPointer(featureName: string, map: Map) {
  map.on("mousemove", featureName, () => {
    map.getCanvas().style.cursor = "pointer";
  });

  map.on("mouseleave", featureName, () => {
    map.getCanvas().style.cursor = "";
  });
}

function enableResize(map: Map) {
  window.addEventListener("resize", () => {
    // Hack to handle resize of mapcanvas because
    // the event gets called to early, so we have to queue it up
    setTimeout(() => {
      map.resize();
    }, 1);
  });
}

function clearSelected(map: Map, source: string): void {
  map
    .querySourceFeatures(source, {
      sourceLayer: source,
    })
    .forEach((x) => {
      map.setFeatureState({ source: source, id: x.id }, { selected: false });
    });
}

function clickHiglight(
  featureNames: string[],
  map: Map,
  callback: (feature: MapboxGeoJSONFeature) => void,
  editMode: boolean
) {
  map.on("click", (e) => {
    const bboxSize = 1;
    const bbox: [PointLike, PointLike] = [
      [e.point.x - bboxSize, e.point.y - bboxSize],
      [e.point.x + bboxSize, e.point.y + bboxSize],
    ];

    const features = map
      .queryRenderedFeatures(bbox)
      .filter((x) => featureNames.find((y) => y === x.source))
      .sort(
        (x, y) =>
          (y.properties?.drawingOrder ?? 0) - (x.properties?.drawingOrder ?? 0)
      );

    const feature = features.length > 0 ? features[0] : null;
    if (!feature) return;

    feature.state.selected = !feature.state.selected;

    if (!editMode) {
      const clearHighlight = (
        (map: Map) => (source: string) =>
          clearSelected(map, source)
      )(map);

      featureNames.forEach((x) => {
        clearHighlight(x);
      });
    }

    map.setFeatureState(
      { source: feature.source, id: feature.id },
      { selected: feature.state.selected }
    );

    if (callback) callback(feature);
  });
}

function SchematicDiagram({
  diagramObjects,
  envelope,
  onSelectFeature,
  editMode,
}: SchematicDiagramProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<Map | null>(null);

  useLayoutEffect(() => {
    if (diagramObjects.length === 0) return;

    const newMap = new Map({
      container: mapContainer.current ?? "",
      style: {
        version: 8,
        sources: {},
        layers: [],
        glyphs: "https://fonts.openmaptiles.org/{fontstack}/{range}.pbf",
      },
      minZoom: 8,
      center: [0.014, 0.014],
    });

    newMap.doubleClickZoom.disable();
    newMap.dragRotate.disable();
    newMap.touchZoomRotate.disableRotation();
    newMap.addControl(
      new NavigationControl({
        showCompass: false,
      }),
      "top-left"
    );

    newMap.on("load", () => {
      loadDiagram(newMap, diagramObjects);
      mapFitBounds(envelope, newMap);
      enableResize(newMap);

      const hasInnerConduit = diagramObjects.find((x) =>
        x.style.startsWith("InnerConduit")
      );

      const hasOuterConduit = diagramObjects.find((x) =>
        x.style.startsWith("OuterConduit")
      );

      const hasNodeContainerSide = diagramObjects.find((x) =>
        x.style.startsWith("NodeContainerSide")
      );

      const hasNodeContainer = diagramObjects.find((x) =>
        x.style.startsWith("NodeContainer")
      );

      const hasRack = diagramObjects.find((x) => x.style.startsWith("Rack"));

      const hasTerminalEquipment = diagramObjects.find((x) =>
        x.style.startsWith("TerminalEquipment")
      );

      const hasFiberCable = diagramObjects.find((x) =>
        x.style.startsWith("FiberCable")
      );

      const highlightFeatureList: string[] = [];

      if (hasInnerConduit) {
        newMap.addLayer(innerConduitSelect);
        hoverPointer("InnerConduit", newMap);
        highlightFeatureList.push("InnerConduit");
      }

      if (hasOuterConduit) {
        newMap.addLayer(outerConduitSelect);
        hoverPointer("OuterConduit", newMap);
        highlightFeatureList.push("OuterConduit");
      }

      if (hasNodeContainerSide && editMode) {
        newMap.addLayer(nodeContainerSideSelect);
        hoverPointer("NodeContainerSide", newMap);
        highlightFeatureList.push("NodeContainerSide");
      } else if (hasNodeContainerSide) {
        newMap.addLayer(nodeContainerSideSelect);
      }

      if (hasNodeContainer) {
        newMap.addLayer(nodeContainerSelect);
        hoverPointer("NodeContainer", newMap);
        highlightFeatureList.push("NodeContainer");
      }

      if (hasRack) {
        newMap.addLayer(rackSelect);
        hoverPointer("Rack", newMap);
        highlightFeatureList.push("Rack");
      }

      if (hasTerminalEquipment) {
        newMap.addLayer(terminalEquipmentSelect);
        hoverPointer("TerminalEquipment", newMap);
        highlightFeatureList.push("TerminalEquipment");
      }

      if (hasFiberCable) {
        newMap.addLayer(fiberCableUnderLayer);
        newMap.addLayer(fiberCableSymbolLayer);
        hoverPointer("FiberCable", newMap);
        highlightFeatureList.push("FiberCable");
      }

      clickHiglight(highlightFeatureList, newMap, onSelectFeature, editMode);
    });

    return () => {
      newMap.remove();
      map.current = null;
    };
  }, [diagramObjects, envelope, onSelectFeature, editMode]);

  return (
    <div
      className={
        editMode
          ? "schematic-diagram"
          : "schematic-diagram schematic-diagram--read-only"
      }
    >
      <div className="schematic-diagram-container" ref={mapContainer} />
    </div>
  );
}

export default SchematicDiagram;
