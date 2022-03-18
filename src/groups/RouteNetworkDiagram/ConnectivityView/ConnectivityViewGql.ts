import { Client } from "urql";

export const connectivityTraceViewQuery = (
  client: Client,
  routeNetworkElementId: string,
  terminalOrSpanEquipmentId: string
) => {
  return client
    .query<ConnectivityTraceViewResponse>(CONNECTIVITY_TRACE_VIEW_QUERY, {
      routeNetworkElementId: routeNetworkElementId,
      terminalOrSpanEquipmentId: terminalOrSpanEquipmentId,
    } as ConnectivityTraceViewQueryParams)
    .toPromise();
};

export const spanEquipmentConnectivityViewQuery = (
  client: Client,
  routeNetworkElementId: string,
  spanEquipmentOrSegmentIds: string[]
) => {
  return client
    .query<SpanEquipmentConnectivityViewResponse>(
      SPAN_EQUIPMENT_CONNECTIIVTY_VIEW,
      {
        routeNetworkElementId: routeNetworkElementId,
        spanEquipmentOrSegmentIds: spanEquipmentOrSegmentIds,
      } as SpanEquipmentConnectivityViewParams
    )
    .toPromise();
};

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

export interface ConnectivityTraceView {
  circuitName: string;
  hops: Hop[];
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

const CONNECTIVITY_TRACE_VIEW_QUERY = `
query (
$routeNetworkElementId: ID!,
$terminalOrSpanEquipmentId: ID!) {
  utilityNetwork {
    connectivityTraceView(
      routeNetworkElementId: $routeNetworkElementId
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
        hopSeqNo
      }
    }
  }
}`;

export interface Line {
  spanSegmentId: string;
  sequenceNumber: number;
  name: string;
  a: {
    connectedTo: string;
    end: string;
  };
  z: {
    connectedto: string;
    end: string;
  };
}

export interface SpanEquipment {
  id: string;
  category: string;
  specName: string;
  name: string;
  info: string;
  lines: Line[];
  isCable: boolean;
}

export interface SpanEquipmentConnectivityView {
  spanEquipments: SpanEquipment[];
}

interface SpanEquipmentConnectivityViewResponse {
  utilityNetwork: {
    spanEquipmentConnectivityView: SpanEquipmentConnectivityView;
  };
}

interface SpanEquipmentConnectivityViewParams {
  routeNetworkElementId: string;
  spanEquipmentOrSegmentIds: string[];
}

const SPAN_EQUIPMENT_CONNECTIIVTY_VIEW = `
query (
$routeNetworkElementId: ID!,
$spanEquipmentOrSegmentIds: [ID!]!
) {
  utilityNetwork {
    spanEquipmentConnectivityView(
      routeNetworkElementId: $routeNetworkElementId
      spanEquipmentOrSegmentIds: $spanEquipmentOrSegmentIds
    ) {
      spanEquipments {
        id
        category
        specName
        name
        info
        isCable
        lines {
          spanSegmentId
          sequenceNumber
          name
          a {
            connectedTo
            end
          }
          z {
            connectedTo
            end
          }
        }
      }
    }
  }
}
`;
