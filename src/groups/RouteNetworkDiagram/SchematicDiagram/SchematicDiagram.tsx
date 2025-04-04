import { Feature } from "geojson";
import maplibregl, {
  Map,
  MapGeoJSONFeature,
  PointLike,
  NavigationControl,
  MapDataEvent,
  MapMouseEvent,
} from "maplibre-gl";
import { DiagramContext } from "../DiagramContext";
import { useContext, useEffect, useLayoutEffect, useRef } from "react";
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
  freeRackSpaceSelect,
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
  properties?: { name: string; value: string }[];
}

interface Geometry {
  type: string;
  coordinates: string;
}

type SchematicDiagramProps = {
  diagramObjects: Diagram[];
  envelope: Envelope;
  onSelectFeature: (feature: MapGeoJSONFeature) => void;
  editMode: boolean;
  routeElementId: string;
};

interface SchematicPosition {
  envelope: Envelope;
  zoom: number;
}

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
      x.drawingOrder,
      x.properties,
    );

    let styleName = x.style;
    if (styleName.startsWith("InnerConduit")) {
      styleName = "InnerConduit";
    } else if (styleName.startsWith("OuterConduit")) {
      styleName = "OuterConduit";
    } else if (styleName.startsWith("NodeContainerSide")) {
      styleName = "NodeContainerSide";
    } else if (
      styleName === "TerminalEquipment" ||
      styleName === "TerminalEquipmentWithProperties"
    ) {
      styleName = "TerminalEquipment";
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

function mapFitBounds(
  envelope: Envelope,
  map: maplibregl.Map,
  zoom: number | null,
) {
  var extraOptions = zoom
    ? {
        zoom: zoom,
      }
    : {};

  map.fitBounds(
    [
      [envelope.minX, envelope.minY],
      [envelope.maxX, envelope.maxY],
    ],
    {
      ...extraOptions,
      animate: false,
    },
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

function hoverPointerOff(featureName: string, map: Map) {
  map.off("mousemove", featureName, () => {});
  map.off("mouseleave", featureName, () => {});
  map.getCanvas().style.cursor = "";
}

function resizeHandler(map: Map) {
  setTimeout(() => {
    map.resize();
  }, 1);
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
  callback: (feature: MapGeoJSONFeature) => void,
  editMode: boolean,
) {
  return (e: MapMouseEvent & MapDataEvent) => {
    const bbox: [PointLike, PointLike] = [
      [e.point.x, e.point.y],
      [e.point.x, e.point.y],
    ];

    const features = map
      .queryRenderedFeatures(bbox)
      .filter((x) => featureNames.find((y) => y === x.source))
      .sort(
        (x, y) =>
          (y.properties?.drawingOrder ?? 0) - (x.properties?.drawingOrder ?? 0),
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
      { selected: feature.state.selected },
    );

    if (callback) callback(feature);
  };
}

function SchematicDiagram({
  diagramObjects,
  envelope,
  onSelectFeature,
  editMode,
  routeElementId,
}: SchematicDiagramProps) {
  const { map, setMap, reRender } = useContext(DiagramContext);
  const position = useRef<SchematicPosition | null>(null);

  useEffect(() => {
    position.current = null;
  }, [routeElementId]);

  useLayoutEffect(() => {
    if (map) return;

    const newMap = new Map({
      container: "schematic-diagram-container",
      style: {
        version: 8,
        sources: {},
        layers: [],
        glyphs: "/fonts/{fontstack}/{range}.pbf",
      },
      minZoom: 8,
      center: [0.014, 0.014],
      dragRotate: false,
      doubleClickZoom: false,
    });

    newMap.touchZoomRotate.disableRotation();

    newMap.on("load", () => {
      if (!map) {
        setMap(newMap);
      }
    });

    newMap.addControl(
      new NavigationControl({
        showCompass: false,
      }),
      "top-left",
    );
  }, [map, setMap, diagramObjects]);

  useLayoutEffect(() => {
    if (diagramObjects.length === 0) return;
    if (!map) return;

    loadDiagram(map, diagramObjects);
    const hasInnerConduit = diagramObjects.find((x) =>
      x.style.startsWith("InnerConduit"),
    );

    const hasOuterConduit = diagramObjects.find((x) =>
      x.style.startsWith("OuterConduit"),
    );

    const hasNodeContainerSide = diagramObjects.find((x) =>
      x.style.startsWith("NodeContainerSide"),
    );

    const hasNodeContainer = diagramObjects.find((x) =>
      x.style.startsWith("NodeContainer"),
    );

    const hasRack = diagramObjects.find((x) => x.style.startsWith("Rack"));

    const hasTerminalEquipment = diagramObjects.find((x) =>
      x.style.startsWith("TerminalEquipment"),
    );

    const hasFiberCable = diagramObjects.find((x) =>
      x.style.startsWith("FiberCable"),
    );

    const hasFreeRackSpace = diagramObjects.find((x) =>
      x.style.startsWith("FreeRackSpace"),
    );

    const interactableObject: string[] = [];
    if (hasInnerConduit) {
      map.addLayer(innerConduitSelect);
      interactableObject.push("InnerConduit");
    }

    if (hasOuterConduit) {
      map.addLayer(outerConduitSelect);
      interactableObject.push("OuterConduit");
    }

    if (hasNodeContainerSide && editMode) {
      map.addLayer(nodeContainerSideSelect);
      interactableObject.push("NodeContainerSide");
    } else if (hasNodeContainerSide) {
      map.addLayer(nodeContainerSideSelect);
    }

    if (hasNodeContainer) {
      map.addLayer(nodeContainerSelect);
      interactableObject.push("NodeContainer");
    }

    if (hasRack) {
      map.addLayer(rackSelect);
      interactableObject.push("Rack");
    }

    if (hasTerminalEquipment) {
      map.addLayer(terminalEquipmentSelect);
      interactableObject.push("TerminalEquipment");
    }

    if (hasFiberCable) {
      map.addLayer(fiberCableUnderLayer);
      map.addLayer(fiberCableSymbolLayer);
      interactableObject.push("FiberCable");
    }

    if (hasFreeRackSpace) {
      map.addLayer(freeRackSpaceSelect);
      interactableObject.push("FreeRackSpace");
    }

    const clickHighlightHandler = clickHiglight(
      interactableObject,
      map,
      onSelectFeature,
      editMode,
    );
    map.on("click", clickHighlightHandler);

    interactableObject.forEach((name) => {
      hoverPointer(name, map);
    });

    reRender();
    map.resize();

    const savePosition = () => {
      const bounds = map.getBounds();
      const zoom = map.getZoom();
      position.current = {
        envelope: {
          minX: bounds.getWest(),
          minY: bounds.getSouth(),
          maxX: bounds.getEast(),
          maxY: bounds.getNorth(),
        },
        zoom: zoom,
      };
    };

    map.on("dragend", savePosition);
    map.on("zoomend", savePosition);

    const resizeCallbackHandler = () => resizeHandler(map);
    window.addEventListener("resize", resizeCallbackHandler);

    return () => {
      const layers = map.getStyle().layers;
      if (layers) {
        layers.forEach((x) => {
          map.removeLayer(x.id);
        });
      }

      Object.keys(map.getStyle().sources ?? {}).forEach((x) => {
        map.removeSource(x);
      });

      map.off("click", clickHighlightHandler);
      interactableObject.forEach((name) => {
        hoverPointerOff(name, map);
      });

      map.off("dragend", savePosition);
      map.off("zoomend", savePosition);
      window.removeEventListener("resize", resizeCallbackHandler);
    };
  }, [diagramObjects, envelope, onSelectFeature, editMode, map, reRender]);

  useLayoutEffect(() => {
    if (!map || diagramObjects.length === 0) return;
    if (position.current) {
      mapFitBounds(position.current.envelope, map, position.current.zoom);
    } else {
      mapFitBounds(envelope, map, null);
    }
  }, [map, envelope, diagramObjects]);

  return (
    <div
      className={
        editMode
          ? "schematic-diagram"
          : "schematic-diagram schematic-diagram--read-only"
      }
    >
      <div
        id="schematic-diagram-container"
        className="schematic-diagram-container"
      ></div>
    </div>
  );
}

export default SchematicDiagram;
