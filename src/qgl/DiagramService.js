import { gql } from "apollo-boost";
import { useQuery } from "@apollo/react-hooks";
import * as data from "../mock/RouteNodeDiagramObjectsExample.json";

function DiagramService() {
  return data;
}

export default DiagramService;
