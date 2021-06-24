import { useTranslation } from "react-i18next";
import { useQuery } from "urql";
import {
  QUERY_NODE_CONTAINER_DETAILS,
  NodeContainerDetailsResponse,
} from "./NodeContainerDetailsGql";

type SpanEquopmentDetailsParams = {
  nodeContainerMrid: string;
};

function NodeContainerDetails({
  nodeContainerMrid,
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

  const nodeContainer =
    nodeContainerDetailsResponse.data?.utilityNetwork.nodeContainer;

  return (
    <div className="node-container-details">
      <div className="node-container-details-container">
        <p>{`${t("SPECIFICATION")}: ${
          nodeContainer?.specification.name ?? ""
        }`}</p>
        <p>
          {`${t("MANUFACTURER")}: ${nodeContainer?.manufacturer?.name ?? ""}`}
        </p>
      </div>
    </div>
  );
}

export default NodeContainerDetails;
