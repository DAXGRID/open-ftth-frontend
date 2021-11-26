import SelectMenu from "../../../components/SelectMenu";
import TextBox from "../../../components/TextBox";
import NumberPicker from "../../../components/NumberPicker";
import LabelContainer from "../../../components/LabelContainer";

function AddTerminalEquipment() {
  return (
    <div className="add-terminal-equipment">
      <div className="full-row-group">
        <p className="full-row-group__title">Fiberudstyr</p>
        <div className="full-row">
          <LabelContainer text="Category:">
            <SelectMenu
              options={[]}
              removePlaceHolderOnSelect
              onSelected={() => {}}
              selected={""}
            />
          </LabelContainer>
        </div>
        <div className="full-row">
          <LabelContainer text="Specification:">
            <SelectMenu
              options={[]}
              removePlaceHolderOnSelect
              onSelected={() => {}}
              selected={""}
            />
          </LabelContainer>
        </div>
        <div className="full-row">
          <LabelContainer text="Manufacturer:">
            <SelectMenu
              options={[]}
              removePlaceHolderOnSelect
              onSelected={() => {}}
              selected={""}
            />
          </LabelContainer>
        </div>
        <div className="full-row">
          <LabelContainer text="Name:">
            <TextBox value="" setValue={() => {}} />
          </LabelContainer>
        </div>
        <div className="full-row">
          <LabelContainer text="Antal:">
            <NumberPicker value={0} setValue={() => {}} />
          </LabelContainer>
        </div>
        <div className="full-row">
          <LabelContainer text="Start numerering:">
            <NumberPicker value={0} setValue={() => {}} />
          </LabelContainer>
        </div>
      </div>
      <div className="full-row-group">
        <p className="full-row-group__title">Rack 1</p>
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
    </div>
  );
}

export default AddTerminalEquipment;
