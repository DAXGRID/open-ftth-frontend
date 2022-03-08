import { Client } from "urql";

export function queryTerminalEquipmentDetails(
  client: Client,
  terminalEquipmentId: string
) {
  return client
    .query<QueryTerminalEquipmentDetailsResponse>(
      QUERY_TERMINAL_EQUIPMENT_DETAILS,
      {
        terminalEquipmentOrTerminalId: terminalEquipmentId,
      } as QueryTerminalEquipmentDetailsParams
    )
    .toPromise();
}

interface QueryTerminalEquipmentDetailsParams {
  terminalEquipmentOrTerminalId: string;
}

interface TerminalEquipment {
  id: string;
  name: string;
  description: string;
  specification: {
    category: string;
    id: string;
  };
  manufacturer: {
    id: string;
  };
  addressInfo: {
    remark: string;
    accessAddress: {
      id: string;
    };
    unitAddress: {
      id: string;
    };
  };
}

interface QueryTerminalEquipmentDetailsResponse {
  utilityNetwork: {
    terminalEquipment: TerminalEquipment;
  };
}

const QUERY_TERMINAL_EQUIPMENT_DETAILS = `
query ($terminalEquipmentOrTerminalId: ID!) {
  utilityNetwork {
    terminalEquipment(terminalEquipmentOrTerminalId: $terminalEquipmentOrTerminalId) {
      id
      name
      description
      specification {
        category
        id
      }
      manufacturer {
        id
      }
      addressInfo {
        remark
        accessAddress {
          id
        }
        unitAddress {
          id
        }
      }
    }
  }
}
`;
