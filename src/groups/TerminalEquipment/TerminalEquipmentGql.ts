import { Client } from "urql";

export const connectivityViewQuery = (
  client: Client,
  routeNodeId: string,
  terminalEquipmentOrRackId: string,
) => {
  return client
    .query<TerminalEquipmentResponse>(
      TERMINAL_EQUIPMENT_CONNECTIVITY_VIEW_QUERY,
      {
        routeNodeId: routeNodeId,
        terminalEquipmentOrRackId: terminalEquipmentOrRackId,
      },
    )
    .toPromise();
};

export const connectivityTraceViewQuery = (
  client: Client,
  routeNetworkElementId: string,
  terminalOrSpanEquipmentId: string,
) => {
  return client
    .query<ConnectivityTraceViewResponse>(CONNECTIVITY_TRACE_VIEW_QUERY, {
      routeNetworkElementId: routeNetworkElementId,
      terminalOrSpanEquipmentId: terminalOrSpanEquipmentId,
    } as ConnectivityTraceViewQueryParams)
    .toPromise();
};

export const removeStructure = (
  client: Client,
  params: RemoveStructureParams,
) => {
  return client
    .mutation<RemoveStructureResponse>(REMOVE_STRUCTURE_MUTATION, params)
    .toPromise();
};

export interface ParentNodeStructure {
  id: string;
  category: string;
  name: string;
  specName: string;
  info: string | null;
}

type FaceKind = "SpliceSide" | "PatchSide" | "IngoingSide" | "OutgoingSide";

export interface Line {
  connectorSymbol: string;
  a: {
    terminal: {
      id: string;
      name: string;
    };
    connectedTo: string | null;
    end: string | null;
    connectedToSpanSegmentId: string;
    faceKind: FaceKind;
  } | null;
  z: {
    terminal: {
      id: string;
      name: string;
    };
    connectedTo: string | null;
    end: string | null;
    connectedToSpanSegmentId: string;
    faceKind: FaceKind;
  } | null;
}

export interface TerminalStructure {
  id: string;
  category: string;
  name: string;
  specName: string;
  info: string | null;
  lines: Line[];
  isInterfaceModule: boolean;
}

export interface TerminalEquipment {
  id: string;
  parentNodeStructureId: string;
  category: string;
  name: string;
  specName: string;
  info: string | null;
  isLineTermination: boolean;
  terminalStructuresIsNameable: boolean;
  terminalStructures: TerminalStructure[];
}

export interface TerminalEquipmentConnectivityView {
  parentNodeStructures: ParentNodeStructure[];
  terminalEquipments: TerminalEquipment[];
}

interface TerminalEquipmentResponse {
  utilityNetwork: {
    terminalEquipmentConnectivityView: TerminalEquipmentConnectivityView;
  };
}

export const TERMINAL_EQUIPMENT_CONNECTIVITY_VIEW_QUERY = `
query (
$routeNodeId: ID!,
$terminalEquipmentOrRackId: ID!) {
  utilityNetwork {
    terminalEquipmentConnectivityView(
      routeNodeId: $routeNodeId
      terminalEquipmentOrRackId: $terminalEquipmentOrRackId
    ) {
      parentNodeStructures {
        id
        name
        specName
      }
      terminalEquipments {
        id
        parentNodeStructureId
        name
        category
        specName
        isLineTermination
        terminalStructuresIsNameable
        terminalStructures {
          id
          name
          specName
          info
          isInterfaceModule
          lines {
            connectorSymbol
            a {
              terminal {
                id
                name
              }
              connectedTo
              end
              faceKind
              connectedToSpanSegmentId
            }
            z {
              terminal {
                id
                name
              }
              connectedTo
              end
              faceKind
              connectedToSpanSegmentId
            }
          }
        }
      }
    }
  }
}
`;

export interface TerminalEquipmentConnectivityViewUpdatedResponse {
  terminalEquipmentConnectivityUpdated: TerminalEquipmentConnectivityView;
}

