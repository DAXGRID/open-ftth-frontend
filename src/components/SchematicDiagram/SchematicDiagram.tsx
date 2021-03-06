import { useRef, useEffect } from "react";
import mapboxgl, { Map } from "mapbox-gl";
import { Feature } from "geojson";
import Config from "../../config";
import { getLayer, createFeature, createSource } from "./diagramLayer";

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

  diagramObjects.forEach((x) => {
    const feature = createFeature(
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
      loadDiagram(newMap, diagramObjects);
      newMap.fitBounds(
        [
          [envelope.minX, envelope.minY],
          [envelope.maxX, envelope.maxY],
        ],
        {
          animate: false,
        }
      );
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
