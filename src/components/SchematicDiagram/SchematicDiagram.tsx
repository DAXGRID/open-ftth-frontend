import { useRef, useEffect, useState } from "react";
import mapboxgl, { Map, AnyLayer } from "mapbox-gl";
import Config from "../../config";
import { createLayer } from "./parseFeatures";

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
  const map = useRef<Map | null>(null);
  const [lng] = useState(0.014);
  const [lat] = useState(0.014);
  const [zoom] = useState(14);
  const [minZoom] = useState(12);

  useEffect(() => {
    const newMap = new Map({
      container: mapContainer.current === null ? "" : mapContainer.current,
      style: Config.MAPBOX_STYLE_URI,
      center: [lng, lat],
      zoom: zoom,
      minZoom: minZoom,
    });

    map.current = newMap;

    return () => {
      newMap.remove();
    };
  }, [lng, lat, zoom, minZoom]);

  if (diagramObjects.length > 0 && map.current) {
    const layer = createLayer(diagramObjects[0].style);
  }

  return (
    <div className="schematic-diagram">
      <div className="schematic-diagram-container" ref={mapContainer} />
    </div>
  );
}

export default SchematicDiagram;
