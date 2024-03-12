import { useEffect, useState } from "react";
import { useClient } from "urql";
import { useTranslation } from "react-i18next";
import LabelContainer from "../../../components/LabelContainer";
import TextBox from "../../../components/TextBox";
import {
  getSpanEquipmentDetails,
  SpanEquipment,
} from "./GeneralSpanEquipmentViewGql";

interface GeneralSpanEquipmentViewProps {
  spanEquipmentId: string;
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
}: GeneralSpanEquipmentViewProps) {
  const client = useClient();
  const { t } = useTranslation();
  const [spanEquipment, setSpanEquipment] = useState<SpanEquipment | null>(
    null,
  );

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

  if (!spanEquipment) {
    return <></>;
  }

  return (
    <div className="general-span-equipment-view">
      <div className="general-view-container">
        <div className="general-view-header">
          <p>{spanEquipment.name}</p>
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
