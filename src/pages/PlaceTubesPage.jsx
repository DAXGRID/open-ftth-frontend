import React from "react";
import ListView from "../components/ListView";
import SelectMenu from "../components/SelectMenu";
import DefaultButton from "../components/DefaultButton";

function PlaceTubesPage() {
  return (
    <div className="page-container">
      <div className="full-row">
        <ListView
          headerItems={["Manufacturer", "Type"]}
          bodyItems={[
            ["GM Plast", "Oe50 7x16"],
            ["Plast GM", "Oe40 16x7"],
            ["Plast GM", "Oe50 20x7"],
            ["GM Plast", "Oe70 7x16"],
          ]}
        />
      </div>

      <div className="full-row">
        <SelectMenu
          options={[
            { text: "Pick color marking", value: -1, selected: true },
            { text: "Red", value: 1, selected: false },
            { text: "Blue", value: 2, selected: false },
            { text: "Yellow", value: 3, selected: false },
          ]}
          removePlaceHolderOnSelect={true}
        />
      </div>

      <div className="full-row justify-end">
        <DefaultButton innerText="Place tubes" />
      </div>
    </div>
  );
}

export default PlaceTubesPage;
