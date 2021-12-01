import { useMemo, useReducer, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import DefaultButton from "../../../components/DefaultButton";
import SelectMenu, { SelectOption } from "../../../components/SelectMenu";
import TextBox from "../../../components/TextBox";
import NumberPicker from "../../../components/NumberPicker";
import LabelContainer from "../../../components/LabelContainer";
import { useQuery, useClient } from "urql";
import {
  QUERY_RACK_SPECIFICATIONS,
  RackSpecification,
  RackSpecificationsResponse,
  PLACE_RACK_IN_CONTAINER,
  PlaceRackInContainerResponse,
  PlaceRackInContainerParameter,
} from "./AddRackGql";

function rackSpecificationToOptions(
  rackSpecifications?: RackSpecification[]
): SelectOption[] {
  if (!rackSpecifications) return [];
  return rackSpecifications.map((x) => ({
    text: x.name,
    value: x.id,
    key: x.id,
  }));
}

interface State {
  selectedSpecification: string;
  rackName: string;
  heightUnits: number;
}

type Action =
  | { type: "setSelectedSpecification"; id: string }
  | { type: "setRackName"; name: string }
  | { type: "setHeightUnits"; units: number };

const initialState: State = {
  selectedSpecification: "",
  rackName: "",
  heightUnits: 0,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "setSelectedSpecification":
      return { ...state, selectedSpecification: action.id };
    case "setRackName":
      return { ...state, rackName: action.name };
    case "setHeightUnits":
      return { ...state, heightUnits: action.units };
    default:
      throw new Error(`No action found.`);
  }
}

interface AddRackProps {
  nodeContainerId: string;
}

function AddRack({ nodeContainerId }: AddRackProps) {
  const { t } = useTranslation();
  const client = useClient();
  const [state, dispatch] = useReducer(reducer, initialState);

  const [specificationsQueryResult] = useQuery<RackSpecificationsResponse>({
    query: QUERY_RACK_SPECIFICATIONS,
  });

  const specificationOptions = useMemo(() => {
    return rackSpecificationToOptions(
      specificationsQueryResult.data?.utilityNetwork.rackSpecifications
    );
  }, [specificationsQueryResult]);

  useEffect(() => {
    if (!specificationOptions || specificationOptions.length === 0) return;
    if (!state.selectedSpecification)
      dispatch({
        type: "setSelectedSpecification",
        id: specificationOptions[0].value.toString(),
      });
  }, [specificationOptions, state.selectedSpecification, dispatch]);

  const addRack = async () => {
    if (!nodeContainerId) {
      toast.error("NO_NODE_CONTAINER_SELECTED");
    }

    const parameters: PlaceRackInContainerParameter = {
      nodeContainerId: nodeContainerId,
      rackHeightInUnits: state.heightUnits,
      rackId: uuidv4(),
      rackName: state.rackName,
      rackSpecificationId: state.selectedSpecification,
    };

    const response = await client
      .mutation<PlaceRackInContainerResponse>(
        PLACE_RACK_IN_CONTAINER,
        parameters
      )
      .toPromise();

    if (!response.data?.nodeContainer.placeRackInNodeContainer.isSuccess) {
      toast.error(
        t(
          response.data?.nodeContainer.placeRackInNodeContainer.errorCode ??
            "ERROR"
        )
      );
    }
  };

  return (
    <div className="add-rack page-container">
      <div className="full-row">
        <LabelContainer text="Specification:">
          <SelectMenu
            options={specificationOptions}
            removePlaceHolderOnSelect
            onSelected={(x) =>
              dispatch({
                type: "setSelectedSpecification",
                id: x?.toString() ?? "",
              })
            }
            selected={state.selectedSpecification}
          />
        </LabelContainer>
      </div>
      <div className="full-row">
        <LabelContainer text="Navn:">
          <TextBox
            setValue={(x) => dispatch({ type: "setRackName", name: x })}
            value={state.rackName}
          />
        </LabelContainer>
      </div>
      <div className="full-row">
        <LabelContainer text="Hoejde units:">
          <NumberPicker
            setValue={(x) => dispatch({ type: "setHeightUnits", units: x })}
            value={state.heightUnits}
          />
        </LabelContainer>
      </div>
      <div className="full-row">
        <DefaultButton onClick={() => addRack()} innerText="Tilfoej" />
      </div>
    </div>
  );
}

export default AddRack;
