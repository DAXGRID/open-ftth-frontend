import { useState } from "react";
import { useQuery, useClient } from "urql";
import DefaultButton from "../../../components/DefaultButton";
import SelectMenu, { SelectOption } from "../../../components/SelectMenu";
import NumberPicker from "../../../components/NumberPicker";
import { useTranslation } from "react-i18next";
import {
  SPAN_EQUIPMENT_SPEFICIATIONS_QUERY,
  SpanEquipmentSpecificationsResponse,
  SpanEquipmentSpecification,
  ADD_ADDITIONAL_INNER_SPAN_STRUCTURES,
  AddAdditionalInnerSpanStructuresParameter,
  AddAdditionalInnerSpanStructuresResponse,
} from "./AddInnerSpanStructureGql";
import { toast } from "react-toastify";

const createSelectOptions = (
  specifications: SpanEquipmentSpecification[],
): SelectOption[] => {
  return specifications
    .filter((x) => !x.isMultiLevel)
    .map<SelectOption>((x) => {
      return {
        text: x.description,
        value: x.id,
        key: x.id,
      };
    });
};

type AddInnerSpanStructureProps = {
  selectedOuterConduit: string;
};

function AddInnerSpanStructure({
  selectedOuterConduit,
}: AddInnerSpanStructureProps) {
  const { t } = useTranslation();
  const [count, setCount] = useState(1);
  const [
    selectedSpanEquipmentSpecification,
    setSelectedSpanEquipmentSpecification,
  ] = useState<string>();
  const client = useClient();
  const [response] = useQuery<SpanEquipmentSpecificationsResponse>({
    query: SPAN_EQUIPMENT_SPEFICIATIONS_QUERY,
  });

  const addInnerSpanStructure = async () => {
    if (!selectedOuterConduit) {
      toast.error(t("No outer conduit selected"));
      return;
    }

    const outerSpanStructureSpecificationId =
      response.data?.utilityNetwork.spanEquipmentSpecifications.find(
        (x) => x.id === selectedSpanEquipmentSpecification,
      )?.outerSpanStructureSpecificationId;

    if (!outerSpanStructureSpecificationId) {
      throw Error(
        `Could not find span equipment specification on id: '${selectedSpanEquipmentSpecification}'.`,
      );
    }

    const parameters: AddAdditionalInnerSpanStructuresParameter = {
      spanEquipmentOrSegmentId: selectedOuterConduit,
      spanStructureSpecificationIds: Array(count).fill(
        outerSpanStructureSpecificationId,
      ),
    };

    const result = await client
      .mutation<AddAdditionalInnerSpanStructuresResponse>(
        ADD_ADDITIONAL_INNER_SPAN_STRUCTURES,
        parameters,
      )
      .toPromise();

    if (
      !result.data?.spanEquipment.addAdditionalInnerSpanStructures.isSuccess
    ) {
      toast.error(
        t(
          result.data?.spanEquipment.addAdditionalInnerSpanStructures
            .errorCode ?? "",
        ),
      );
    }
  };

  if (response.fetching) return <></>;

  if (!selectedSpanEquipmentSpecification) {
    setSelectedSpanEquipmentSpecification(
      response.data?.utilityNetwork.spanEquipmentSpecifications[0]
        .outerSpanStructureSpecificationId,
    );
  }

  return (
    <div className="add-inner-span-structure">
      <div className="full-row gap-default">
        <SelectMenu
          onSelected={(x) =>
            setSelectedSpanEquipmentSpecification(x?.toString() ?? "")
          }
          selected={selectedSpanEquipmentSpecification}
          options={createSelectOptions(
            response.data?.utilityNetwork.spanEquipmentSpecifications ?? [],
          )}
          enableSearch={true}
        />
        <NumberPicker value={count} setValue={(value) => setCount(value)} />
      </div>
      <div className="full-row">
        <DefaultButton
          onClick={async () => await addInnerSpanStructure()}
          innerText={t("Add inner conduit")}
        />
      </div>
    </div>
  );
}

export default AddInnerSpanStructure;
