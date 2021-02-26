export interface UtilityNetworkResponse {
  utilityNetwork: UtilityNetwork;
}

interface UtilityNetwork {
  spanEquipmentSpecifications: SpanEquipmentSpecification[];
  manufacturers: Manufacturer[];
}

export interface SpanEquipmentSpecification {
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
    manufacturers {
      id
      name
      description
      deprecated
    }
  }
}`;
