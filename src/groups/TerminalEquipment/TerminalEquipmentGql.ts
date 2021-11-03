import terminalEquipmentData from "./terminalEquipmentData.json";

type ParentNodeStructure = {
  id: string;
  category: string;
  name: string;
  specName: string;
  info: string | null;
};

type Line = {
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

type TerminalStructure = {
  id: string;
  category: string;
  name: string;
  specName: string;
  info: string | null;
  lines: Line[];
};

type TerminalEquipment = {
  id: string;
  parentNodeStructureId: string;
  category: string;
  name: string;
  specName: string;
  info: string | null;
  terminalStructures: TerminalStructure[];
};

export type TerminalEquipmentResponse = {
  parentNodeStructures: ParentNodeStructure[];
  terminalEquipment: TerminalEquipment[];
};

export function getTerminalEquipment(): TerminalEquipmentResponse {
  return terminalEquipmentData;
}
