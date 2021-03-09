import { useRef, useEffect } from "react";
import mapboxgl, { Map, MapboxGeoJSONFeature, PointLike } from "mapbox-gl";
import { Feature } from "geojson";
import Config from "../../config";
import {
  getLayer,
  createFeature,
  createSource,
  innerConduitSelect,
  multiConduitSelect,
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
  callback: (feature: MapboxGeoJSONFeature) => void
) {
  map.on("click", featureName, (e) => {
    const bbox: [PointLike, PointLike] = [
      [e.point.x - 5, e.point.y - 5],
      [e.point.x + 5, e.point.y + 5],
    ];

    const feature = map.queryRenderedFeatures(bbox)[0];
    if (feature.source !== featureName) {
      return;
    }

    feature.state.selected = !feature.state.selected;

    map.setFeatureState(
      { source: featureName, id: feature.id },
      { selected: feature.state.selected }
    );

    if (callback) callback(feature);
  });
}

function SchematicDiagram({ diagramObjects, envelope }: SchematicDiagramProps) {
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
      newMap.addLayer(innerConduitSelect);
      newMap.addLayer(multiConduitSelect);
      mapFitBounds(envelope, newMap);
      enableResize(newMap);
      hoverPointer("InnerConduit", newMap);
      hoverPointer("OuterConduit", newMap);
      clickHighlight("InnerConduit", newMap, (x) => console.log(x));
      clickHighlight("OuterConduit", newMap, (x) => console.log(x));
    });

    return () => {
      newMap.remove();
      map.current = null;
    };
  }, [diagramObjects, envelope]);

  return (
    <div className="schematic-diagram">
      <div className="schematic-diagram-container" ref={mapContainer} />
    </div>
  );
}

export default SchematicDiagram;
