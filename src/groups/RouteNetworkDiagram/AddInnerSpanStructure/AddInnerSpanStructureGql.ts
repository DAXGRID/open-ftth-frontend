export interface AddAdditionalInnerSpanStructuresParameter {
  spanEquipmentOrSegmentId: string;
  spanStructureSpecificationIds: string[];
}

export interface AddAdditionalInnerSpanStructuresResponse {
  spanEquipment: {
    addAdditionalInnerSpanStructures: {
      errorCode?: string;
      isSuccess: boolean;
    };
  };
}

export const ADD_ADDITIONAL_INNER_SPAN_STRUCTURES = `
mutation (
  $spanEquipmentOrSegmentId: ID!,
  $spanStructureSpecificationIds: [ID]!,
) {
  spanEquipment {
    addAdditionalInnerSpanStructures(
      spanEquipmentOrSegmentId: $spanEquipmentOrSegmentId
      spanStructureSpecificationIds: $spanStructureSpecificationIds
    )
    {
      isSuccess
      errorCode
      errorMessage
    }
  }
}
`;

export interface SpanEquipmentSpecification {
  description: string;
  outerSpanStructureSpecificationId: string;
  isMultiLevel: boolean;
  id: string;
}

export interface SpanEquipmentSpecificationsResponse {
  utilityNetwork: {
    spanEquipmentSpecifications: SpanEquipmentSpecification[];
  };
}

export const SPAN_EQUIPMENT_SPEFICIATIONS_QUERY = `
query {
  utilityNetwork {
    spanEquipmentSpecifications {
      id
      description
      outerSpanStructureSpecificationId
      isMultiLevel
    },
  }
}`;
