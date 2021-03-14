import { useRef, useEffect } from "react";
import mapboxgl, { Map, MapboxGeoJSONFeature, PointLike } from "mapbox-gl";
import { Feature } from "geojson";
import Config from "../../config";
import {
  getLayer,
  createFeature,
  createSource,
  innerConduitSelect,
  outerConduitSelect,
  nodeContainerSideSelect,
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

mapboxgl.accessToken = Config.MAPBOX_API_KEY;

const loadDiagram = (map: Map, diagramObjects: Diagram[]) => {
  const t: { [id: string]: Feature[] } = {};

  diagramObjects.forEach((x, i) => {
    const feature = createFeature(
      i,
      x.label ?? "",
      x.geometry.type,
      x.geometry.coordinates,
      x.style,
      x.refId ?? ""
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

function clickHighlight(
  featureName: string,
  map: Map,
  callback: (feature: MapboxGeoJSONFeature) => void,
  editMode: boolean
) {
  map.on("click", featureName, (e) => {
    const bbox: [PointLike, PointLike] = [
      [e.point.x - 1, e.point.y - 1],
      [e.point.x + 1, e.point.y + 1],
    ];

    const feature = map.queryRenderedFeatures(bbox)[0];
    if (feature.source !== featureName) {
      return;
    }

    feature.state.selected = !feature.state.selected;

    if (editMode) {
      const innerConduits = map.querySourceFeatures("InnerConduit", {
        sourceLayer: "InnerConduit",
      });

      const outerConduits = map.querySourceFeatures("OuterConduit", {
        sourceLayer: "OuterConduit",
      });

      innerConduits.forEach((x) => {
        map.setFeatureState(
          { source: "InnerConduit", id: x.id },
          { selected: false }
        );
      });

      outerConduits.forEach((x) => {
        map.setFeatureState(
          { source: "OuterConduit", id: x.id },
          { selected: false }
        );
      });
    }

    map.setFeatureState(
      { source: featureName, id: feature.id },
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

  useEffect(() => {
    if (diagramObjects.length === 0) return;

    const newMap = new Map({
      container: mapContainer.current ?? "",
      style: Config.MAPBOX_STYLE_URI,
      minZoom: 8,
      center: [0.014, 0.014],
    });

    newMap.on("load", () => {
      newMap.doubleClickZoom.disable();
      loadDiagram(newMap, diagramObjects);
      mapFitBounds(envelope, newMap);
      enableResize(newMap);

      if (diagramObjects.find((x) => x.style.startsWith("InnerConduit"))) {
        newMap.addLayer(innerConduitSelect);
        newMap.addLayer(outerConduitSelect);

        hoverPointer("InnerConduit", newMap);
        clickHighlight("InnerConduit", newMap, onSelectFeature, editMode);
        // if has inner conduit then it also has outer
        hoverPointer("OuterConduit", newMap);
        clickHighlight("OuterConduit", newMap, onSelectFeature, editMode);

        // Set after OuterConduit
        newMap.moveLayer("OuterConduit", "InnerConduit");
      }

      if (
        diagramObjects.find((x) => x.style.startsWith("NodeContainerSide")) &&
        !editMode
      ) {
        newMap.addLayer(nodeContainerSideSelect);
        hoverPointer("NodeContainerSide", newMap);
        clickHighlight("NodeContainerSide", newMap, onSelectFeature, editMode);

        // Set after NodeContainer
        newMap.moveLayer("NodeContainer", "InnerConduit");
        newMap.moveLayer("NodeContainer", "OuterConduit");
      }
    });

    return () => {
      newMap.remove();
      map.current = null;
    };
  }, [diagramObjects, envelope, onSelectFeature, editMode]);

  return (
    <div className="schematic-diagram">
      <div className="schematic-diagram-container" ref={mapContainer} />
    </div>
  );
}

export default SchematicDiagram;
