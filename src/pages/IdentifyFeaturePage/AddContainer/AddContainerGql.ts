export interface UtilityNetworkResponse {
  utilityNetwork: UtilityNetwork;
}

interface UtilityNetwork {
  nodeContainerSpecifications: NodeContainerSpecification[];
  manufacturers: Manufacturer[];
}

export interface NodeContainerSpecification {
  id: string;
  category: string;
  name: string;
  deprecated: boolean;
  manufacturerRefs: string[];
}

export interface Manufacturer {
  id: string;
  name: string;
  description: string;
  deprecated: boolean;
}

export const NODE_CONTAINER_SPECIFICATIONS_QUERY = `
query {
  utilityNetwork {
    nodeContainerSpecifications {
      id
      category
      name
      description
      deprecated
      manufacturerRefs
    },
    manufacturers {
      id
      name
      description
      deprecated
    }
  }
}`;

export interface PlaceNodeContainerParameters {
  routeNodeId: string;
  nodeContainerId: string;
  nodeContainerSpecificationId: string;
  manufacturerId: string | null;
}

export interface PlaceNodeContainerResponse {
  nodeContainer: {
    placeNodeContainerInRouteNetwork: {
      errorCode?: string;
      isSuccess: boolean;
      errorMesssage?: string;
    };
  };
}

export const PLACE_NODE_CONTAINER_IN_ROUTE_NETWORK = `
mutation (
  $routeNodeId: ID!,
  $nodeContainerId: ID!,
  $nodeContainerSpecificationId: ID!,
  $manufacturerId: ID)
{
  nodeContainer
  {
    placeNodeContainerInRouteNetwork(
      routeNodeId: $routeNodeId,
      nodeContainerId: $nodeContainerId,
      nodeContainerSpecificationId: $nodeContainerSpecificationId,
      manufacturerId: $manufacturerId
    )
    {
      isSuccess
      errorCode
    }
  }
}
`;
