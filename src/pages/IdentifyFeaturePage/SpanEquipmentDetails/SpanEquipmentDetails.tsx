import { useQuery } from "urql";
import { useTranslation } from "react-i18next";
import {
  QUERY_SPAN_EQUIPMENT_DETAILS,
  SpanEquipmentDetailsResponse,
} from "./SpanEquipmentDetailsGql";

type SpanEquipmentDetailsParams = {
  spanEquipmentMrid: string;
};

function SpanEquipmentDetails({
  spanEquipmentMrid,
}: SpanEquipmentDetailsParams) {
  const { t } = useTranslation();
  const [spanEquipmentDetails] = useQuery<SpanEquipmentDetailsResponse>({
    query: QUERY_SPAN_EQUIPMENT_DETAILS,
    variables: { spanEquipmentOrSegmentId: spanEquipmentMrid },
    pause: !spanEquipmentMrid,
  });

  return (
    <div className="span-equipment-details">
      <div className="span-equipment-details-container">
        <p>
          {`${t("NAME_OR_ID")}: ${
            spanEquipmentDetails.data?.utilityNetwork.spanEquipment.name ?? ""
          }`}
        </p>
        <p>
          {`${t("SPECIFICATION")}: ${
            spanEquipmentDetails.data?.utilityNetwork.spanEquipment
              .specification.description ?? ""
          }`}
        </p>
        <p>
          {`${t("MARKING_COLOR")}: ${
            spanEquipmentDetails.data?.utilityNetwork.spanEquipment.markingInfo
              .markingColor ?? ""
          }`}
        </p>
        <p>
          {`${t("MANUFACTURER")}: ${
            spanEquipmentDetails.data?.utilityNetwork.spanEquipment
              ?.manufacturer?.name ?? ""
          }`}
        </p>
        <p>
          {`${t("FIXED")}: ${
            spanEquipmentDetails.data?.utilityNetwork.spanEquipment
              .specification.isFixed
              ? t("YES")
              : t("NO")
          }`}
        </p>
      </div>
    </div>
  );
}

export default SpanEquipmentDetails;
