import { useQuery } from "urql";
import { useTranslation, TFunction } from "react-i18next";
import {
  QUERY_SPAN_EQUIPMENT_DETAILS,
  SpanEquipmentDetailsResponse,
} from "./SpanEquipmentDetailsGql";
import FeatureDetailsContainer from "../FeatureDetailContainer";

type SpanEquipmentDetailsParams = {
  spanEquipmentMrid: string;
};

function mapEquipmentDetails(
  x: SpanEquipmentDetailsResponse | undefined,
  t: TFunction<string>
) {
  if (!x) return [];

  const { manufacturer, markingInfo, name, specification } =
    x.utilityNetwork.spanEquipment;

  return [
    {
      name: t("NAME_OR_ID"),
      value: name ?? t("Unspecified"),
    },
    {
      name: t("SPECIFICATION"),
      value: specification.description ?? t("Unspecified"),
    },
    {
      name: t("MARKING_COLOR"),
      value: markingInfo.markingColor ?? t("Unspecified"),
    },
    {
      name: t("MANUFACTURER"),
      value: manufacturer.name ?? t("Unspecified"),
    },
    {
      name: t("FIXED"),
      value: specification.isFixed ? t("YES") : t("NO"),
    },
  ];
}

function SpanEquipmentDetails({
  spanEquipmentMrid,
}: SpanEquipmentDetailsParams) {
  const { t } = useTranslation();
  const [spanEquipmentDetails] = useQuery<SpanEquipmentDetailsResponse>({
    query: QUERY_SPAN_EQUIPMENT_DETAILS,
    variables: { spanEquipmentOrSegmentId: spanEquipmentMrid },
    pause: !spanEquipmentMrid,
  });

  if (spanEquipmentDetails.fetching) return <></>;

  const details = mapEquipmentDetails(spanEquipmentDetails.data, t);

  return (
    <div className="span-equipment-details">
      <FeatureDetailsContainer details={details} />
    </div>
  );
}

export default SpanEquipmentDetails;
