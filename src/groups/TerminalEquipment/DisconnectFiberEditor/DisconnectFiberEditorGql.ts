import { Client } from "urql";

export const disconnectSpanEquipmentFromTerminalViewQuery = (
  client: Client,
  queryParams: DisconnectSpanEquipmentFromTerminalQueryViewParams
) => {
  return client
    .query<DisconnectSpanEquipmentFromTerminalViewResponse>(
      DISCONNECT_SPAN_EQUIPMENT_FROM_TERMINAL_VIEW,
      queryParams
    )
    .toPromise();
};

export const disconnectFromTerminalEquipment = (
  client: Client,
  mutationParams: DisconnectFromTerminalEquipmentParams
) => {
  return client
    .mutation<DisconnectFromTerminalEquipmentMutationResponse>(
      DISCONNECT_FROM_TERMINAL_EQUIPMENT_MUTATION,
      mutationParams
    )
    .toPromise();
};

interface DisconnectSpanEquipmentFromTerminalViewResponse {
  utilityNetwork: {
    disconnectSpanEquipmentFromTerminalView: DisconnectSpanEquipmentFromTerminalView;
  };
}

export interface DisconnectSpanEquipmentFromTerminalView {
  spanEquipmentName: string;
  lines: Line[];
}

export interface Line {
  isConnected: boolean;
  terminalId: string;
  terminalEquipmentName: string;
  terminalStructureName: string;
  terminalName: string;
  segmentId: string;
  spanStructurePosition: number;
  spanStructureName: string;
  end: string;
}

interface DisconnectSpanEquipmentFromTerminalQueryViewParams {
  spanSegmentId: string;
  terminalId: string;
}

const DISCONNECT_SPAN_EQUIPMENT_FROM_TERMINAL_VIEW = `
query (
$spanSegmentId: ID!,
$terminalId: ID!
) {
  utilityNetwork {
    disconnectSpanEquipmentFromTerminalView(
      spanSegmentId: $spanSegmentId
      terminalId: $terminalId
    ) {
      spanEquipmentName
      lines {
        isConnected
        terminalId
        terminalEquipmentName
        terminalStructureName
        terminalName
        segmentId
        spanStructurePosition
        spanStructureName
        end
      }
    }
  }
}
`;

interface DisconnectFromTerminalEquipmentMutationResponse {
  spanEquipment: {
    disconnectFromTerminalEquipment: {
      isSuccess: boolean;
      errorCode: string;
      errorMessage: string;
    };
  };
}

interface DisconnectFromTerminalEquipmentParams {
  routeNodeId: string;
  disconnects: {
    terminalId: string;
    spanSegmentId: string;
  }[];
}

const DISCONNECT_FROM_TERMINAL_EQUIPMENT_MUTATION = `
mutation (
$routeNodeId: ID!,
$disconnects: [DisconnectSpanSegmentFromTerminalOperationInput!]!
) {
  spanEquipment {
    disconnectFromTerminalEquipment(
      routeNodeId: $routeNodeId
      disconnects: $disconnects)
    {
      isSuccess
      errorCode
      errorMessage
    }
  }
}
`;
