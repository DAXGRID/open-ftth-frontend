import { useReducer, useMemo, useEffect } from "react";
import { useClient } from "urql";
import { toast } from "react-toastify";
import { useTranslation, TFunction } from "react-i18next";
import SelectMenu, { SelectOption } from "../../../components/SelectMenu";
import DefaultButton from "../../../components/DefaultButton";
import NumberPicker from "../../../components/NumberPicker";
import LabelContainer from "../../../components/LabelContainer";
import {
  getTerminalStructureSpecifications,
  TerminalStructureSpecification,
} from "./AddAdditionalStructuresGql";

function createCategoryOptions(
  specifications: TerminalStructureSpecification[],
  t: TFunction
): SelectOption[] {
  return specifications.reduce<SelectOption[]>((acc, x) => {
    if (acc.findIndex((z) => z.value === x.category) === -1) {
      acc.push({ text: t(x.category), value: x.category, key: x.category });
    }
    return acc;
  }, []);
}

function createSpecificationOptions(
  specifications: TerminalStructureSpecification[],
  category: string
): SelectOption[] {
  return specifications
    .filter((x) => x.category === category)
    .map((x) => ({ text: x.name, value: x.id, key: x.id }));
}

interface State {
  category: string | null;
  specificationId: string | null;
  position: number;
  numberOfStructures: number;
  terminalStructureSpecifications: TerminalStructureSpecification[] | null;
}

type Action =
  | { type: "setCategory"; category: string }
  | { type: "setSpecificationId"; id: string }
  | {
      type: "setTerminalStructureSpecifications";
      terminalStructureSpecifications: TerminalStructureSpecification[];
    }
  | { type: "setPosition"; position: number }
  | { type: "setNumberOfStructures"; numberOfStructures: number };

const initialState: State = {
  category: null,
  specificationId: null,
  terminalStructureSpecifications: null,
  position: 1,
  numberOfStructures: 1,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "setCategory":
      return { ...state, category: action.category, specificationId: null };
    case "setSpecificationId":
      return { ...state, specificationId: action.id };
    case "setTerminalStructureSpecifications":
      return {
        ...state,
        terminalStructureSpecifications: action.terminalStructureSpecifications,
      };
    case "setPosition":
      return {
        ...state,
        position: action.position,
      };
    case "setNumberOfStructures":
      return {
        ...state,
        numberOfStructures: action.numberOfStructures,
      };
    default:
      throw new Error(`No action found.`);
  }
}

interface AddAdditionalStructuresProps {
  routeNodeId: string;
  terminalEquipmentId: string;
}

function AddAdditionalStructures({
  routeNodeId,
  terminalEquipmentId,
}: AddAdditionalStructuresProps) {
  const { t } = useTranslation();
  const client = useClient();
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    console.log("Got in here!");
    getTerminalStructureSpecifications(client).then((x) => {
      const specifications =
        x.data?.utilityNetwork.terminalStructureSpecifications;
      if (specifications) {
        dispatch({
          type: "setTerminalStructureSpecifications",
          terminalStructureSpecifications: specifications,
        });
      } else {
        console.error("Could not load terminal structure specifications.");
        toast.error(t("ERROR"));
      }
    });
  }, [dispatch, client, t]);

  const categoryOptions = useMemo<SelectOption[]>(() => {
    if (state.terminalStructureSpecifications) {
      return createCategoryOptions(state.terminalStructureSpecifications, t);
    } else {
      return [];
    }
  }, [state.terminalStructureSpecifications, t]);

  const specificationOptions = useMemo<SelectOption[]>(() => {
    if (state.terminalStructureSpecifications && state.category) {
      return createSpecificationOptions(
        state.terminalStructureSpecifications,
        state.category
      );
    } else {
      return [];
    }
  }, [state.terminalStructureSpecifications, state.category]);

  if (!state.terminalStructureSpecifications) return <></>;

  return (
    <div className="add-additional-structures">
      <div className="full-row-group">
        <div className="full-row">
          <LabelContainer text={`${t("CATEGORY")}:`}>
            <SelectMenu
              options={categoryOptions}
              autoSelectFirst
              onSelected={(x) =>
                dispatch({
                  type: "setCategory",
                  category: x?.toString() ?? "",
                })
              }
              selected={state.category ?? ""}
            />
          </LabelContainer>
        </div>
        <div className="full-row">
          <LabelContainer text={`${t("SPECIFICATION")}:`}>
            <SelectMenu
              options={specificationOptions}
              autoSelectFirst
              onSelected={(x) =>
                dispatch({
                  type: "setSpecificationId",
                  id: x?.toString() ?? "",
                })
              }
              selected={state.specificationId ?? ""}
            />
          </LabelContainer>
        </div>
        <div className="full-row">
          <LabelContainer text={`${t("INSERT_AT_POSITION")}:`}>
            <NumberPicker
              minValue={0}
              maxValue={1000}
              setValue={(x) => dispatch({ type: "setPosition", position: x })}
              value={state.position}
            />
          </LabelContainer>
        </div>
        <div className="full-row">
          <LabelContainer text={`${t("NUMBER_OF_MODULES")}:`}>
            <NumberPicker
              minValue={1}
              maxValue={1000}
              setValue={(x) =>
                dispatch({
                  type: "setNumberOfStructures",
                  numberOfStructures: x,
                })
              }
              value={state.numberOfStructures}
            />
          </LabelContainer>
        </div>
        <div className="full-row">
          <DefaultButton
            innerText={t("ADD")}
            disabled={true}
            onClick={() => {}}
          />
        </div>
      </div>
    </div>
  );
}

export default AddAdditionalStructures;
