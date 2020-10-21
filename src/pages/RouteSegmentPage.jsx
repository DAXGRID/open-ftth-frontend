import React from "react";
import ListView from "../components/ListView";
import SelectMenu from "../components/SelectMenu";

function RouteSegmentPage() {
  return (
    <div className="container-page">
      <ListView
        title="RouteSegment"
        headerItems={["Fabrikant", "Type"]}
        bodyItems={[
          ["GM Plast", "Oe50 7x16"],
          ["Plast GM", "Oe40 16x7"],
        ]}
      />
      <SelectMenu
        options={[
          { text: "Mercedes", value: 1, selected: true },
          { text: "Tesla", value: 2, selected: false },
          { text: "Mazda", value: 3, selected: false },
          { text: "Audi", value: 4, selected: false },
        ]}
      />
    </div>
  );
}

export default RouteSegmentPage;
