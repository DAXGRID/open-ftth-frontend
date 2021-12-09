import { useState, useEffect, useContext } from "react";
import { useTranslation, TFunction } from "react-i18next";
import { useQuery } from "urql";
import FeatureDetailsContainer from "../FeatureDetailContainer";
import {
  QUERY_NODE_CONTAINER_DETAILS,
  NodeContainerDetailsResponse,
} from "./NodeContainerDetailsGql";
import { EditPropertiesSvg } from "../../../assets";
import ModalContainer from "../../../components/ModalContainer";
import EditNodeContainer from "../EditNodeContainer";
import { OverlayContext } from "../../../contexts/OverlayContext";

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
  const { showElement } = useContext(OverlayContext);
  const [showEditNodeContainer, setShowEditNodeContainer] = useState(false);
  const [nodeContainerDetailsResponse] = useQuery<NodeContainerDetailsResponse>(
    {
      query: QUERY_NODE_CONTAINER_DETAILS,
      variables: { nodeContainerId: nodeContainerMrid },
      pause: !nodeContainerMrid,
    }
  );

  useEffect(() => {
    if (showEditNodeContainer) {
      showElement(
        <ModalContainer
          title={t("EDIT_NODE_CONTAINER")}
          show={showEditNodeContainer}
          closeCallback={() => setShowEditNodeContainer(false)}
        >
          <EditNodeContainer nodeContainerMrid={nodeContainerMrid ?? ""} />
        </ModalContainer>
      );
    } else {
      showElement(null);
    }
  }, [showEditNodeContainer, t, nodeContainerMrid, showElement]);

  if (!nodeContainerMrid || nodeContainerDetailsResponse.fetching) return <></>;

  const details = mapContainerResponse(nodeContainerDetailsResponse.data, t);

  return (
    <div className="node-container-details">
      <FeatureDetailsContainer
        details={details}
        showActions={showActions}
        actions={[
          {
            action: () => setShowEditNodeContainer(true),
            icon: EditPropertiesSvg,
            title: t("EDIT"),
            disabled: false,
            key: 0,
          },
        ]}
      />
    </div>
  );
}

export default NodeContainerDetails;
