import { Client } from "urql";

export const connectivityViewQuery = (
  client: Client,
  routeNodeId: string,
  terminalEquipmentOrRackId: string
) => {
  return client
    .query<TerminalEquipmentResponse>(
      TERMINAL_EQUIPMENT_CONNECTIVITY_VIEW_QUERY,
      {
        routeNodeId: routeNodeId,
        terminalEquipmentOrRackId: terminalEquipmentOrRackId,
      }
    )
    .toPromise();
};

export interface ParentNodeStructure {
  id: string;
  category: string;
  name: string;
  specName: string;
  info: string | null;
}

export interface Line {
  connectorSymbol: string;
  a: {
    terminal: {
      id: string;
      name: string;
    };
    connectedTo: string | null;
    end: string | null;
  } | null;
  z: {
    terminal: {
      id: string;
      name: string;
    };
    connectedTo: string | null;
    end: string | null;
  } | null;
}

export interface TerminalStructure {
  id: string;
  category: string;
  name: string;
  specName: string;
  info: string | null;
  lines: Line[];
}

export interface TerminalEquipment {
  id: string;
  parentNodeStructureId: string;
  category: string;
  name: string;
  specName: string;
  info: string | null;
  terminalStructures: TerminalStructure[];
}

export interface TerminalEquipmentConnectivityView {
  parentNodeStructures: ParentNodeStructure[];
  terminalEquipments: TerminalEquipment[];
}

export interface TerminalEquipmentResponse {
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
        terminalStructures {
          id
          name
          specName
          info
          lines {
            connectorSymbol
            a {
              terminal {
                id
                name
              }
              connectedTo
              end
            }
            z {
              terminal {
                id
                name
              }
              connectedTo
              end
            }
          }
        }
      }
    }
  }
}
`;

export interface ConnectivityTraceViewResponse {
  utilityNetwork: {
    connectivityTraceView: {
      circuitName: string;
      hops: {
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
      }[];
    };
  };
}

export interface ConnectivityTraceViewQueryParams {
  routeNodeId: string;
  terminalOrSpanEquipmentId: string;
}

export const CONNECTIVITY_TRACE_VIEW_QUERY = `
query (
$routeNodeId: ID!,
$terminalOrSpanEquipmentId: ID!) {
  utilityNetwork {
    connectivityTraceView(
      routeNodeId: $routeNodeId
      terminalOrSpanEquipmentId: $terminalOrSpanEquipmentId
    ) {
      circuitName
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
      }
    }
  }
}`;
