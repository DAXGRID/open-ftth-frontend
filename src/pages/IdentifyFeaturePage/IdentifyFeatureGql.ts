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

export interface DiagramUpdatedResponse {
  schematicDiagramUpdated: {
    diagramObjects: Diagram[];
    envelope: Envelope;
  };
}

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

export interface AffixSpanEquipmentParams {
  spanSegmentId: string;
  nodeContainerId: string;
  nodeContainerSide: "NORTH" | "SOUTH" | "WEST" | "EAST";
}

export interface AffixSpanEquipmentResponse {
  spanEquipment: {
    affixSpanEquipmentToNodeContainer: {
      errorCode?: string;
      isSuccess: boolean;
      errorMesssage?: string;
    };
  };
}

export const AFFIX_SPAN_EQUIPMENT_TO_NODE_CONTAINER_MUTATION = `
mutation (
  $spanSegmentId: ID!,
  $nodeContainerId: ID!,
  $nodeContainerSide: NodeContainerSideEnum!
)
{
  spanEquipment
  {
    affixSpanEquipmentToNodeContainer(
      spanSegmentId: $spanSegmentId
      nodeContainerId: $nodeContainerId
      nodeContainerSide: $nodeContainerSide
    )
    {
      isSuccess
      errorCode
      errorMessage
    }
  }
}
`;
