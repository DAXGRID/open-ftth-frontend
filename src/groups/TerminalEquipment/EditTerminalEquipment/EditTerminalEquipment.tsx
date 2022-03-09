import { useReducer, useEffect, useMemo } from "react";
import { useClient } from "urql";
import { toast } from "react-toastify";
import { useTranslation, TFunction } from "react-i18next";
import SelectMenu, { SelectOption } from "../../../components/SelectMenu";
import TextBox from "../../../components/TextBox";
import DefaultButton from "../../../components/DefaultButton";
import LabelContainer from "../../../components/LabelContainer";
import {
  queryTerminalEquipmentDetails,
  TerminalEquipment,
  queryTerminalEquipmentSpecifications,
  Manufacturer,
  TerminalEquipmentSpecification,
} from "./EditTerminalEquipmentGql";

function categoryToOptions(
  specs: TerminalEquipmentSpecification[],
  isRackEquipment: boolean
): SelectOption[] {
  return [
    ...new Set(
      specs
        .filter((x) => x.isRackEquipment === isRackEquipment)
        .map((x) => x.category)
    ),
  ].map((x, i) => ({
    text: x,
    value: x,
    key: i,
  }));
}

interface State {
  categoryId: string | null;
  specificationId: string | null;
  manufacturerId: string | null;
  terminalEquipment: TerminalEquipment | null;
  manufacturers: Manufacturer[] | null;
  terminalEquipmentSpecifications: TerminalEquipmentSpecification[] | null;
}

const initialState: State = {
  categoryId: null,
  specificationId: null,
  manufacturerId: null,
  terminalEquipment: null,
  manufacturers: null,
  terminalEquipmentSpecifications: null,
};

type Action =
  | { type: "setTerminalEquipment"; terminalEquipment: TerminalEquipment }
  | { type: "setManufacturers"; manufacturers: Manufacturer[] }
  | {
      type: "setTerminalEquipmentSpecifications";
      specifications: TerminalEquipmentSpecification[];
    }
  | { type: "setCategoryId"; id: string }
  | { type: "setSpecificationId"; id: string }
  | { type: "reset" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "setTerminalEquipment":
      return { ...state, terminalEquipment: action.terminalEquipment };
    case "setManufacturers":
      return { ...state, manufacturers: action.manufacturers };
    case "setTerminalEquipmentSpecifications":
      return {
        ...state,
        terminalEquipmentSpecifications: action.specifications,
      };
    case "setCategoryId":
      return { ...state, categoryId: action.id };
    case "setSpecificationId":
      return { ...state, specificationId: action.id };
    case "reset":
      return initialState;
    default:
      throw new Error(
        `No action found of type: '${
          (action as any)?.type ?? "has no action type"
        }'`
      );
  }
}

interface EditTerminalEquipmentProps {
  terminalEquipmentId: string;
}

function EditTerminalEquipment({
  terminalEquipmentId,
}: EditTerminalEquipmentProps) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { t } = useTranslation();
  const client = useClient();

  useEffect(() => {
    if (!terminalEquipmentId) return;
    queryTerminalEquipmentDetails(client, terminalEquipmentId)
      .then((r) => {
        const terminalEquipment = r.data?.utilityNetwork.terminalEquipment;
        if (terminalEquipment) {
          dispatch({
            type: "setTerminalEquipment",
            terminalEquipment: terminalEquipment,
          });
        } else {
          toast.error(t("ERROR"));
        }
      })
      .catch((r) => {
        console.error(r);
        toast.error(t("ERROR"));
      });
  }, [terminalEquipmentId, dispatch, client, t]);

  useEffect(() => {
    queryTerminalEquipmentSpecifications(client)
      .then((r) => {
        if (r.data?.utilityNetwork) {
          const { manufacturers, terminalEquipmentSpecifications } =
            r.data.utilityNetwork;
          dispatch({
            type: "setTerminalEquipmentSpecifications",
            specifications: terminalEquipmentSpecifications,
          });
          dispatch({
            type: "setManufacturers",
            manufacturers: manufacturers,
          });
        } else {
          t("ERROR");
        }
      })
      .catch((r) => {
        console.error(r);
        toast.error(t("ERROR"));
      });
  }, [dispatch, t, client]);

  const categoryOptions = useMemo<SelectOption[]>(() => {
    if (!state.terminalEquipment || !state.terminalEquipmentSpecifications)
      return [];

    return categoryToOptions(
      state.terminalEquipmentSpecifications,
      state.terminalEquipment.specification.isRackEquipment
    );
  }, [state.terminalEquipment, state.terminalEquipmentSpecifications]);

  if (!state.terminalEquipment) return <></>;

  return (
    <div className="edit-terminal-equipment">
      <div className="full-row-group">
        <div className="full-row">
          <LabelContainer text={`${t("CATEGORY")}:`}>
            <SelectMenu
              onSelected={() => {}}
              options={categoryOptions}
              selected={state.terminalEquipment?.specification.category}
              disabled={true}
            />
          </LabelContainer>
        </div>
      </div>
      <div className="full-row">
        <DefaultButton
          onClick={() => {}}
          innerText={t("UPDATE")}
          disabled={true}
        />
      </div>
    </div>
  );
}

export default EditTerminalEquipment;
