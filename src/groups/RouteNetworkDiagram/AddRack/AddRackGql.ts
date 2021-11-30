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
