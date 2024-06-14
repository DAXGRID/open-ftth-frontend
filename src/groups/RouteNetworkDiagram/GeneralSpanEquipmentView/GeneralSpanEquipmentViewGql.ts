import { Client } from "urql";

export function getSpanEquipmentDetails(
  client: Client,
  spanEquipmentOrSegmentId: string
) {
  return client
    .query<QuerySpanEquipmentDetailsResponse>(
      QUERY_SPAN_EQUIPMENT_DETAILS,
      {
        spanEquipmentOrSegmentId: spanEquipmentOrSegmentId,
      }
    )
    .toPromise();
}


interface QuerySpanEquipmentDetailsResponse {
  utilityNetwork: {
    spanEquipment: SpanEquipment;
  };
}

export interface SpanEquipment {
  name: string;
  description: string;
  specification: {
    name: string;
    description: string;
  };
  markingInfo: {
    markingColor: string;
    markingText: string;
  };
  addressInfo?: {
    remark?: string;
    accessAddress?: {
      postDistrictCode: string;
      postDistrict: string;
      houseNumber: string;
      roadName: string;
    };
    unitAddress?: {
      externalId: string;
      floorName: string;
      suitName: string;
    };
  };
  routeSegmentIds: string[];
}

const QUERY_SPAN_EQUIPMENT_DETAILS = `
query ($spanEquipmentOrSegmentId: ID!) {
  utilityNetwork {
    spanEquipment(spanEquipmentOrSegmentId: $spanEquipmentOrSegmentId) {
      name
      description
      specification {
        name
        description
      }
      markingInfo {
        markingColor
        markingText
      }
      addressInfo {
        remark
        accessAddress {
          postDistrictCode
          postDistrict
          houseNumber
          roadName
        }
        unitAddress {
          externalId
          floorName
          suitName
        }
      }
      routeSegmentIds
    }
  }
}
`
