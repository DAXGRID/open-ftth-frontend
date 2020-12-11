import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import SchematicDiagram from "../../components/SchematicDiagram";

function IdentifyFeaturePage() {
  const { id } = useParams();

  useEffect(() => {
    document.title = id;
  }, []);

  return (
    <div style={{ width: "100%" }}>
      <SchematicDiagram />
    </div>
  );
}

export default IdentifyFeaturePage;
