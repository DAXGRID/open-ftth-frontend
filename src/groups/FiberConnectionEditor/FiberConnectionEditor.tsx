import SelectMenu from "../../components/SelectMenu";
import LabelContainer from "../../components/LabelContainer";
import DefaultButton from "../../components/DefaultButton";
import TextBox from "../../components/TextBox";
import EquipmentSelector from "./EquipmentSelector";

function FiberConnectionEditor() {
  return (
    <div className="fiber-connection-editor">
      <div className="full-row">
        <LabelContainer text="From equipment:">
          <SelectMenu
            options={[]}
            removePlaceHolderOnSelect
            onSelected={() => {}}
            selected={""}
          />
        </LabelContainer>
        <LabelContainer text="To equipment:">
          <SelectMenu
            options={[]}
            removePlaceHolderOnSelect
            onSelected={() => {}}
            selected={""}
          />
        </LabelContainer>
      </div>
      <div className="full-row">
        <LabelContainer text="From position:">
          <SelectMenu
            options={[]}
            removePlaceHolderOnSelect
            onSelected={() => {}}
            selected={""}
          />
        </LabelContainer>
        <LabelContainer text="To position:">
          <SelectMenu
            options={[]}
            removePlaceHolderOnSelect
            onSelected={() => {}}
            selected={""}
          />
        </LabelContainer>
      </div>

      <div className="full-row">
        <LabelContainer text="Number of connections:">
          <TextBox minWidth="250px" setValue={() => {}} value="10" />
        </LabelContainer>
        <LabelContainer text="From equipment jump:">
          <TextBox minWidth="250px" setValue={() => {}} value="10" />
        </LabelContainer>
        <LabelContainer text="Patch/pigtail coord length(cm):">
          <TextBox minWidth="250px" setValue={() => {}} value="10" />
        </LabelContainer>
      </div>

      <div className="full-row">
        <EquipmentSelector />
      </div>

      <div className="full-row center-items">
        <DefaultButton
          innerText="Connect"
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
