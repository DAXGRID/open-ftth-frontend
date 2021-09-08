export type AccessAddress = {
  roadName: string;
  postDistrictCode: string;
  postDistrict: string;
  houseNumber: string;
};

export type UnitAddress = {
  floorName: string;
  suitName: string;
};

export type SpanEquipmentDetailsResponse = {
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
      addressInfo: {
        remark: string;
        accessAddress: AccessAddress;
        unitAddress: UnitAddress;
      };
    };
  };
};

export const QUERY_SPAN_EQUIPMENT_DETAILS = `
query ($spanEquipmentOrSegmentId: ID!){
  utilityNetwork {
    spanEquipment(
      spanEquipmentOrSegmentId: $spanEquipmentOrSegmentId)
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
      addressInfo {
        remark
        accessAddress {
          id
          roadName
          postDistrictCode
          postDistrict
          houseNumber
        }
        unitAddress {
          id
          floorName
          suitName
        }
      }
    }
  }
}
`;
