import { Client } from "urql";

let exampleResponse: QueryTerminalEquipmentDetailsResponse = {
  utilityNetwork: {
    terminalEquipment: {
      id: "d1073214-ee3c-42ff-be7e-ef50d49044d5",
      name: "63201",
      customProperties: [
        {
          sectionName: "Status",
          properties: [
            { name: "Infrastruktur status", value: "ikke anlagt" },
            { name: "Aarsag", value: "Vi klokkede i den" },
            { name: "Kommentar", value: "Ja, det er lidt noget lort" },
          ],
        },
        {
          sectionName: "Forsyning",
          properties: [
            { name: "POP", value: "Nord energi bla bal" },
            { name: "Gadeskab", value: "BB0379 (katrinegade 10)" },
            { name: "Gadeskab lokation", value: "BB0379 (katrinegade 10)" },
            { name: "Kappefarve", value: "blaa" },
          ],
        },
      ],
      addressInfo: {
        remark: "this is some very important remark",
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

export function getGeneralView(
  client: Client
): QueryTerminalEquipmentDetailsResponse {
  return exampleResponse;
}

export interface TerminalEquipment {
  id: string;
  name: string;
  customProperties: {
    sectionName: String;
    properties: { name: string; value: string }[];
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
