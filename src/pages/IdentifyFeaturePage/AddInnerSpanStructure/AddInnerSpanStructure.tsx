import { useState } from "react";
import { useQuery } from "urql";
import DefaultButton from "../../../components/DefaultButton";
import SelectMenu, { SelectOption } from "../../../components/SelectMenu";
import NumberPicker from "../../../components/NumberPicker";
import {
  SPAN_EQUIPMENT_SPEFICIATIONS_QUERY,
  SpanEquipmentSpecificationsResponse,
  SpanEquipmentSpecification,
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

function AddInnerSpanStructure() {
  const [count, setCount] = useState(0);
  const [selected, setSelected] = useState("");
  const [response] = useQuery<SpanEquipmentSpecificationsResponse>({
    query: SPAN_EQUIPMENT_SPEFICIATIONS_QUERY,
  });

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
      <DefaultButton onClick={() => {}} innerText="Place" />
    </div>
  );
}

export default AddInnerSpanStructure;
