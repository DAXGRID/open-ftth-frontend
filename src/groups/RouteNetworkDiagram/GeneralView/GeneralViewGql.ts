import { Client } from "urql";

let exampleResponse: QueryTerminalEquipmentDetailsResponse = {
  utilityNetwork: {
    terminalEquipment: {
      id: "d1073214-ee3c-42ff-be7e-ef50d49044d5",
      name: "",
      customProperties: [],
      addressInfo: {
        remark: "",
        accessAddress: {
          postDistrictCode: "8660",
          postDistrict: "Skanderborg",
          roadName: "Kongefolden",
          houseNumber: "20",
        },
        unitAddress: {
          externalId: "c3402656-ab58-404a-8a03-819813240666",
          floorName: "2",
          suitName: "mf",
        },
      },
    },
  },
};

function getGeneralView(client: Client): QueryTerminalEquipmentDetailsResponse {
  return exampleResponse;
}

export interface TerminalEquipment {
  id: string;
  name: string;
  customProperties: {
    sectionName: String;
    properties: { name: String; value: String }[];
  }[];
  addressInfo?: {
    remark: string;
    accessAddress: {
      postDistrictCode: string;
      postDistrict: string;
      houseNumber: string;
      roadName: string;
    };
    unitAddress: {
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
