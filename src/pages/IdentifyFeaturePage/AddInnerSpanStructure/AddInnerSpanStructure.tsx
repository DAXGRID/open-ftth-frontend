import { useState } from "react";
import { useQuery, useClient } from "urql";
import DefaultButton from "../../../components/DefaultButton";
import SelectMenu, { SelectOption } from "../../../components/SelectMenu";
import NumberPicker from "../../../components/NumberPicker";
import {
  SPAN_EQUIPMENT_SPEFICIATIONS_QUERY,
  SpanEquipmentSpecificationsResponse,
  SpanEquipmentSpecification,
  ADD_ADDITIONAL_INNER_SPAN_STRUCTURES,
  AddAdditionalInnerSpanStructuresParameter,
} from "./AddInnerSpanStructureGql";

const createSelectOptions = (
  specifications: SpanEquipmentSpecification[]
): SelectOption[] => {
  return specifications
    .filter((x) => !x.isMultiLevel)
    .map<SelectOption>((x) => {
      return {
        text: x.description,
        value: x.outerSpanStructureSpecificationId,
      };
    });
};

type AddInnerSpanStructureProps = {
  selectedOuterConduit: string;
};

function AddInnerSpanStructure({
  selectedOuterConduit,
}: AddInnerSpanStructureProps) {
  const [count, setCount] = useState(0);
  const [selected, setSelected] = useState("");
  const client = useClient();
  const [response] = useQuery<SpanEquipmentSpecificationsResponse>({
    query: SPAN_EQUIPMENT_SPEFICIATIONS_QUERY,
  });

  const addInnerSpanStructure = async () => {
    const parameters: AddAdditionalInnerSpanStructuresParameter = {
      spanEquipmentOrSegmentId: selectedOuterConduit,
      spanStructureSpecificationIds: Array(count).fill(selected),
    };

    const result = await client
      .mutation(ADD_ADDITIONAL_INNER_SPAN_STRUCTURES, parameters)
      .toPromise();

    if (result.error) {
      throw new Error("Failed");
    }
  };

  if (response.fetching) return <></>;

  return (
    <div className="add-inner-span-structure">
      <div className="full-row">
        <SelectMenu
          onSelected={(x) => setSelected(x?.toString() ?? "")}
          selected={selected}
          options={createSelectOptions(
            response.data?.utilityNetwork.spanEquipmentSpecifications ?? []
          )}
        />
        <NumberPicker value={count} setValue={(value) => setCount(value)} />
      </div>
      <DefaultButton
        onClick={async () => await addInnerSpanStructure()}
        innerText="Place"
      />
    </div>
  );
}

export default AddInnerSpanStructure;
