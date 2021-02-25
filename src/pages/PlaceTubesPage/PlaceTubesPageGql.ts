export interface UtilityNetworkResponse {
  utilityNetwork: UtilityNetwork;
}

interface UtilityNetwork {
  spanEquipmentSpecifications: SpanEquipmentSpecification[];
  manufacturer: Manufacturer[];
}

interface SpanEquipmentSpecification {
  id: string;
  category: string;
  name: string;
  deprecated: boolean;
  manufacturerRefs: string[];
}

interface Manufacturer {
  id: string;
  name: string;
  description: string;
  deprecated: boolean;
}

export const SPAN_EQUIPMENT_SPEFICIATIONS_MANUFACTURER_QUERY = `
query {
  utilityNetwork {
    spanEquipmentSpecifications {
      id
      category
      name
      description
      deprecated
      manufacturerRefs
    },
    manufacturer {
      id
      name
      description
      deprecated
    }
  }
}`;
