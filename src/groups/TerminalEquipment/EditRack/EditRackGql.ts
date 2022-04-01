import { Client } from "urql";

export function queryRackSpecifications(client: Client) {
  return client
    .query<RackSpecificationsResponse>(QUERY_RACK_SPECIFICATIONS)
    .toPromise();
}

export function queryRack(client: Client, routeNodeId: string, rackId: string) {
  return client
    .query<RackResponse>(QUERY_RACK, { routeNodeId, rackId } as QueryRackParams)
    .toPromise();
}

export function updateRack(client: Client, params: UpdateRackParams) {
  return client.mutation<UpdateRackResponse>(UPDATE_RACK, params).toPromise();
}

export interface RackSpecification {
  id: string;
  name: string;
}

interface RackSpecificationsResponse {
  utilityNetwork: {
    rackSpecifications: RackSpecification[];
  };
}

const QUERY_RACK_SPECIFICATIONS = `
query {
  utilityNetwork {
    rackSpecifications {
      id
      name
    }
  }
}`;

interface RackResponse {
  utilityNetwork: {
    rack: Rack;
  };
}

interface Rack {
  name: string;
  heightInUnits: number;
  specificationId: string;
}

interface QueryRackParams {
  routeNodeId: string;
  rackId: string;
}

const QUERY_RACK = `
query (
  $routeNodeId: ID!,
  $rackId: ID!
) {
  utilityNetwork {
    rack(routeNodeId: $routeNodeId, rackId: $rackId) {
      name
      heightInUnits
      specificationId
    }
  }
}
`;

interface UpdateRackResponse {
  nodeContainer: {
    updateRackProperties: {
      isSuccess: boolean;
      errorCode: string;
      erorrMessage: string;
    };
  };
}

interface UpdateRackParams {
  routeNodeId: string;
  rackId: string;
  name: string;
  specificationId: string;
  heightInUnits: number;
}

const UPDATE_RACK = `
mutation (
$routeNodeId: ID!,
$rackId: ID!,
$name: String!,
$specificationId: ID!,
$heightInUnits: Int!
) {
  nodeContainer {
    updateRackProperties(
      routeNodeId: $routeNodeId
      rackId: $rackId
      name: $name
      specificationId: $specificationId
      heightInUnits: $heightInUnits
    ) {
      isSuccess
      errorCode
      errorMessage
    }
  }
}`;
