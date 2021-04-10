import { useContext } from "react";
import DefaultButton from "../../../components/DefaultButton";
import { useClient, Client } from "urql";
import useBridgeConnector from "../../../bridge/useBridgeConnector";
import { MapContext } from "../../../contexts/MapContext";
import {
  QUERY_GET_ROUTESEGMENT_IDS,
  GetRouteSegmentIdsParameter,
  GetRouteSegmentIdsResponse,
  MUTATION_REROUTE,
  RerouteParameter,
  RerouteResponse,
} from "./RerouteTubeGql";

type RerouteTubeParams = {
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

const reroute = async (
  id: string,
  routeSegmentIds: string[],
  client: Client
) => {
  const params: RerouteParameter = {
    spanEquipmentOrSegmentId: id,
    routeSegmentIds: routeSegmentIds,
  };

  const result = await client
    .mutation<RerouteResponse>(MUTATION_REROUTE, params)
    .toPromise();
};

function RerouteTube({ selectedRouteSegmentMrid }: RerouteTubeParams) {
  const client = useClient();
  const { selectRouteSegments } = useBridgeConnector();
  const { selectedSegmentIds } = useContext(MapContext);

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
      <DefaultButton
        onClick={() =>
          reroute(selectedRouteSegmentMrid, selectedSegmentIds, client)
        }
        innerText="Reroute"
      />
    </div>
  );
}

export default RerouteTube;
