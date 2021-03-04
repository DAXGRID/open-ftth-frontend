export interface DiagramQueryResponse {
  schematic: {
    buildDiagram: {
      envelope: Envelope;
      diagramObjects: Diagram[];
    };
  };
}

export interface Envelope {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export interface Diagram {
  refId?: string;
  refClass?: string;
  style: string;
  label?: string;
  geometry: Geometry;
}

export interface Geometry {
  type: string;
  coordinates: string;
}

export const GET_DIAGRAM_QUERY = `
query ($routeNetworkElementId: ID!) {
  schematic {
    buildDiagram(
      routeNetworkElementId: $routeNetworkElementId
    ) {
      envelope {
        minX
        maxX
        minY
        maxY
      }
      diagramObjects {
        refId
        refClass
        geometry {
          type
          coordinates
        }
        style
        label
      }
    }
  }
}
`;

export const SCHEMATIC_DIAGRAM_UPDATED = `
subscription ($routeNetworkElementId: ID!) {
  schematicDiagramUpdated(
    routeNetworkElementId: $routeNetworkElementId
  ) {
    envelope {
      minX
      maxX
      minY
      maxY
    }
    diagramObjects {
      refId
      refClass
      geometry {
        type
        coordinates
      }
      style
      label
    }
  }
}
`;
