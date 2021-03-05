import { useRef, useEffect, useState } from "react";
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

function SchematicDiagram({ diagramObjects, envelope }: SchematicDiagramProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [lng] = useState(0.014);
  const [lat] = useState(0.014);
  const [zoom] = useState(14);
  const [minZoom] = useState(12);
  const map = useRef<Map | null>(null);

  useEffect(() => {
    if (diagramObjects.length === 0) return;

    const newMap = new Map({
      container: mapContainer.current ?? "",
      style: Config.MAPBOX_STYLE_URI,
      center: [lng, lat],
      zoom: zoom,
      minZoom: minZoom,
    });

    newMap.on("load", () => {
      loaded(newMap);
    });

    return () => {
      newMap.remove();
      map.current = null;
    };
  }, [lng, lat, zoom, minZoom, diagramObjects, envelope]);

  const loaded = (map: Map) => {
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

  return (
    <div className="schematic-diagram">
      <div className="schematic-diagram-container" ref={mapContainer} />
    </div>
  );
}

export default SchematicDiagram;
