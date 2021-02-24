export interface UtilityNetwork {
  spanEquipmentSpecification: SpanEquipmentSpecification[];
}

interface SpanEquipmentSpecification {
  id: string;
  category: string;
  name: string;
  deprecated: boolean;
  manufacturerRefs: string[];
}

export const SPAN_EQUIPMENT_SPEFICIATIONS_QUERY = `
query {
  utilityNetwork {
    spanEquipmentSpecifications {
      id
      category
      name
      description
      deprecated
      manufacturerRefs
    }
  }
}`;
