import { Client } from "urql";

export function getTerminalStructureSpecifications(client: Client) {
  return client
    .query<TerminalStructureSpecificationResponse>(
      TERMINAL_STRUCTURE_SPECIFICATION_QUERY,
      {},
    )
    .toPromise();
}

export function addInterface(client: Client, params: AddInterfaceParams) {
  return client
    .mutation<AddInterfaceResponse>(ADD_INTERFACE, params)
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

interface AddInterfaceResponse {
  terminalEquipment: {
    addInterface: {
      isSuccess: boolean;
      errorCode: string;
      errorMessage: string;
    };
  };
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

interface AddInterfaceParams {
  routeNodeId: string;
  terminalEquipmentId: string;
  structureSpecificationId: string;
  interfaceInfo: {
    interfaceType: string | null;
    slotNumber: number | null;
    subSlotNumber: number | null;
    portNumber: number | null;
    circuitName: string | null;
  } | null;
}

const ADD_INTERFACE = `
mutation (
$routeNodeId: ID!,
$terminalEquipmentId: ID!,
$structureSpecificationId: ID!,
$interfaceInfo: InterfaceInfoInput
) {
  terminalEquipment {
    addInterface(
      routeNodeId: $routeNodeId
      terminalEquipmentId: $terminalEquipmentId
      structureSpecificationId: $structureSpecificationId
      interfaceInfo: $interfaceInfo
    ) {
      isSuccess
      errorCode
      errorMessage
    }
  }
}
`;

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
