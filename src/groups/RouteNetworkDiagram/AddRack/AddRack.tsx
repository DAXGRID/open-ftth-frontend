import SelectMenu from "../../../components/SelectMenu";
import TextBox from "../../../components/TextBox";
import NumberPicker from "../../../components/NumberPicker";
import LabelContainer from "../../../components/LabelContainer";

function AddRack() {
  return (
    <div className="add-rack page-container">
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
        <LabelContainer text="Navn:">
          <TextBox setValue={() => {}} value="" />
        </LabelContainer>
      </div>
      <div className="full-row">
        <LabelContainer text="Hoejde units:">
          <NumberPicker setValue={() => {}} value={0} />
        </LabelContainer>
      </div>
    </div>
  );
}

export default AddRack;
