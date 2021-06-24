export interface NodeContainerDetailsResponse {
  utilityNetwork: {
    nodeContainer: {
      name: string;
      specification: {
        name: string;
      };
      manufacturer: {
        name: string;
      };
    };
  };
}

export const QUERY_NODE_CONTAINER_DETAILS = `
query ($nodeContainerId: ID!) {
  utilityNetwork {
    nodeContainer(nodeContainerId: $nodeContainerId) {
      name
      manufacturer {
        name
      }
      specification {
        name
      }
    }
  }
}
`;
