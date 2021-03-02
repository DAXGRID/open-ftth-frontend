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

export interface PlaceSpanEquipmentParameters {
  spanEquipmentId: string;
  spanEquipmentSpecificationId: string;
  routeSegmentIds?: string[];
  manufacturerId?: string;
  markingColor?: string;
  markingText?: string;
  namingInfo?: string;
  description?: string;
}

export interface PlaceSpanEquipmentResponse {
  spanEquipment: {
    placSpanEquipmentInRouteNetwork: {
      errorCode?: string;
      isSuccess: boolean;
      errorMesssage?: string;
    };
  };
}

export const PLACE_SPAN_EQUIPMENT_IN_ROUTE_NETWORK = `
mutation (
 $spanEquipmentId: ID!,
 $spanEquipmentSpecificationId: ID!,
 $routeSegmentIds: [ID!]!,
 $manufacturerId: ID,
 $markingColor: String,
 $markingText: String,
 $namingInfoName: String,
 $namingInfoDescription: String)
{
  spanEquipment
  {
    placSpanEquipmentInRouteNetwork(
      spanEquipmentId: $spanEquipmentId,
      spanEquipmentSpecificationId: $spanEquipmentSpecificationId,
      routeSegmentIds: $routeSegmentIds,
      manufacturerId: $manufacturerId,
      markingInfo: {
        markingColor: $markingColor,
        markingText: $markingText
      },
      namingInfo: {
        name: $namingInfoName,
        description: $namingInfoDescription
      }
    )
    {
      isSuccess
      errorCode
      errorMessage
    }
  }
}
`;
