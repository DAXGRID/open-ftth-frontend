export type ParentNodeStructure = {
  id: string;
  category: string;
  name: string;
  specName: string;
  info: string | null;
};

export type Line = {
  connectorSymbol: string;
  a: {
    terminal: {
      id: string;
      name: string;
    };
    connectedTo: string | null;
    end: string | null;
  } | null;
  z: {
    terminal: {
      id: string;
      name: string;
    };
    connectedTo: string | null;
    end: string | null;
  } | null;
};

export type TerminalStructure = {
  id: string;
  category: string;
  name: string;
  specName: string;
  info: string | null;
  lines: Line[];
};

export type TerminalEquipment = {
  id: string;
  parentNodeStructureId: string;
  category: string;
  name: string;
  specName: string;
  info: string | null;
  terminalStructures: TerminalStructure[];
};

export type TerminalEquipmentResponse = {
  utilityNetwork: {
    terminalEquipmentConnectivityView: {
      parentNodeStructures: ParentNodeStructure[];
      terminalEquipments: TerminalEquipment[];
    };
  };
};

export const TERMINAL_EQUIPMENT_CONNECTIVITY_VIEW_QUERY = `
query (
$routeNodeId: ID!,
$terminalEquipmentOrRackId: ID!
) {
  utilityNetwork {
    terminalEquipmentConnectivityView(
      routeNodeId: $routeNodeId
      terminalEquipmentOrRackId: $terminalEquipmentOrRackId
    ) {
      parentNodeStructures {
        id
        name
        specName
      }
      terminalEquipments {
        id
        parentNodeStructureId
        name
        category
        specName
        terminalStructures {
          id
          name
          specName
          info
          lines {
            connectorSymbol
            a {
              terminal {
                id
                name
              }
              connectedTo
              end
            }
            z {
              terminal {
                id
                name
              }
              connectedTo
              end
            }
          }
        }
      }
    }
  }
}
`;
