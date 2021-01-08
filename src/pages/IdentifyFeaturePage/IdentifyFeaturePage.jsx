import {
  faCut,
  faHighlighter,
  faSearchLocation,
} from "@fortawesome/free-solid-svg-icons";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import DiagramMenu from "../../components/DiagramMenu";
import SchematicDiagram from "../../components/SchematicDiagram";
import ToggleButton from "../../components/ToggleButton";

function IdentifyFeaturePage() {
  const { id } = useParams();
  const [toggleButtons, setToggleButtons] = useState([
    { icon: faCut, toggled: false, id: 1 },
    { icon: faSearchLocation, toggled: false, id: 2 },
    { icon: faHighlighter, toggled: false, id: 3 },
  ]);

  useEffect(() => {
    document.title = id;
  }, []);

  function toggle(buttonId) {
    setToggleButtons(
      toggleButtons.map((button) =>
        button.id === buttonId
          ? { ...button, toggled: !button.toggled }
          : button
      )
    );
  }

  return (
    <div className="identify-feature-page">
      <DiagramMenu>
        {toggleButtons.map((x) => (
          <ToggleButton
            key={x.id}
            icon={x.icon}
            toggled={x.toggled}
            toggle={toggle}
            id={x.id}
          />
        ))}
      </DiagramMenu>
      <SchematicDiagram />
    </div>
  );
}

export default IdentifyFeaturePage;
