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
