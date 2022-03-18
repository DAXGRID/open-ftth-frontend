import { useReducer, useMemo, useEffect } from "react";
import { useClient } from "urql";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import SelectMenu, { SelectOption } from "../../../components/SelectMenu";
import TextBox from "../../../components/TextBox";
import DefaultButton from "../../../components/DefaultButton";
import NumberPicker from "../../../components/NumberPicker";
import LabelContainer from "../../../components/LabelContainer";
import {
  queryRack,
  queryRackSpecifications,
  RackSpecification,
} from "./EditRackGql";

function rackSpecificationToOptions(
  rackSpecifications: RackSpecification[]
): SelectOption[] {
  return rackSpecifications.map((x) => ({
    text: x.name,
    value: x.id,
    key: x.id,
  }));
}

function canUpdate(heightsInUnits: number, name: string): boolean {
  return heightsInUnits > 0 && name.length > 0;
}

interface State {
  selectedSpecification: string;
  rackName: string;
  heightUnits: number;
  rackSpecifications: RackSpecification[];
}

type Action =
  | { type: "setSpecification"; id: string }
  | { type: "setRackName"; name: string }
  | { type: "setHeightUnits"; units: number }
  | { type: "setRackSpecifications"; rackSpecifications: RackSpecification[] };

const initialState: State = {
  selectedSpecification: "",
  rackName: "",
  heightUnits: 0,
  rackSpecifications: [],
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "setSpecification":
      return { ...state, selectedSpecification: action.id };
    case "setRackName":
      return { ...state, rackName: action.name };
    case "setHeightUnits":
      return { ...state, heightUnits: action.units };
    case "setRackSpecifications":
      return { ...state, rackSpecifications: action.rackSpecifications };
    default:
      throw new Error(`No action found.`);
  }
}

interface EditRackProps {
  routeNodeId: string;
  rackId: string;
}

function EditRack({ routeNodeId, rackId }: EditRackProps) {
  const { t } = useTranslation();
  const client = useClient();
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    queryRackSpecifications(client)
      .then((r) => {
        const rackSpecifications = r.data?.utilityNetwork.rackSpecifications;
        if (rackSpecifications) {
          dispatch({
            type: "setRackSpecifications",
            rackSpecifications: rackSpecifications,
          });
        } else {
          console.error("Could not query rack specifications.");
          toast.error(t("ERROR"));
        }
      })
      .catch(() => {
        toast.error(t("ERROR"));
      });
  }, [client, dispatch, t]);

  useEffect(() => {
    queryRack(client, routeNodeId, rackId)
      .then((r) => {
        const rack = r.data?.utilityNetwork.rack;
        if (rack) {
          dispatch({ type: "setRackName", name: rack.name });
          dispatch({ type: "setHeightUnits", units: rack.heightInUnits });
          dispatch({ type: "setSpecification", id: rack.specificationId });
        } else {
          console.error("Rack is null/undefined.");
          toast.error(t("ERROR"));
        }
      })
      .catch(() => {
        console.error("Could not query rack.");
        toast.error(t("ERROR"));
      });
  }, [rackId, routeNodeId, client, dispatch, t]);

  const specificationOptions = useMemo(() => {
    return state.rackSpecifications.length > 0
      ? rackSpecificationToOptions(state.rackSpecifications)
      : [];
  }, [state.rackSpecifications]);

  const updateRack = () => {
    console.log(state);
  };

  return (
    <div className="edit-rack">
      <div className="full-row-group">
        <div className="full-row">
          <LabelContainer text={`${t("SPECIFICATION")}:`}>
            <SelectMenu
              options={specificationOptions}
              removePlaceHolderOnSelect
              onSelected={(x) =>
                dispatch({
                  type: "setSpecification",
                  id: x?.toString() ?? "",
                })
              }
              selected={state.selectedSpecification}
            />
          </LabelContainer>
        </div>
        <div className="full-row">
          <LabelContainer text={`${t("NAME")}:`}>
            <TextBox
              setValue={(x) => dispatch({ type: "setRackName", name: x })}
              value={state.rackName}
            />
          </LabelContainer>
        </div>
        <div className="full-row">
          <LabelContainer text={`${t("HEIGHT_UNITS")}:`}>
            <NumberPicker
              minValue={0}
              maxValue={100}
              setValue={(x) => dispatch({ type: "setHeightUnits", units: x })}
              value={state.heightUnits}
            />
          </LabelContainer>
        </div>
      </div>
      <div className="full-row">
        <DefaultButton
          innerText={t("UPDATE")}
          disabled={!canUpdate(state.heightUnits, state.rackName)}
          onClick={() => updateRack()}
        />
      </div>
    </div>
  );
}

export default EditRack;