export interface TerminalEquipmentConnectivityViewUpdatedParams {
  routeNodeId: string;
  terminalEquipmentOrRackId: string;
}

export const TERMINAL_EQUIPMENT_CONNECTIVITY_VIEW_UPDATED = `
subscription ($routeNodeId: ID!, $terminalEquipmentOrRackId: ID!) {
  terminalEquipmentConnectivityUpdated(
    routeNodeId: $routeNodeId
    terminalEquipmentOrRackId: $terminalEquipmentOrRackId
  ) {
    parentNodeStructures {
      id
      name
      specName
    }
    terminalEquipments {
      id
      parentNodeStructureId
      name
      category
      specName
      isLineTermination
      terminalStructuresIsNameable  
      terminalStructures {
        id
        name
        specName
        info
        isInterfaceModule
        lines {
          connectorSymbol
          a {
            terminal {
              id
              name
            }
            connectedTo
            end
            connectedToSpanSegmentId
            faceKind
          }
          z {
            terminal {
              id
              name
            }
            connectedTo
            end
            connectedToSpanSegmentId
            faceKind
          }
        }
      }
    }
  }
}
`;

export interface Hop {
  level: number;
  isSplitter: boolean;
  isTraceSource: boolean;
  node: string;
  equipment: string;
  terminalStructure: string;
  terminal: string;
  connectionInfo: string;
  totalLength: number;
  routeSegmentIds: string[];
  routeSegmentGeometries: string[];
  hopSeqNo: number;
}

export interface Envelope {
  wGS84MinX: number;
  wGS84MinY: number;
  wGS84MaxX: number;
  wGS84MaxY: number;
  eTRS89MinX: number;
  eTRS89MinY: number;
  eTRS89MaxX: number;
  eTRS89MaxY: number;
}

export interface ConnectivityTraceView {
  circuitName: string;
  hops: Hop[];
  envelope: Envelope;
}

interface ConnectivityTraceViewResponse {
  utilityNetwork: {
    connectivityTraceView: ConnectivityTraceView;
  };
}

interface ConnectivityTraceViewQueryParams {
  routeNetworkElementId: string;
  terminalOrSpanEquipmentId: string;
}

export const CONNECTIVITY_TRACE_VIEW_QUERY = `
query (
$routeNetworkElementId: ID!,
$terminalOrSpanEquipmentId: ID!) {
  utilityNetwork {
    connectivityTraceView(
      routeNetworkElementId: $routeNetworkElementId
      terminalOrSpanEquipmentId: $terminalOrSpanEquipmentId
    ) {
      circuitName
      envelope {
        wGS84MinX
        wGS84MinY
        wGS84MaxX
        wGS84MaxY
        eTRS89MinX
        eTRS89MinY
        eTRS89MaxX
        eTRS89MaxY
      }
      hops {
        level
        isSplitter
        isTraceSource
        node
        equipment
        terminalStructure
        terminal
        connectionInfo
        totalLength
        routeSegmentIds
        routeSegmentGeometries
        hopSeqNo
      }
    }
  }
}`;

interface RemoveStructureResponse {
  terminalEquipment: {
    removeStructure: {
      isSuccess: boolean;
      errorCode: string;
      errorMessage: string;
    };
  };
}

interface RemoveStructureParams {
  routeNodeId: string;
  terminalEquipmentId: string;
  terminalStructureId: string;
}

const REMOVE_STRUCTURE_MUTATION = `
mutation(
$routeNodeId: ID!,
$terminalEquipmentId: ID!,
$terminalStructureId: ID!
) {
  terminalEquipment {
    removeStructure(
      routeNodeId: $routeNodeId
      terminalEquipmentId: $terminalEquipmentId
      terminalStructureId: $terminalStructureId
    ) {
      isSuccess
      errorCode
      errorMessage
    }
  }
}
`;
