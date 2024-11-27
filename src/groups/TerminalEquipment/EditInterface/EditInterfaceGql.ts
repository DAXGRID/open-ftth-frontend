import { Client } from "urql";

export function getTerminalStructureSpecifications(client: Client) {
  return client
    .query<TerminalStructureSpecificationResponse>(
      TERMINAL_STRUCTURE_SPECIFICATION_QUERY, {}
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
