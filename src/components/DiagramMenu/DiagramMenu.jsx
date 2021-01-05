import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearchLocation,
  faHighlighter,
  faCut,
} from "@fortawesome/free-solid-svg-icons";

function DiagramMenu() {
  return (
    <div className="diagram-menu">
      <span className="icon-toggle-button">
        <FontAwesomeIcon icon={faSearchLocation} />
      </span>
      <span className="icon-toggle-button">
        <FontAwesomeIcon icon={faHighlighter} />
      </span>
      <span className="icon-toggle-button">
        <FontAwesomeIcon icon={faCut} />
      </span>
    </div>
  );
}

export default DiagramMenu;
