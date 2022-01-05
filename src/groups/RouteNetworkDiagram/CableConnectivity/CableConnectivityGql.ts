import { Client } from "urql";

export const connectivityTraceViewQuery = (
  client: Client,
  routeNodeId: string,
  terminalOrSpanEquipmentId: string
) => {
  return client
    .query<ConnectivityTraceViewResponse>(CONNECTIVITY_TRACE_VIEW_QUERY, {
      routeNodeId: routeNodeId,
      terminalOrSpanEquipmentId: terminalOrSpanEquipmentId,
    } as ConnectivityTraceViewQueryParams)
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
  routeNodeId: string;
  terminalOrSpanEquipmentId: string;
}

const CONNECTIVITY_TRACE_VIEW_QUERY = `
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
        hopSeqNo
      }
    }
  }
}`;
