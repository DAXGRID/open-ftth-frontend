import { Client } from "urql";

export const passageViewQuery = (
  client: Client,
  routeNetworkElementId: string,
  spanEquipmentOrSegmentIds: string[]
) => {
  return client
    .query<PassageViewResponse>(PASSAGE_VIEW_QUERY, {
      routeNetworkElementId: routeNetworkElementId,
      spanEquipmentOrSegmentIds: spanEquipmentOrSegmentIds,
    } as PassageViewQueryParams)
    .toPromise();
};

interface Line {
  spanSegmentId: string;
  from: string;
  to: string;
  conduitId: string;
  outerConduitInfo: string;
  innerConduitInfo: string;
  routeSegmentIds: string;
  routeSegmentGeometries: string[];
  segmentLength: number;
  cumulativeDistance: number;
}

interface SpanEquipment {
  id: string;
  category: string;
  specName: string;
  name: string;
  info: string;
  lines: Line[];
}

export interface SpanEquipmentPassageView {
  spanEquipments: SpanEquipment[];
}

interface PassageViewResponse {
  utilityNetwork: {
    spanEquipmentPassageView: SpanEquipmentPassageView;
  };
}

interface PassageViewQueryParams {
  routeNetworkElementId: string;
  spanEquipmentOrSegmentIds: string[];
}

const PASSAGE_VIEW_QUERY = `
query (
$routeNetworkElementId: ID!,
$spanEquipmentOrSegmentIds: [ID!]!
){
  utilityNetwork {
    spanEquipmentPassageView(
      routeNetworkElementId: $routeNetworkElementId
      spanEquipmentOrSegmentIds: $spanEquipmentOrSegmentIds
    ) {
      spanEquipments {
        id
        category
        specName
        name
        info
        lines {
          spanSegmentId
          from
          to
          conduitId
          outerConduitInfo
          innerConduitInfo
          routeSegmentIds
          routeSegmentGeometries
          segmentLength
          cumulativeDistance
        }
      }
    }
  }
}
`;
