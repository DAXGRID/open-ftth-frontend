import { useReducer, useEffect } from "react";
import { useClient } from "urql";
import { toast } from "react-toastify";
import { useTranslation, TFunction } from "react-i18next";
import SelectMenu, { SelectOption } from "../../../components/SelectMenu";
import TextBox from "../../../components/TextBox";
import DefaultButton from "../../../components/DefaultButton";
import LabelContainer from "../../../components/LabelContainer";
import { queryTerminalEquipmentDetails } from "./EditTerminalEquipmentGql";

interface State {
  categoryId: string | null;
  specificationId: string | null;
  manufacturerId: string | null;
}

const initialState: State = {
  categoryId: null,
  specificationId: null,
  manufacturerId: null,
};

type Action =
  | { type: "setCategoryId"; id: string }
  | { type: "setSpecificationId" }
  | { type: "reset" };

function reducer(state: State, action: Action) {
  switch (action.type) {
    case "setCategoryId":
      return { ...state, category: action.id };
    case "setSpecificationId":
      return { ...state };
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
  if (!terminalEquipmentId.trim()) {
    throw new Error("terminalEquipmentId was null empty or whitespace.");
  }

  const [state, dispatch] = useReducer(reducer, initialState);
  const { t } = useTranslation();
  const client = useClient();

  useEffect(() => {
    queryTerminalEquipmentDetails(client, terminalEquipmentId)
      .then((r) => {
        console.log(r.data?.utilityNetwork.terminalEquipment);
      })
      .catch((r) => {
        console.error(r);
        toast.error(t("ERROR"));
      });
  }, [terminalEquipmentId, dispatch, client, t]);

  return (
    <div className="edit-terminal-equipment">
      <div className="full-row-group">
        <div className="full-row">
          <LabelContainer text={`${t("CATEGORY")}:`}>
            <SelectMenu
              onSelected={() => {}}
              options={[]}
              selected={""}
              disabled={true}
            />
          </LabelContainer>
        </div>
      </div>
      <div className="full-row">
        <DefaultButton onClick={() => {}} innerText={t("UPDATE")} />
      </div>
    </div>
  );
}

export default EditTerminalEquipment;
