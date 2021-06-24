export interface NodeContainerDetailsResponse {
  utilityNetwork: {
    nodeContainer: {
      specification: {
        id: string;
        category: string;
      };
      manufacturer: {
        id: string;
      };
    };
  };
}

export const QUERY_NODE_CONTAINER_DETAILS = `
query ($nodeContainerId: ID!) {
  utilityNetwork {
    nodeContainer(nodeContainerId: $nodeContainerId) {
      manufacturer {
        id
      }
      specification {
        id
        category
      }
    }
  }
}
`;

export interface NodeContainerSpecificationsResponse {
  utilityNetwork: {
    nodeContainerSpecifications: NodeContainerSpecification[];
    manufacturers: Manufacturer[];
  };
}

export interface NodeContainerSpecification {
  id: string;
  category: string;
  name: string;
  description: string;
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

export type MutationUpdateNodeContainerParams = {
  nodeContainerId: string;
  specificationId: string;
  manufacturerId: string | null;
};

export type MutationUpdateNodeContainerResponse = {
  nodeContainer: {
    updateProperties: {
      isSuccess: boolean;
      errorMessage: string;
      errorCode: string;
    };
  };
};

export const MUTATION_UPDATE_NODE_CONTAINER = `
mutation ($nodeContainerId: ID!,
          $specificationId: ID!,
          $manufacturerId: ID) {
  nodeContainer {
    updateProperties (nodeContainerId: $nodeContainerId,
                      specificationId: $specificationId,
                      manufacturerId: $manufacturerId) {
      isSuccess
      errorMessage
      errorCode
    }
  }
}
`;
