import { useEffect, useState, useMemo } from "react";
import { useClient } from "urql";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import DefaultButton from "../../../components/DefaultButton";
import LabelContainer from "../../../components/LabelContainer";
import SelectMenu, { SelectOption } from "../../../components/SelectMenu";
import {
  getNearestUndocumentedInstallations,
  getTerminalSpecifications,
  placeTerminalEquipmentInNodeContainer,
  Installation,
  TerminalEquipmentSpecification,
} from "./AddInstallationGql";

interface AddInstallationProps {
  routeNodeId: string;
}

function AddInstallation({ routeNodeId }: AddInstallationProps) {
  const client = useClient();
  const { t } = useTranslation();
  const [
    nearestUndocumentedInstallations,
    setNearestUndocumentedInstallations,
  ] = useState<Installation[]>([]);

  const [terminalSpecifications, setTerminalSpecifications] = useState<
    TerminalEquipmentSpecification[]
  >([]);

  const [selectedInstallationId, setselectedInstallationId] = useState<
    string | null
  >(null);

  const [selectedSpecificationId, setSelectedSpecificationId] = useState<
    string | null
  >(null);

  useEffect(() => {
    if (!routeNodeId) return;

    getNearestUndocumentedInstallations(client, {
      maxHits: 10,
      routeNodeId: routeNodeId,
      searchRadiusMeter: 1000,
    }).then((data) => {
      if (data.data?.installation.nearestUndocumentedInstallations) {
        setNearestUndocumentedInstallations(
          data.data.installation.nearestUndocumentedInstallations,
        );
      } else {
        console.error(
          "Could not load installation.nearestUndocumentedInstallations, received following value",
          data.data?.installation.nearestUndocumentedInstallations,
        );
      }
    });

    getTerminalSpecifications(client, {}).then((data) => {
      if (data.data?.utilityNetwork.terminalEquipmentSpecifications) {
        setTerminalSpecifications(
          data.data?.utilityNetwork.terminalEquipmentSpecifications,
        );
      } else {
        console.error(
          "Could not load utilityNetwork.terminalEquipmentSpecifications, received following value",
          data.data?.utilityNetwork.terminalEquipmentSpecifications,
        );
      }
    });
  }, [client, routeNodeId]);

  const installationOptions = useMemo(() => {
    if (nearestUndocumentedInstallations.length === 0) {
      return [];
    }

    return nearestUndocumentedInstallations.map<SelectOption>((x) => {
      return {
        text: `${x.installationId} (${x.displayAddress} ${x.additionalAddressInformation ? ` - ${x.additionalAddressInformation}` : ""})`,
        value: x.installationId,
        key: x.installationId,
      };
    });
  }, [nearestUndocumentedInstallations]);

  const terminalSpecificationsOptions = useMemo(() => {
    if (terminalSpecifications.length === 0) {
      return [];
    }

    return terminalSpecifications
      .filter((x) => x.isCustomerTermination)
      .map<SelectOption>((x) => {
        return {
          text: x.name,
          value: x.id,
          key: x.id,
        };
      });
  }, [terminalSpecifications]);

  const executeAdd = () => {
    const selectedInstallation = nearestUndocumentedInstallations.find(
      (x) => x.installationId === selectedInstallationId,
    );

    if (!selectedInstallation) {
      throw Error(
        `Could not find installation on installation id: '{selectedInstallationId}'`,
      );
    }

    placeTerminalEquipmentInNodeContainer(client, {
      routeNodeId: routeNodeId,
      terminalEquipmentSpecificationId: selectedSpecificationId,
      manufacturerId: null,
      numberOfEquipments: 1,
      startSequenceNumber: 1,
      namingInfo: { name: selectedInstallation.installationId },
      terminalEquipmentNamingMethod: "NAME_ONLY",
      remark: selectedInstallation.additionalAddressInformation,
      unitAddressId: null,
      accessAddressId: null,
      subrackPlacementInfo: null,
    }).then((response) => {
      if (
        !response.data?.nodeContainer?.placeTerminalEquipmentInNodeContainer
          ?.isSuccess
      ) {
        toast.error(
          t(
            response.data?.nodeContainer?.placeTerminalEquipmentInNodeContainer
              ?.errorCode ?? "ERROR",
          ),
        );
      } else {
        toast.success(t("ADDED"));
      }
    });
  };

  return (
    <div className="full-row-group">
      <div className="full-row">
        <LabelContainer text={t("SPECIFICATION")}>
          <SelectMenu
            selected={selectedSpecificationId}
            options={terminalSpecificationsOptions}
            onSelected={(x) => setSelectedSpecificationId(x)}
            autoSelectFirst={true}
          />
        </LabelContainer>
      </div>
      <div className="full-row">
        <LabelContainer text={t("INSTALLATION")}>
          <SelectMenu
            maxHeight={"250px"}
            selected={selectedInstallationId}
            options={installationOptions}
            onSelected={(x) => setselectedInstallationId(x)}
            autoSelectFirst={true}
            enableSearch={true}
          />
        </LabelContainer>
      </div>
      <div className="full-row center-items">
        <DefaultButton
          maxWidth="400px"
          innerText={t("ADD")}
          onClick={executeAdd}
        />
      </div>
    </div>
  );
}

export default AddInstallation;
