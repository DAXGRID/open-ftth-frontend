import { MapboxGeoJSONFeature } from "mapbox-gl";
import SchematicDiagram from "./SchematicDiagram";

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

const testFunc = (x: MapboxGeoJSONFeature) => {
  console.log(x);
};

function ReadOnlyDiagram({
  diagramObjects,
  envelope,
}: RouteSegmentDiagramProps) {
  return (
    <div>
      <SchematicDiagram
        diagramObjects={diagramObjects}
        editMode={false}
        envelope={envelope}
        onSelectFeature={testFunc}
      />
    </div>
  );
}

export default ReadOnlyDiagram;
