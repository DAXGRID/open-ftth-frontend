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
      description: string;
      name: string;
      specification: {
        category: string;
        id: string;
      };
      markingInfo: {
        markingColor: string;
        markingText: string;
      };
      manufacturer: {
        id: string;
      };
      addressInfo: {
        remark: string;
        accessAddress: {
          id: string;
        };
        unitAddress: {
          id: string;
        };
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
      description
      specification {
        category
        id
      }
      markingInfo {
        markingColor
        markingText
      }
      manufacturer {
        id
      }
      addressInfo {
        remark
        accessAddress {
          id
        }
        unitAddress {
          id
        }
      }
    }
  }
}
`;

export interface UpdateSpanEquipmentDetailsParameters {
  name: string | null;
  description: string | null;
  spanEquipmentOrSegmentId: string;
  markingColor: string | null;
  markingText: string | null;
  manufacturerId: string;
  spanEquipmentSpecificationId: string;
  accessAddressId: string | null;
  unitAddressId: string | null;
  remark: string | null;
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
 $name: String,
 $description: String,
 $spanEquipmentOrSegmentId: ID!,
 $markingColor: String,
 $markingText: String,
 $manufacturerId: ID!,
 $spanEquipmentSpecificationId: ID!,
 $accessAddressId: ID,
 $unitAddressId: ID,
 $remark: String) {
  spanEquipment {
    updateProperties(
      namingInfo: {
        description: $description
        name: $name
      }
      spanEquipmentOrSegmentId: $spanEquipmentOrSegmentId
      markingInfo: {
        markingColor: $markingColor
        markingText: $markingText
      }
      manufacturerId: $manufacturerId
      spanEquipmentSpecificationId: $spanEquipmentSpecificationId,
      addressInfo: {
        accessAddressId: $accessAddressId
        unitAddressId: $unitAddressId
        remark: $remark
      }
    ) {
      isSuccess
      errorCode
    }
  }
}
`;

export type UnitAddress = {
  id: string;
  floorName: string;
  suitName: string;
  externalId: string;
};

type AccessAddress = {
  id: string;
  roadName: string;
  houseNumber: string;
  townName: string;
  postDistrict: string;
  unitAddresses: UnitAddress[];
};

export type NearestAccessAddress = {
  distance: number;
  accessAddress: AccessAddress;
};

export type NearestAccessAddressesResponse = {
  addressService: {
    nearestAccessAddresses: NearestAccessAddress[];
  };
};

export const NEAREST_ACCESS_ADDRESSES_QUERY = `
query($spanEquipmentOrSegmentId: ID!) {
  addressService {
    nearestAccessAddresses(spanEquipmentOrSegmentId: $spanEquipmentOrSegmentId, maxHits: 100) {
      distance
      accessAddress {
        id
        roadName
        houseNumber
        townName
        postDistrict
        unitAddresses {
          id
          floorName
          suitName
          externalId
        }
      }
    }
  }
}`;
