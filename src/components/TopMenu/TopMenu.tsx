import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";

type TopMenuProps = {
  toggleSideMenu: () => void;
}

function TopMenu({ toggleSideMenu }: TopMenuProps) {
  return (
    <div className="top-menu">
      <div
        className="side-menu-icon"
        role="button"
        tabIndex={0}
        onClick={() => toggleSideMenu()}
        onKeyPress={(e) => (e.key === "Enter" ? { toggleSideMenu } : () => { })}
      >
        <FontAwesomeIcon icon={faBars} />
      </div>
      <div className="top-menu-icon">
        <p>OpenFTTH</p>
      </div>
      <div className="top-menu-body" />
    </div>
  );
}

export default TopMenu;
