import { Client } from "urql";

interface Node {
  value: string;
  id: string;
  label: string;
  nodes: Node[];
}

const nodes: Node = {
  value: "Node 1",
  id: "69b93498-3c08-432b-80e7-830b99913f0c",
  label: "",
  nodes: [],
};

function getInformation(client: Client) {}
