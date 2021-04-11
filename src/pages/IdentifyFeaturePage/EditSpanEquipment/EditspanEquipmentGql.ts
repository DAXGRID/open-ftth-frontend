export interface SpanEquipmentSpecificationsResponse {
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

export const QUERY_SPAN_EQUIPMENT_SPECIFICATIONS_MANUFACTURER = `
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

export interface SpanEquipmentDetailsResponse {
  utilityNetwork: {
    spanEquipment: {
      specification: {
        category: string;
        id: string;
      };
      markingInfo: {
        markingColor: string;
      };
      manufacturer: {
        id: string;
      };
    };
  };
}

export const QUERY_SPAN_EQUIPMENT_DETAILS = `
query ($spanEquipmentOrSegmentId: ID!){
  utilityNetwork {
    spanEquipment(
      spanEquipmentOrSegmentId: $spanEquipmentOrSegmentId
    )
    {
      specification {
        category
        id
      }
      markingInfo {
        markingColor
      }
      manufacturer {
        id
      }
    }
  }
}
`;

export interface UpdateSpanEquipmentDetailsParameters {
  spanEquipmentOrSegmentId: string;
  markingColor: string;
  manufacturerId: string;
  spanEquipmentSpecificationId: string;
}

export interface UpdateSpanEquipmentDetailsResponse {
  spanEquipment: {
    updateProperties: {
      isSuccess: boolean;
      errorCode: string;
    };
  };
}

export const MUTATION_UPDATE_SPAN_EQUIPMENT_DETAILS = `
mutation (
 $spanEquipmentOrSegmentId: ID!,
 $markingColor: String,
 $manufacturerId: ID!,
 $spanEquipmentSpecificationId: ID!) {
  spanEquipment {
    updateProperties(
      spanEquipmentOrSegmentId: $spanEquipmentOrSegmentId,
      markingInfo: { markingColor: $markingColor },
      manufacturerId: $manufacturerId,
      spanEquipmentSpecificationId: $spanEquipmentSpecificationId
    ) {
      isSuccess
      errorCode
    }
  }
}
`;
