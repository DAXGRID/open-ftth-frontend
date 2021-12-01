export interface RackSpecification {
  id: string;
  name: string;
}

export interface RackSpecificationsResponse {
  utilityNetwork: {
    rackSpecifications: RackSpecification[];
  };
}

export const QUERY_RACK_SPECIFICATIONS = `
query {
  utilityNetwork {
    rackSpecifications {
      id
      name
    }
  }
}`;

export interface PlaceRackInContainerParameter {
  nodeContainerId: string;
  rackId: string;
  rackName: string;
  rackSpecificationId: string;
  rackHeightInUnits: number;
}

export interface PlaceRackInContainerResponse {
  nodeContainer: {
    placeRackInNodeContainer: {
      isSuccess: boolean;
      errorCode?: string;
    };
  };
}

export const PLACE_RACK_IN_CONTAINER = `
mutation (
  $nodeContainerId: ID!,
  $rackId: ID!,
  $rackName: String!,
  $rackSpecificationId: ID!,
  $rackHeightInUnits: Int!
) {
  nodeContainer {
    placeRackInNodeContainer(
      nodeContainerId: $nodeContainerId
      rackId: $rackId
      rackName: $rackName
      rackSpecificationId: $rackSpecificationId
      rackHeightInUnits: $rackHeightInUnits
    )
    {
      isSuccess
      errorCode
    }
  }
}`;
