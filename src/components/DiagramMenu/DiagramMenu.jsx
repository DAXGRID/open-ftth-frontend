import React from "react";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearchLocation,
  faHighlighter,
  faCut,
} from "@fortawesome/free-solid-svg-icons";

function ToggleButton({ icon }) {
  return (
    <span className="icon-toggle-button">
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
      <ToggleButton icon={faSearchLocation} />
      <ToggleButton icon={faHighlighter} />
      <ToggleButton icon={faCut} />
    </div>
  );
}

export default DiagramMenu;
