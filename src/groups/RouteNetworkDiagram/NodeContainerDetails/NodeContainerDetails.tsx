import { useTranslation, TFunction } from "react-i18next";
import { useQuery } from "urql";
import FeatureDetailsContainer from "../FeatureDetailContainer";
import {
  QUERY_NODE_CONTAINER_DETAILS,
  NodeContainerDetailsResponse,
} from "./NodeContainerDetailsGql";

type SpanEquopmentDetailsParams = {
  nodeContainerMrid: string;
  showActions: boolean;
};

function mapContainerResponse(
  x: NodeContainerDetailsResponse | undefined,
  t: TFunction<string>
) {
  if (!x) return [];
  const { specification, manufacturer } = x.utilityNetwork?.nodeContainer;
  return [
    {
      name: t("MANUFACTURER"),
      value: manufacturer?.name ?? t("Unspecified"),
    },
    {
      name: t("SPECIFICATION"),
      value: specification?.name ?? t("Unspecified"),
    },
  ];
}

function NodeContainerDetails({
  nodeContainerMrid,
  showActions,
}: SpanEquopmentDetailsParams) {
  const { t } = useTranslation();
  const [nodeContainerDetailsResponse] = useQuery<NodeContainerDetailsResponse>(
    {
      query: QUERY_NODE_CONTAINER_DETAILS,
      variables: { nodeContainerId: nodeContainerMrid },
      pause: !nodeContainerMrid,
    }
  );

  if (!nodeContainerMrid || nodeContainerDetailsResponse.fetching) return <></>;

  const details = mapContainerResponse(nodeContainerDetailsResponse.data, t);

  return (
    <div className="node-container-details">
      <FeatureDetailsContainer details={details} />
    </div>
  );
}

export default NodeContainerDetails;
