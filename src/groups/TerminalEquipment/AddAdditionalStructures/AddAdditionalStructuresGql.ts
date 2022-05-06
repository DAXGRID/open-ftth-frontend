import { Client } from "urql";

export function getTerminalStructureSpecifications(client: Client) {
  return client
    .query<TerminalStructureSpecificationResponse>(
      TERMINAL_STRUCTURE_SPECIFICATION_QUERY
    )
    .toPromise();
}

export function addAdditionalStructures(
  client: Client,
  params: AddAdditionalStructuresParams
) {
  return client
    .mutation<AddAdditionalStructuresResponse>(
      ADD_ADDITIONAL_STRUCTURES,
      params
    )
    .toPromise();
}

export interface TerminalStructureSpecification {
  id: string;
  category: string;
  name: string;
  description: string;
  deprecated: boolean;
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
    }
  }
}
`;

interface AddAdditionalStructuresResponse {
  terminalEquipment: {
    addAdditionalStructures: {
      isSuccess: boolean;
      errorCode: string;
      errorMessage: string;
    };
  };
}

interface AddAdditionalStructuresParams {
  routeNodeId: string;
  terminalEquipmentId: string;
  structureSpecificationId: string;
  position: number;
  numberOfStructures: number;
}

const ADD_ADDITIONAL_STRUCTURES = `
mutation (
$routeNodeId: ID!,
$terminalEquipmentId: ID!,
$structureSpecificationId: ID!,
$position: Int!,
$numberOfStructures: Int!
) {
  terminalEquipment {
    addAdditionalStructures(
      routeNodeId: $routeNodeId
      terminalEquipmentId: $terminalEquipmentId
      structureSpecificationId: $structureSpecificationId
      position: $position
      numberOfStructures: $numberOfStructures
    ) {
      isSuccess
      errorCode
      errorMessage
    }
  }
}
`;
