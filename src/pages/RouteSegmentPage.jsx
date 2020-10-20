import React from "react";
import ListView from "../components/ListView";

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
    </div>
  );
}

export default RouteSegmentPage;
