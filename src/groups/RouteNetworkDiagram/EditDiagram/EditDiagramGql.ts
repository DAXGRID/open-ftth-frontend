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
  drawingOrder: number;
}

export interface Geometry {
  type: string;
  coordinates: string;
}

export interface AffixSpanEquipmentParams {
  spanSegmentIds: string[];
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
  $spanSegmentIds: [ID!]!,
  $nodeContainerId: ID!,
  $nodeContainerSide: NodeContainerSideEnum!
)
{
  spanEquipment
  {
    affixSpanEquipmentToNodeContainer(
      spanSegmentIds: $spanSegmentIds
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
  spanSegmentIds: string[];
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
  $spanSegmentIds: [ID!]!,
  $routeNodeId: ID!,
) {
  spanEquipment {
    detachSpanEquipmentFromNodeContainer(
      spanSegmentIds: $spanSegmentIds
      routeNodeId: $routeNodeId
    ) {
        isSuccess
        errorCode
    }
  }
}
`;

export interface RemoveSpanStructureResponse {
  spanEquipment: {
    removeSpanStructure: {
      isSuccess: boolean;
      errorCode: string;
    };
  };
}

export const REMOVE_SPAN_STRUCTURE = `
mutation ($spanSegmentId: ID!) {
  spanEquipment {
    removeSpanStructure(spanSegmentId: $spanSegmentId) {
      isSuccess
      errorCode
    }
  }
}
`;

export interface ReverseVerticalAlignmentResponse {
  nodeContainer: {
    reverseVerticalContentAlignment: {
      isSuccess: boolean;
      errorCode: string;
    };
  };
}

export const REVERSE_VERTICAL_ALIGNMENT = `
mutation ($nodeContainerId: ID!) {
  nodeContainer {
    reverseVerticalContentAlignment(nodeContainerId: $nodeContainerId) {
       isSuccess
       errorCode
    }
  }
}
`;

export interface SpanSegmentTraceResponse {
  utilityNetwork: {
    spanSegmentTrace: {
      routeNetworkSegmentGeometries?: string[];
      routeNetworkSegmentIds?: string[];
    };
  };
}

export const SPAN_SEGMENT_TRACE = `
query ($spanSegmentId: ID!) {
  utilityNetwork {
    spanSegmentTrace(spanSegmentId: $spanSegmentId) {
      routeNetworkSegmentGeometries
      routeNetworkSegmentIds
    }
  }
}
`;

export type RemoveNodeContainerResponse = {
  nodeContainer: {
    remove: {
      isSuccess: boolean;
      errorCode: string;
    };
  };
};

export const REMOVE_NODE_CONTAINER = `
mutation($nodeContainerId: ID!) {
  nodeContainer {
    remove(nodeContainerId: $nodeContainerId) {
      isSuccess
      errorCode
    }
  }
}`;

export interface AffixSpanEquipmentToParentParams {
  routeNodeId: string;
  spanSegmentIdOne: string;
  spanSegmentIdTwo: string;
}

export interface AffixSpanEquipmentToParentResponse {
  spanEquipment: {
    affixSpanEquipmentToParent: {
      isSuccess: boolean;
      errorCode: string;
      errorMessage: string;
    };
  };
}

export const AFFIX_SPAN_EQUIPMENT_TO_PARENT = `
mutation(
$routeNodeId: ID!,
$spanSegmentIdOne: ID!,
$spanSegmentIdTwo: ID!
) {
  spanEquipment {
    affixSpanEquipmentToParent(
      routeNodeId: $routeNodeId
      spanSegmentId1: $spanSegmentIdOne
      spanSegmentId2: $spanSegmentIdTwo
    ) {
      isSuccess
      errorCode
      errorMessage
    }
  }
}
`;
