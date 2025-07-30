import { Client } from "urql";

export function getTerminalStructureSpecifications(client: Client) {
  return client
    .query<TerminalStructureSpecificationResponse>(
      TERMINAL_STRUCTURE_SPECIFICATION_QUERY,
      {},
    )
    .toPromise();
}

export function getTerminalStructure(
  client: Client,
  params: TerminalStructureQueryParams,
) {
  return client
    .query<TerminalEquipmentResponse>(TERMINAL_STRUCTURE_QUERY, params)
    .toPromise();
}

export function editInterface(client: Client, params: EditInterfaceParams) {
  return client
    .mutation<AddInterfaceResponse>(EDIT_INTERFACE, params)
    .toPromise();
}

export function getNextPhysicalCircuitId(client: Client) {
  return client
    .query<NextPhysicalCircuitIdResponse>(NEXT_PHYSICAL_CIRCUIT_ID_QUERY, {})
    .toPromise();
}

export interface TerminalStructureSpecification {
  id: string;
  category: string;
  name: string;
  description: string;
  deprecated: boolean;
  isInterfaceModule: boolean;
}

interface TerminalStructureSpecificationResponse {
  utilityNetwork: {
    terminalStructureSpecifications: TerminalStructureSpecification[];
  };
}

const TERMINAL_STRUCTURE_SPECIFICATION_QUERY = `
query {
  utilityNetwork {
    terminalStructureSpecifications {
      id
      category
      name
      description
      deprecated
      isInterfaceModule
    }
  }
}
`;

interface AddInterfaceResponse {
  terminalEquipment: {
    updateTerminalStructureProperties: {
      isSuccess: boolean;
      errorCode: string;
      errorMessage: string;
    };
  };
}

interface EditInterfaceParams {
  terminalEquipmentId: string;
  terminalStructureId: string;
  terminalStructureSpecificationId: string;
  position: number;
  interfaceInfo: {
    interfaceType: string | null;
    slotNumber: number | null;
    subSlotNumber: number | null;
    circuitName: string | null;
  } | null;
}

const EDIT_INTERFACE = `
mutation (
$terminalEquipmentId: ID!,
$terminalStructureId: ID!,
$terminalStructureSpecificationId: ID!,
$position: Int!,
$interfaceInfo: InterfaceInfoInput
) {
  terminalEquipment {
    updateTerminalStructureProperties(
      terminalEquipmentId: $terminalEquipmentId
      terminalStructureId: $terminalStructureId
      terminalStructureSpecificationId: $terminalStructureSpecificationId
      position: $position
      interfaceInfo: $interfaceInfo
    ) {
      isSuccess
      errorCode
      errorMessage
    }
  }
}
`;

interface TerminalStructure {
  id: string;
  name: string;
  description: string;
  position: number;
  specificationId: string;
  interfaceInfo: {
    interfaceType: string | null;
    slotNumber: number | null;
    subSlotNumber: number | null;
    circuitName: string | null;
    portNumber: number | null;
  } | null;
}

interface TerminalEquipmentResponse {
  utilityNetwork: {
    terminalStructure: TerminalStructure;
  };
}

interface TerminalStructureQueryParams {
  terminalEquipmentOrTerminalId: string;
  terminalStructureId: string;
}

export const TERMINAL_STRUCTURE_QUERY = `
query(
  $terminalEquipmentOrTerminalId: ID!,
  $terminalStructureId: ID! 
) {
  utilityNetwork {
    terminalStructure(
      terminalEquipmentOrTerminalId: $terminalEquipmentOrTerminalId
      terminalStructureId: $terminalStructureId)
    {
      id
      name
      description
      position
      specificationId
      interfaceInfo {
        interfaceType
        slotNumber
        subSlotNumber
        circuitName
        portNumber
      }
    }
  }
}`;

interface NextPhysicalCircuitIdResponse {
  utilityNetwork: {
    getNextPhysicalCircuitId: string;
  };
}

const NEXT_PHYSICAL_CIRCUIT_ID_QUERY = `
query {
  utilityNetwork {
    getNextPhysicalCircuitId
  }
}
`;
