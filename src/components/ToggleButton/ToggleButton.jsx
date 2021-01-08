import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import PropTypes from "prop-types";

function ToggleButton({ toggled, icon, toggle }) {
  return (
    <div
      role="button"
      tabIndex="0"
      onKeyPress={() => toggle()}
      className={toggled ? "toggle-button toggled" : "toggle-button"}
    >
      <FontAwesomeIcon icon={icon} />
    </div>
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
  toggled: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired,
};

export default ToggleButton;
