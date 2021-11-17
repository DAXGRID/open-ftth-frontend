import SelectMenu from "../../components/SelectMenu";
import LabelContainer from "../../components/LabelContainer";
import DefaultButton from "../../components/DefaultButton";
import TextBox from "../../components/TextBox";
import EquipmentSelector from "./EquipmentSelector";
import { useTranslation, TFunction } from "react-i18next";

function FiberConnectionEditor() {
  const { t } = useTranslation();

  return (
    <div className="fiber-connection-editor">
      <div className="full-row">
        <LabelContainer text={t("FROM_EQUIPMENT")}>
          <SelectMenu
            options={[]}
            removePlaceHolderOnSelect
            onSelected={() => {}}
            selected={""}
          />
        </LabelContainer>
        <LabelContainer text={t("TO_EQUIPMENT")}>
          <SelectMenu
            options={[]}
            removePlaceHolderOnSelect
            onSelected={() => {}}
            selected={""}
          />
        </LabelContainer>
      </div>
      <div className="full-row">
        <LabelContainer text={t("FROM_POSITION")}>
          <SelectMenu
            options={[]}
            removePlaceHolderOnSelect
            onSelected={() => {}}
            selected={""}
          />
        </LabelContainer>
        <LabelContainer text={t("TO_POSITION")}>
          <SelectMenu
            options={[]}
            removePlaceHolderOnSelect
            onSelected={() => {}}
            selected={""}
          />
        </LabelContainer>
      </div>
      <div className="full-row">
        <LabelContainer text={t("NUMBER_OF_CONNECTIONS")}>
          <TextBox minWidth="250px" setValue={() => {}} value="10" />
        </LabelContainer>
        <LabelContainer text={t("FROM_EQUIPMENT_JUMP")}>
          <TextBox minWidth="250px" setValue={() => {}} value="10" />
        </LabelContainer>
        <LabelContainer text={t("PATCH/PIGTAIL_COORD_LENGTH_CM")}>
          <TextBox minWidth="250px" setValue={() => {}} value="10" />
        </LabelContainer>
      </div>
      <div className="full-row">
        <EquipmentSelector t={t} />
      </div>
      <div className="full-row center-items">
        <DefaultButton
          innerText={t("CONNECT")}
          maxWidth="500px"
          onClick={() => {
            console.log("Clicked");
          }}
        />
      </div>
    </div>
  );
}

export default FiberConnectionEditor;
