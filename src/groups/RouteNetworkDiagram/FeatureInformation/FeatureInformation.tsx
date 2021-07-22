import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "urql";
import { MapContext } from "../../../contexts/MapContext";
import {
  QUERY_ROUTE_NETWORK_ELEMENT,
  QueryRouteNetworkElementResponse,
} from "./FeatureInformationGql";

function FeatureInformation() {
  const { t } = useTranslation();
  const { identifiedFeature } = useContext(MapContext);
  const [routeNetworkElementResponse] =
    useQuery<QueryRouteNetworkElementResponse>({
      query: QUERY_ROUTE_NETWORK_ELEMENT,
      variables: {
        routeElementId: identifiedFeature?.id,
      },
      pause: !identifiedFeature?.id,
    });

  const routeElement =
    routeNetworkElementResponse.data?.routeNetwork.routeElement;

  if (!routeElement) return <></>;

  return (
    <div className="feature-information">
      <div className="feature-informations">
        <p>
          <strong>{t("Name")}</strong>
          {`: ${routeElement.namingInfo?.name ?? ""}`}
        </p>
        <p>
          <strong>{t("Kind")}</strong>
          {`: ${t(routeElement.routeNodeInfo?.kind ?? "")}`}
        </p>
        <p>
          <strong>{t("Function")}</strong>
          {`: ${t(routeElement.routeNodeInfo?.function ?? "")}`}
        </p>
      </div>
    </div>
  );
}

export default FeatureInformation;
