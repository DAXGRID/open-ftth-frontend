import { useContext } from "react";
import DefaultButton from "../../../components/DefaultButton";
import { useClient, Client } from "urql";
import useBridgeConnector from "../../../bridge/useBridgeConnector";
import { MapContext } from "../../../contexts/MapContext";
import { toast } from "react-toastify";
import {  useTranslation } from "react-i18next";
import { TFunction } from "i18next";
import {
  QUERY_GET_ROUTESEGMENT_IDS,
  GetRouteSegmentIdsParameter,
  GetRouteSegmentIdsResponse,
  MUTATION_REROUTE,
  RerouteParameter,
  RerouteResponse,
} from "./RerouteSpanEquipmentGql";

type RerouteTubeParams = {
  selectedRouteSegmentMrid: string;
};

const selectRouteSegmentsInMap = async (
  id: string,
  client: Client,
  selectRouteSegments: (mrids: string[]) => void,
  highlightFeatures: (mrids: string[]) => void,
  t: TFunction<string>
) => {
  const params: GetRouteSegmentIdsParameter = {
    spanEquipmentOrSegmentId: id,
  };

  // We remove the highlighted so it does not conflict with the selection.
  highlightFeatures([]);

  const result = await client
    .query<GetRouteSegmentIdsResponse>(QUERY_GET_ROUTESEGMENT_IDS, params)
    .toPromise();

  const mrids =
    result.data?.utilityNetwork?.spanEquipment?.routeSegmentIds ?? [];
  selectRouteSegments(mrids ?? []);

  toast.success(t("SELECTED"));
};

const reroute = async (
  id: string,
  routeSegmentIds: string[],
  client: Client,
  t: TFunction<string>
) => {
  const params: RerouteParameter = {
    spanEquipmentOrSegmentId: id,
    routeSegmentIds: routeSegmentIds,
  };

  const result = await client
    .mutation<RerouteResponse>(MUTATION_REROUTE, params)
    .toPromise();

  if (result.data?.spanEquipment.move.isSuccess) {
    toast.success(t("SUCCESS_MOVED"));
  } else {
    toast.error(t(result.data?.spanEquipment.move.errorCode ?? "ERROR"));
  }
};

function RerouteSpanEquipment({ selectedRouteSegmentMrid }: RerouteTubeParams) {
  const client = useClient();
  const { selectRouteSegments, highlightFeatures } = useBridgeConnector();
  const { selectedSegmentIds } = useContext(MapContext);
  const { t } = useTranslation();

  return (
    <div className="reroute-span-equipment">
      <div className="full-row gap-default">
        <DefaultButton
          onClick={() =>
            selectRouteSegmentsInMap(
              selectedRouteSegmentMrid,
              client,
              selectRouteSegments,
              (mrids: string[]) => {
                highlightFeatures(mrids, null);
              },
              t
            )
          }
          innerText={t("SELECT")}
        />
        <DefaultButton
          onClick={() =>
            reroute(selectedRouteSegmentMrid, selectedSegmentIds, client, t)
          }
          innerText={t("MOVE")}
        />
      </div>
    </div>
  );
}

export default RerouteSpanEquipment;
