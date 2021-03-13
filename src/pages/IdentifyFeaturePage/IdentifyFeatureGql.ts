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

export const GET_DIAGRAM = `
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

export const AFFIX_SPAN_EQUIPMENT_TO_NODE_CONTAINER = `
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

export interface CutSpanSegmentsParameter {
  routeNodeId: string;
  spanSegmentsToCut: string[];
}

export interface CutSpanSegmentsResponse {
  spanEquipment: {
    cutSpanSegments: {
      errorCode?: string;
      isSuccess: boolean;
    };
  };
}

export const CUT_SPAN_SEGMENTS = `
mutation (
  $routeNodeId: ID!,
  $spanSegmentsToCut: [ID!]!,
) {
  spanEquipment {
    cutSpanSegments(
      routeNodeId: $routeNodeId
      spanSegmentstoCut: $spanSegmentsToCut
    ) {
      isSuccess
      errorCode
    }
  }
}
`;

export interface ConnectSpanSegmentsParameter {
  routeNodeId: string;
  spanSegmentsToConnect: string[];
}

export interface ConnectSpanSegmentsResponse {
  spanEquipment: {
    connectSpanSegments: {
      errorCode?: string;
      isSuccess: boolean;
    };
  };
}

export const CONNECT_SPAN_SEGMENTS = `
mutation (
  $routeNodeId: ID!,
  $spanSegmentsToConnect: [ID!]!,
) {
  spanEquipment {
    connectSpanSegments(
      routeNodeId: $routeNodeId
      spanSegmentsToConnect: $spanSegmentsToConnect
    ) {
      isSuccess
      errorCode
    }
  }
}
`;

export interface DisconnectSpanSegmentsParameter {
  routeNodeId: string;
  spanSegmentsToDisconnect: string[];
}

export interface DisconnectSpanSegmentsResponse {
  spanEquipment: {
    disconnectSpanSegments: {
      errorCode?: string;
      isSuccess: boolean;
    };
  };
}

export const DISCONNECT_SPAN_SEGMENTS = `
mutation (
  $routeNodeId: ID!,
  $spanSegmentsToDisconnect: [ID!]!,
) {
  spanEquipment {
    disconnectSpanSegments(
      routeNodeId: $routeNodeId
      spanSegmentsToDisconnect: $spanSegmentsToDisconnect
    ) {
        isSuccess
        errorCode
    }
  }
}
`;

export interface DetachSpanEquipmentParameters {
  spanSegmentId: string;
  routeNodeId: string;
}

export interface DetachSpanEquipmentResponse {
  spanEquipment: {
    detachSpanEquipmentFromNodeContainer: {
      errorCode?: string;
      isSuccess: boolean;
    };
  };
}

export const DETACH_SPAN_EQUIPMENT_FROM_NODE_CONTAINER = `
mutation (
  $spanSegmentId: ID!,
  routeNodeId: ID!,
) {
  spanEquipment {
    detachSpanEquipmentFromNodeContainer(
      spanSegmentId: $spanSegmentId
      routeNodeId: $nodeContainerId
    ) {
        isSucess
        errorCode
    }
  }
}
`;

export interface SpanSegmentTraceResponse {
  utilityNetwork: {
    spanSegmentTrace: {
      routeNetworkSegmentIds: string[];
    };
  };
}

export const SPAN_SEGMENT_TRACE = `
query ($spanSegmentId: ID!) {
  utilityNetwork {
    spanSegmentTrace(spanSegmentId: $spanSegmentId) {
      routeNetworkSegmentIds
    }
  }
}
`;
