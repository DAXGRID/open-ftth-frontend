import { useEffect, useState, useContext } from "react";
import { useClient } from "urql";
import { useTranslation } from "react-i18next";
import { EditPropertiesSvg } from "../../../assets";
import ModalContainer from "../../../components/ModalContainer";
import LabelContainer from "../../../components/LabelContainer";
import TextBox from "../../../components/TextBox";
import ActionButton from "../../../components/ActionButton";
import {
  getSpanEquipmentDetails,
  SpanEquipment,
} from "./GeneralSpanEquipmentViewGql";
import { OverlayContext } from "../../../contexts/OverlayContext";
import EditSpanEquipment from "../EditSpanEquipment";

interface GeneralSpanEquipmentViewProps {
  spanEquipmentId: string;
  editable: boolean;
}

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

function GeneralSpanEquipmentView({
  spanEquipmentId,
  editable,
}: GeneralSpanEquipmentViewProps) {
  const client = useClient();
  const { t } = useTranslation();
  const { showElement } = useContext(OverlayContext);
  const [spanEquipment, setSpanEquipment] = useState<SpanEquipment | null>(
    null,
  );
  const [showEditSpanEquipment, setShowEditSpanEquipment] =
    useState<boolean>(false);

  useEffect(() => {
    getSpanEquipmentDetails(client, spanEquipmentId)
      .then((x) => {
        let spanEquipment = x.data?.utilityNetwork.spanEquipment;
        if (spanEquipment) {
          setSpanEquipment(spanEquipment);
        } else {
          console.error("Could not receive span equipment details.");
        }
      })
      .catch((x) => {
        console.error(x);
      });
  }, [client, spanEquipmentId]);

  useEffect(() => {
    if (showEditSpanEquipment) {
      showElement(
        <ModalContainer
          title={t("EDIT_SPAN_EQUIPMENT")}
          closeCallback={() => setShowEditSpanEquipment(false)}
        >
          <EditSpanEquipment spanEquipmentMrid={spanEquipmentId ?? ""} />
        </ModalContainer>,
      );
    } else {
      showElement(null);
    }
  }, [showEditSpanEquipment, t, showElement, spanEquipmentId]);

  if (!spanEquipment) {
    return <></>;
  }

  return (
    <div className="general-span-equipment-view">
      <div className="general-span-equipment-view-container">
        <div className="general-span-equipment-view-header">
          <p>{spanEquipment.name}</p>
          <div className="general-span-equipment-view-row-title-header-actions">
            {editable && (
              <>
                <ActionButton
                  action={() => setShowEditSpanEquipment(true)}
                  icon={EditPropertiesSvg}
                  title={t("EDIT")}
                  key={1}
                />
              </>
            )}
          </div>
        </div>

        <div className="general-span-equipment-view-body">
          <div className="block">
            <div className="full-row">
              <LabelContainer text={t("SPECIFCATION_NAME")}>
                <TextBox
                  value={spanEquipment.specification?.name ?? ""}
                  setValue={() => {}}
                  disabled={true}
                />
              </LabelContainer>
            </div>
            <div className="full-row">
              <LabelContainer text={t("SPECIFCATION_DESCRIPTION")}>
                <TextBox
                  value={spanEquipment.specification?.description ?? ""}
                  setValue={() => {}}
                  disabled={true}
                />
              </LabelContainer>
            </div>
            <div className="full-row">
              <LabelContainer text={t("DESCRIPTION")}>
                <TextBox
                  value={spanEquipment.description ?? ""}
                  setValue={() => {}}
                  disabled={true}
                />
              </LabelContainer>
            </div>
            <div className="full-row">
              <LabelContainer text={t("MARKING_TEXT")}>
                <TextBox
                  value={spanEquipment.markingInfo?.markingText ?? ""}
                  setValue={() => {}}
                  disabled={true}
                />
              </LabelContainer>
            </div>
            <div className="full-row">
              <LabelContainer text={t("MARKING_COLOR")}>
                <TextBox
                  value={spanEquipment.markingInfo?.markingColor ?? ""}
                  setValue={() => {}}
                  disabled={true}
                />
              </LabelContainer>
            </div>
          </div>
          {spanEquipment?.addressInfo && (
            <div className="block">
              <p className="block-title block-title__underline block-title__big">
                {t("ADDRESS_INFORMATION")}
              </p>
              <div className="full-row">
                <LabelContainer text={t("ADDRESS")}>
                  <TextBox
                    value={addressDisplayText(
                      spanEquipment.addressInfo.accessAddress ?? null,
                      spanEquipment.addressInfo?.unitAddress ?? null,
                    )}
                    setValue={() => {}}
                    disabled={true}
                  />
                </LabelContainer>
              </div>
              <div className="full-row">
                <LabelContainer text={t("ADDITIONAL_ADDRESS_INFORMATION")}>
                  <TextBox
                    value={spanEquipment.addressInfo?.remark ?? ""}
                    setValue={() => {}}
                    disabled={true}
                  />
                </LabelContainer>
              </div>
              <div className="full-row">
                <LabelContainer text={t("ADDRESS_ID")}>
                  <TextBox
                    value={
                      spanEquipment.addressInfo.unitAddress?.externalId ?? ""
                    }
                    setValue={() => {}}
                    disabled={true}
                  />
                </LabelContainer>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default GeneralSpanEquipmentView;
