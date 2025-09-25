import { useReducer, useMemo, useEffect } from "react";
import { useClient } from "urql";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { TFunction } from "i18next";
import SelectMenu, { SelectOption } from "../../../../components/SelectMenu";
import DefaultButton from "../../../../components/DefaultButton";
import NumberPicker from "../../../../components/NumberPicker";
import LabelContainer from "../../../../components/LabelContainer";
import {
  getTerminalStructureSpecifications,
  TerminalStructureSpecification,
  addAdditionalStructures,
  addAdditionalStructure,
} from "./AddCardGql";
import TextBox from "../../../../components/TextBox";

function createCategoryOptions(
  specifications: TerminalStructureSpecification[],
  t: TFunction,
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
  category: string,
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
  name: string | null;
}

type Action =
  | { type: "setCategory"; category: string }
  | { type: "setSpecificationId"; id: string }
  | {
      type: "setTerminalStructureSpecifications";
      terminalStructureSpecifications: TerminalStructureSpecification[];
    }
  | { type: "setPosition"; position: number }
  | { type: "setNumberOfStructures"; numberOfStructures: number }
  | { type: "setName"; setName: string | null };

const initialState: State = {
  category: null,
  specificationId: null,
  terminalStructureSpecifications: null,
  position: 1,
  numberOfStructures: 1,
  name: null,
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
    case "setName":
      return {
        ...state,
        name: action.name,
      };
    default:
      throw new Error(`No action found.`);
  }
}

interface AddCardProps {
  routeNodeId: string;
  terminalEquipmentId: string;
  terminalStructuresIsNameable: boolean;
  addedSuccessCallback?: () => void;
}

function AddCard({
  routeNodeId,
  terminalEquipmentId,
  terminalStructuresIsNameable,
  addedSuccessCallback,
}: AddCardProps) {
  const { t } = useTranslation();
  const client = useClient();
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
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
      return createCategoryOptions(
        state.terminalStructureSpecifications,
        t,
      ).sort((x, y) => (x.text > y.text ? 1 : -1));
    } else {
      return [];
    }
  }, [state.terminalStructureSpecifications, t]);

  const specificationOptions = useMemo<SelectOption[]>(() => {
    if (state.terminalStructureSpecifications && state.category) {
      return createSpecificationOptions(
        state.terminalStructureSpecifications,
        state.category,
      ).sort((x, y) => (x.text > y.text ? 1 : -1));
    } else {
      return [];
    }
  }, [state.terminalStructureSpecifications, state.category]);

  const executeAddAdditionalStructures = () => {
    if (!state.specificationId) {
      toast.error(t("ERROR"));
      console.error("SpecificationId was not set.");
    }

    if (terminalStructuresIsNameable) {
      addAdditionalStructure(client, {
        name: state.name,
        position: state.position,
        routeNodeId: routeNodeId,
        structureSpecificationId: state.specificationId,
        terminalEquipmentId: terminalEquipmentId,
      }).then((r) => {
        const body = r.data?.terminalEquipment.addAdditionalStructure;
        if (body?.isSuccess) {
          toast.success(t("ADDED"));
          if (addedSuccessCallback) {
            addedSuccessCallback();
          }
        } else {
          toast.error(t(body?.errorCode ?? "ERROR"));
        }
      });
    } else {
      addAdditionalStructures(client, {
        numberOfStructures: state.numberOfStructures,
        position: state.position,
        routeNodeId: routeNodeId,
        structureSpecificationId: state.specificationId,
        terminalEquipmentId: terminalEquipmentId,
      }).then((r) => {
        const body = r.data?.terminalEquipment.addAdditionalStructures;
        if (body?.isSuccess) {
          toast.success(t("ADDED"));
          if (addedSuccessCallback) {
            addedSuccessCallback();
          }
        } else {
          toast.error(t(body?.errorCode ?? "ERROR"));
        }
      });
    }
  };

  return (
    <div className="add-additional-structures">
      <div className="full-row-group">
        <div className="full-row">
          <LabelContainer text={`${t("CATEGORY")}:`}>
            <SelectMenu
              options={categoryOptions}
              autoSelectFirst
              enableSearch
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
              enableSearch
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
        {(terminalStructuresIsNameable && (
          <div className="full-row">
            <LabelContainer text={`${t("NAME")}:`}>
              <TextBox
                setValue={(x) =>
                  dispatch({
                    type: "setName",
                    name: x,
                  })
                }
                value={state.name}
              />
            </LabelContainer>
          </div>
        )) || (
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
        )}
        <div className="full-row">
          <DefaultButton
            disabled={
              (!terminalStructuresIsNameable &&
                state.numberOfStructures <= 0) ||
              (terminalStructuresIsNameable && !state.name)
            }
            innerText={t("ADD")}
            onClick={() => executeAddAdditionalStructures()}
          />
        </div>
      </div>
    </div>
  );
}

export default AddCard;
