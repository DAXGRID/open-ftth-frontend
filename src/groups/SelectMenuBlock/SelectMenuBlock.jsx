import React from "react";
import SelectMenu from "../../components/SelectMenu";

function SelectMenuBlock({ options, labelText }) {
  return (
    <div className="select-menu-block">
      <label className="select-menu-block__label">{labelText}</label>
      <SelectMenu options={options} />
    </div>
  );
}

export default SelectMenuBlock;
