import React, { useState } from "react";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearchLocation,
  faHighlighter,
  faCut,
} from "@fortawesome/free-solid-svg-icons";

function ToggleButton({ icon }) {
  const [toggled, setToggled] = useState(false);

  return (
    <span
      role="button"
      tabIndex="0"
      onKeyPress={() => setToggled(!toggled)}
      onClick={() => setToggled(!toggled)}
      className={toggled ? "icon-toggle-button toggled" : "icon-toggle-button"}
    >
      <FontAwesomeIcon icon={icon} />
    </span>
  );
}

ToggleButton.propTypes = {
  icon: PropTypes.shape(
    PropTypes.shape({
      icon: PropTypes.arrayOf(PropTypes.array),
      iconName: PropTypes.string,
      prefix: PropTypes.string,
    }).isRequired
  ).isRequired,
};

function DiagramMenu() {
  return (
    <div className="diagram-menu">
      <div className="diagram-menu-container">
        <ToggleButton icon={faSearchLocation} />
        <ToggleButton icon={faHighlighter} />
        <ToggleButton icon={faCut} />
      </div>
    </div>
  );
}

export default DiagramMenu;
