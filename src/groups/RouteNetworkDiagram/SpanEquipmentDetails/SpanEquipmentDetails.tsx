import { useState } from "react";
import { useQuery } from "urql";
import { useTranslation, TFunction } from "react-i18next";
import {
  QUERY_SPAN_EQUIPMENT_DETAILS,
  SpanEquipmentDetailsResponse,
  AccessAddress,
  UnitAddress,
} from "./SpanEquipmentDetailsGql";
import FeatureDetailsContainer from "../FeatureDetailContainer";
import ModalContainer from "../../../components/ModalContainer";
import EditSpanEquipment from "../EditSpanEquipment";
import RerouteTube from "../RerouteTube";
import { EditPropertiesSvg, MoveConduitSvg } from "../../../assets";

function mapAccessAddress(accessAddress: AccessAddress): string {
  return `${accessAddress.roadName} ${accessAddress.houseNumber}, ${accessAddress.postDistrictCode} ${accessAddress.postDistrict}`;
}

function mapUnitAddress(unitAddress: UnitAddress): string {
  return `${unitAddress.floorName} ${unitAddress.suitName}`;
}

function mapEquipmentDetails(
  x: SpanEquipmentDetailsResponse | undefined,
  t: TFunction<string>
) {
  if (!x) return [];

  const { manufacturer, markingInfo, name, specification, addressInfo } =
    x.utilityNetwork.spanEquipment;

  const mapped = [
    {
      name: t("NAME_OR_ID"),
      value: name ?? t("Unspecified"),
    },
    {
      name: t("SPECIFICATION"),
      value: specification?.description ?? t("Unspecified"),
    },
    {
      name: t("MARKING_COLOR"),
      value: markingInfo?.markingColor ?? t("Unspecified"),
    },
    {
      name: t("MANUFACTURER"),
      value: manufacturer?.name ?? t("Unspecified"),
    },
    {
      name: t("FIXED"),
      value: specification?.isFixed ? t("YES") : t("NO"),
    },
  ];

  if (addressInfo?.accessAddress) {
    mapped.push({
      name: t("ADDRESS"),
      value: `${mapAccessAddress(addressInfo.accessAddress)} ${
        addressInfo.unitAddress
          ? ", " + mapUnitAddress(addressInfo.unitAddress)
          : ""
      }`,
    });
  }

  if (addressInfo?.remark) {
    mapped.push({
      name: t("ADDRESS_REMARK"),
      value: addressInfo.remark,
    });
  }

  return mapped;
}

type SpanEquipmentDetailsParams = {
  spanEquipmentMrid: string;
  showActions: boolean;
};

function SpanEquipmentDetails({
  spanEquipmentMrid,
  showActions,
}: SpanEquipmentDetailsParams) {
  const { t } = useTranslation();
  const [showEditSpanEquipment, setShowEditSpanEquipment] = useState(false);
  const [showRerouteTube, setShowRerouteTube] = useState(false);
  const [spanEquipmentDetails] = useQuery<SpanEquipmentDetailsResponse>({
    query: QUERY_SPAN_EQUIPMENT_DETAILS,
    variables: { spanEquipmentOrSegmentId: spanEquipmentMrid },
    pause: !spanEquipmentMrid,
  });

  if (spanEquipmentDetails.fetching) return <></>;

  const details = mapEquipmentDetails(spanEquipmentDetails.data, t);

  return (
    <div className="span-equipment-details">
      <ModalContainer
        show={showRerouteTube}
        closeCallback={() => setShowRerouteTube(false)}
      >
        <RerouteTube selectedRouteSegmentMrid={spanEquipmentMrid ?? ""} />
      </ModalContainer>
      <ModalContainer
        show={showEditSpanEquipment}
        closeCallback={() => setShowEditSpanEquipment(false)}
      >
        <EditSpanEquipment spanEquipmentMrid={spanEquipmentMrid ?? ""} />
      </ModalContainer>
      <FeatureDetailsContainer
        details={details}
        showActions={showActions}
        actions={[
          {
            action: () => setShowRerouteTube(true),
            icon: MoveConduitSvg,
            title: t("MOVE"),
            disabled: false,
            key: 0,
          },
          {
            action: () => setShowEditSpanEquipment(true),
            icon: EditPropertiesSvg,
            title: t("EDIT"),
            disabled: false,
            key: 1,
          },
        ]}
      />
    </div>
  );
}

export default SpanEquipmentDetails;
