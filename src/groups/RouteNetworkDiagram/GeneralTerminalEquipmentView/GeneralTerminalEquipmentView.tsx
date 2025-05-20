import { useEffect, useState, useContext } from "react";
import { useClient } from "urql";
import {
  getGeneralView,
  TerminalEquipment,
} from "./GeneralTerminalEquipmentViewGql";
import { useTranslation } from "react-i18next";
import TextBox from "../../../components/TextBox";
import LabelContainer from "../../../components/LabelContainer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit } from "@fortawesome/free-solid-svg-icons";
import ModalContainer from "../../../components/ModalContainer";
import { OverlayContext } from "../../../contexts/OverlayContext";
import EditTerminalEquipment from "../../TerminalEquipment/EditTerminalEquipment";

interface AccessAddress {
  postDistrictCode: string;
  postDistrict: string;
  roadName: string;
  houseNumber: string;
}

interface UnitAddress {
  externalId: string;
  floorName: string;
  suitName: string;
}

function addressDisplayText(
  accessAddress: AccessAddress | null,
  unitAddress: UnitAddress | null,
): string {
  if (!accessAddress) {
    return "";
  }

  let unitAddressText = `${unitAddress?.floorName ?? ""} ${
    unitAddress?.suitName ?? ""
  }`.trim();

  if (unitAddressText.length > 0) {
    return `${accessAddress.roadName} ${accessAddress.houseNumber}, ${unitAddressText}, ${accessAddress.postDistrict} ${accessAddress.postDistrictCode}`;
  } else {
    return `${accessAddress.roadName} ${accessAddress.houseNumber}, ${accessAddress.postDistrict} ${accessAddress.postDistrictCode}`;
  }
}

interface GeneralTerminalEquipmentViewProps {
  routeNodeId: string;
  terminalEquipmentId: string;
  editable?: boolean;
}

function GeneralTerminalEquipmentView({
  routeNodeId,
  terminalEquipmentId,
  editable,
}: GeneralTerminalEquipmentViewProps) {
  const client = useClient();
  const { t } = useTranslation();
  const [terminalEquipment, setTerminalEquipment] =
    useState<TerminalEquipment | null>(null);
  const [showEditTerminalEquipment, setShowEditTerminalEquipment] =
    useState<boolean>(false);
  const { showElement } = useContext(OverlayContext);

  useEffect(() => {
    getGeneralView(client, terminalEquipmentId)
      .then((x) => {
        let terminalEquipment = x.data?.utilityNetwork.terminalEquipment;
        if (terminalEquipment) {
          setTerminalEquipment(terminalEquipment);
        } else {
          console.error("Could not retrieve general view.");
        }
      })
      .catch((x) => {
        console.error(x);
      });
  }, [client, terminalEquipmentId]);

  useEffect(() => {
    if (showEditTerminalEquipment) {
      showElement(
        <ModalContainer
          title={t("EDIT_TERMINAL_EQUIPMENT")}
          closeCallback={() => setShowEditTerminalEquipment(false)}
        >
          <EditTerminalEquipment
            terminalEquipmentId={terminalEquipmentId}
            routeNodeId={routeNodeId}
          />
        </ModalContainer>,
      );

      return () => {
        showElement(null);
      };
    }
  }, [
    showEditTerminalEquipment,
    t,
    showElement,
    routeNodeId,
    terminalEquipmentId,
  ]);

  if (!terminalEquipment) {
    return <></>;
  }

  return (
    <div className="general-view">
      <div className="general-view-container">
        <div className="general-view-header">
          <p>{terminalEquipment.name}</p>
          {editable && (
            <div className="general-view-header-icons">
              <span
                role="button"
                onClick={() => setShowEditTerminalEquipment(true)}
              >
                <FontAwesomeIcon icon={faEdit} />
              </span>
            </div>
          )}
        </div>
        <div className="general-view-body">
          {terminalEquipment?.addressInfo && (
            <div className="block">
              <p className="block-title block-title__underline block-title__big">
                {t("ADDRESS_INFORMATION")}
              </p>
              <div className="full-row">
                <LabelContainer text={t("ADDRESS")}>
                  <TextBox
                    value={addressDisplayText(
                      terminalEquipment.addressInfo.accessAddress ?? null,
                      terminalEquipment.addressInfo?.unitAddress ?? null,
                    )}
                    setValue={() => {}}
                    disabled={true}
                  />
                </LabelContainer>
              </div>
              <div className="full-row">
                <LabelContainer text={t("ADDITIONAL_ADDRESS_INFORMATION")}>
                  <TextBox
                    value={terminalEquipment.addressInfo?.remark ?? ""}
                    setValue={() => {}}
                    disabled={true}
                  />
                </LabelContainer>
              </div>
              <div className="full-row">
                <LabelContainer text={t("ADDRESS_ID")}>
                  <TextBox
                    value={
                      terminalEquipment.addressInfo.unitAddress?.externalId ??
                      ""
                    }
                    setValue={() => {}}
                    disabled={true}
                  />
                </LabelContainer>
              </div>
            </div>
          )}
          {terminalEquipment.dynamicProperties.map((ps, i) => {
            return (
              <div className="block" key={i}>
                <p className="block-title block-title__underline">
                  {ps.sectionName}
                </p>
                {ps.properties.map((p, j) => {
                  return (
                    <div className="full-row" key={j}>
                      <LabelContainer text={p.name}>
                        <TextBox
                          value={p?.value ?? ""}
                          setValue={() => {}}
                          disabled={true}
                        />
                      </LabelContainer>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default GeneralTerminalEquipmentView;
