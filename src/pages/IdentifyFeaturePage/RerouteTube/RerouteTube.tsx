import DefaultButton from "../../../components/DefaultButton";
import { useClient, Client } from "urql";
import useBridgeConnector from "../../../bridge/useBridgeConnector";
import {
  GetRouteSegmentIdsParameter,
  GetRouteSegmentIdsResponse,
  QUERY_GET_ROUTESEGMENT_IDS,
} from "./RerouteTubeGql";

type ReRouteTubeParams = {
  selectedRouteSegmentMrid: string;
};

const selectRouteSegmentsInMap = async (
  id: string,
  client: Client,
  selectRouteSegments: (mrids: string[]) => void
) => {
  const params: GetRouteSegmentIdsParameter = {
    spanEquipmentOrSegmentId: id,
  };

  const result = await client
    .query<GetRouteSegmentIdsResponse>(QUERY_GET_ROUTESEGMENT_IDS, params)
    .toPromise();

  const mrids = result.data?.utilityNetwork.spanEquipment.routeSegmentIds;
  selectRouteSegments(mrids ?? []);
};

function RerouteTube({ selectedRouteSegmentMrid }: ReRouteTubeParams) {
  const client = useClient();
  const { selectRouteSegments } = useBridgeConnector();

  return (
    <div>
      <DefaultButton
        onClick={() =>
          selectRouteSegmentsInMap(
            selectedRouteSegmentMrid,
            client,
            selectRouteSegments
          )
        }
        innerText="Select route segments in map"
      />
    </div>
  );
}

export default RerouteTube;
