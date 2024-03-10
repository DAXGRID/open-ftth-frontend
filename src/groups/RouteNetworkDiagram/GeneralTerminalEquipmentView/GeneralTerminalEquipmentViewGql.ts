import { Client } from "urql";

export function getGeneralView(
  client: Client,
  terminalEquipmentOrTerminalId: string
) {
  return client
    .query<QueryTerminalEquipmentDetailsResponse>(
      QUERY_TERMINAL_EQUIPMENT_DETAILS,
      {
        terminalEquipmentOrTerminalId: terminalEquipmentOrTerminalId,
      }
    )
    .toPromise();
}

export interface TerminalEquipment {
  id: string;
  name: string;
  dynamicProperties: {
    sectionName: String;
    properties: { name: string; value: string }[];
  }[];
  addressInfo?: {
    remark?: string;
    accessAddress?: {
      postDistrictCode: string;
      postDistrict: string;
      houseNumber: string;
      roadName: string;
    };
    unitAddress?: {
      externalId: string;
      floorName: string;
      suitName: string;
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
      addressInfo {
        remark
        accessAddress {
          postDistrictCode
          postDistrict
          houseNumber
          roadName
        }
        unitAddress {
          externalId
          floorName
          suitName
        }
      }
      dynamicProperties {
        sectionName
        properties {
          name
          value
        }
      }
    }
  }
}
`;
