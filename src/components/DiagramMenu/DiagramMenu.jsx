import React from "react";
import PropTypes from "prop-types";

function DiagramMenu({ children }) {
  return (
    <div className="diagram-menu">
      <div className="diagram-menu-container">{children}</div>
    </div>
  );
}

DiagramMenu.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
};

export default DiagramMenu;
