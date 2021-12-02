import { useEffect, useReducer, useMemo } from "react";
import { useClient, useQuery } from "urql";
import SelectMenu, { SelectOption } from "../../../components/SelectMenu";
import TextBox from "../../../components/TextBox";
import NumberPicker from "../../../components/NumberPicker";
import LabelContainer from "../../../components/LabelContainer";
import {
  QUERY_TERMINAL_EQUIPMENT,
  TerminalEquipmentSpecification,
  SpanEquipmentSpecificationsResponse,
  Manufacturer,
  QUERY_RACK,
  Rack,
  RackResponse,
} from "./AddTerminalEquipmentGql";

function categoryToOptions(
  specs: TerminalEquipmentSpecification[]
): SelectOption[] {
  return [...new Set(specs.map((x) => x.category))].map((x, i) => ({
    text: x,
    value: x,
    key: i,
  }));
}

function specificationToOptions(
  specs: TerminalEquipmentSpecification[],
  category: string
): SelectOption[] {
  return specs
    .filter((x) => x.category === category)
    .map((x) => ({ text: x.name, value: x.id, key: x.id }));
}

function manufacturerToOptions(
  specs: Manufacturer[],
  refs: string[]
): SelectOption[] {
  return specs
    .filter((x) => refs.findIndex((y) => y === x.id))
    .map((x) => ({ text: x.name, value: x.id, key: x.id }));
}

interface State {
  category: string;
  specification: string;
  manufacturer: string;
  name: string;
  count: number;
  startNumber: number;
}

type Action =
  | { type: "setCategory"; id: string }
  | { type: "setSpecification"; id: string }
  | { type: "setManufacturer"; id: string }
  | { type: "setName"; text: string }
  | { type: "setCount"; count: number }
  | { type: "setStartNumber"; startNumber: number };

const initialState: State = {
  category: "",
  specification: "",
  manufacturer: "",
  name: "",
  count: 1,
  startNumber: 1,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "setCategory":
      return {
        ...state,
        category: action.id,
        specification: "",
        manufacturer: "",
      };
    case "setSpecification":
      return { ...state, specification: action.id, manufacturer: "" };
    case "setManufacturer":
      return { ...state, manufacturer: action.id };
    case "setName":
      return { ...state, name: action.text };
    case "setCount":
      return { ...state, count: action.count };
    case "setStartNumber":
      return { ...state, startNumber: action.startNumber };
    default:
      throw new Error("No action found.");
  }
}

interface AddTerminalEquipmentProps {
  routeNodeId: string;
  rackId?: string;
}

function AddTerminalEquipment({
  routeNodeId,
  rackId,
}: AddTerminalEquipmentProps) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const [specificationResponse] = useQuery<SpanEquipmentSpecificationsResponse>(
    {
      query: QUERY_TERMINAL_EQUIPMENT,
    }
  );

  const [rackResponse] = useQuery<RackResponse>({
    query: QUERY_RACK,
    variables: { routeNodeId: routeNodeId, rackId: rackId },
    pause: !routeNodeId || !rackId,
  });

  const categoryOptions = useMemo<SelectOption[]>(() => {
    if (
      !specificationResponse.data?.utilityNetwork
        .terminalEquipmentSpecifications
    )
      return [];
    return categoryToOptions(
      specificationResponse.data.utilityNetwork.terminalEquipmentSpecifications
    );
  }, [
    specificationResponse.data?.utilityNetwork.terminalEquipmentSpecifications,
  ]);

  const specificationOptions = useMemo<SelectOption[]>(() => {
    if (
      !specificationResponse.data?.utilityNetwork
        .terminalEquipmentSpecifications ||
      !state.category
    )
      return [];
    return specificationToOptions(
      specificationResponse.data.utilityNetwork.terminalEquipmentSpecifications,
      state.category
    );
  }, [
    specificationResponse.data?.utilityNetwork.terminalEquipmentSpecifications,
    state.category,
  ]);

  const manufacturerOptions = useMemo<SelectOption[]>(() => {
    if (
      !specificationResponse.data?.utilityNetwork
        .terminalEquipmentSpecifications ||
      !state.specification
    )
      return [];
    return manufacturerToOptions(
      specificationResponse.data.utilityNetwork.manufacturers,
      specificationResponse.data.utilityNetwork.terminalEquipmentSpecifications.find(
        (x) => x.id === state.specification
      )?.manufacturerRefs ?? []
    );
  }, [
    specificationResponse.data?.utilityNetwork.terminalEquipmentSpecifications,
    state.specification,
  ]);

  useEffect(() => {
    if (!categoryOptions || categoryOptions.length === 0) return;
    dispatch({ type: "setCategory", id: categoryOptions[0].value as string });
  }, [categoryOptions]);

  return (
    <div className="add-terminal-equipment">
      <div className="full-row-group">
        <div className="full-row">
          <LabelContainer text="Category:">
            <SelectMenu
              options={categoryOptions}
              removePlaceHolderOnSelect
              onSelected={(x) =>
                dispatch({ type: "setCategory", id: x as string })
              }
              selected={state.category}
            />
          </LabelContainer>
        </div>
        <div className="full-row">
          <LabelContainer text="Specification:">
            <SelectMenu
              options={specificationOptions}
              removePlaceHolderOnSelect
              onSelected={(x) =>
                dispatch({ type: "setSpecification", id: x as string })
              }
              selected={state.specification}
            />
          </LabelContainer>
        </div>
        <div className="full-row">
          <LabelContainer text="Manufacturer:">
            <SelectMenu
              options={manufacturerOptions}
              removePlaceHolderOnSelect
              onSelected={(x) =>
                dispatch({ type: "setManufacturer", id: x as string })
              }
              selected={state.manufacturer}
            />
          </LabelContainer>
        </div>
        <div className="full-row">
          <LabelContainer text="Name:">
            <TextBox
              value={state.name}
              setValue={(x) => dispatch({ type: "setName", text: x })}
            />
          </LabelContainer>
        </div>
        <div className="full-row">
          <LabelContainer text="Antal:">
            <NumberPicker
              value={state.count}
              setValue={(x) => dispatch({ type: "setCount", count: x })}
              minValue={1}
              maxValue={100}
            />
          </LabelContainer>
        </div>
        <div className="full-row">
          <LabelContainer text="Start numerering:">
            <NumberPicker
              value={state.startNumber}
              minValue={0}
              maxValue={100}
              setValue={(x) =>
                dispatch({ type: "setStartNumber", startNumber: x })
              }
            />
          </LabelContainer>
        </div>
      </div>
      {rackId && (
        <div className="full-row-group">
          <p className="full-row-group__title">
            {rackResponse.data?.utilityNetwork.rack.name}
          </p>
          <div className="full-row">
            <LabelContainer text="Rack unit:">
              <SelectMenu
                options={[]}
                removePlaceHolderOnSelect
                onSelected={() => {}}
                selected={""}
              />
            </LabelContainer>
          </div>
          <div className="full-row">
            <LabelContainer text="Placerings metode:">
              <SelectMenu
                options={[]}
                removePlaceHolderOnSelect
                onSelected={() => {}}
                selected={""}
              />
            </LabelContainer>
          </div>
        </div>
      )}
    </div>
  );
}

export default AddTerminalEquipment;
