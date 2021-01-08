import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  faSearchLocation,
  faHighlighter,
  faCut,
} from "@fortawesome/free-solid-svg-icons";
import SchematicDiagram from "../../components/SchematicDiagram";
import DiagramMenu from "../../components/DiagramMenu";
import ToggleButton from "../../components/ToggleButton";

function IdentifyFeaturePage() {
  const { id } = useParams();

  useEffect(() => {
    document.title = id;
  }, []);

  return (
    <div className="identify-feature-page">
      <DiagramMenu>
        <ToggleButton
          icon={faCut}
          toggled={false}
          toggle={() => {
            console.log("test");
          }}
        />
      </DiagramMenu>
      <SchematicDiagram />
    </div>
  );
}

export default IdentifyFeaturePage;
