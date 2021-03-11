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
