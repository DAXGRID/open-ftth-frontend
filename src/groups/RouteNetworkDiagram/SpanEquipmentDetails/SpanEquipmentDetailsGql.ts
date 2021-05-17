export interface SpanEquipmentDetailsResponse {
  utilityNetwork: {
    spanEquipment: {
      name: string;
      specification: {
        isFixed: boolean;
        description: string;
      };
      markingInfo: {
        markingColor: string;
      };
      manufacturer: {
        name: string;
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
      name
      specification {
        isFixed
        description
      }
      markingInfo {
        markingColor
      }
      manufacturer {
        name
      }
    }
  }
}
`;
