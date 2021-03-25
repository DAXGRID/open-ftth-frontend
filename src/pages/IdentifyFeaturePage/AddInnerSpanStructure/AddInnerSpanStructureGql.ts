export interface AddAdditionalInnerSpanStructuresParameter {
  spanEquipmentOrSegmentId: string;
  spanStructureSpecificationIds: string[];
}

export const ADD_ADDITIONAL_INNER_SPAN_STRUCTURES = `
mutation (
  $spanEquipmentOrSegmentId: ID!,
  $spanStructureSpecificationIds: [ID!]!,
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
      description
      outerSpanStructureSpecificationId
      isMultiLevel
    },
  }
}`;
