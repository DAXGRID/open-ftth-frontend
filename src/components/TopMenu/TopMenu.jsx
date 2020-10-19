import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";

function TopMenu() {
  return (
    <div className="top-menu">
      <div className="logo">
        <p>OpenFTTH</p>
      </div>

      <div className="middle-body"></div>

      <div className="side-menu-icon">
        <FontAwesomeIcon icon={faBars} />
      </div>
    </div>
  );
}

export default TopMenu;
