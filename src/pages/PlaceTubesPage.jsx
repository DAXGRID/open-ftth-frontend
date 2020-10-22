import React from "react";
import ListView from "../components/ListView";
import SelectMenuBlock from "../components/SelectMenuBlock";
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
        <SelectMenuBlock
          options={[
            { text: "Red", value: 1, selected: true },
            { text: "Blue", value: 2, selected: false },
            { text: "Yellow", value: 3, selected: false },
          ]}
          labelText="Markering"
        />
      </div>

      <div className="full-row justify-end">
        <DefaultButton innerText="Place tubes" />
      </div>
    </div>
  );
}

export default PlaceTubesPage;
