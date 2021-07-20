import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import SearchMenu from "./SearchMenu";

type TopMenuProps = {
  toggleSideMenu: () => void;
};

function TopMenu({ toggleSideMenu }: TopMenuProps) {
  return (
    <div className="top-menu">
      <div className="top-menu-body">
        <div
          className="side-menu-icon"
          role="button"
          tabIndex={0}
          onClick={() => toggleSideMenu()}
          onKeyPress={(e) =>
            e.key === "Enter" ? { toggleSideMenu } : () => {}
          }
        >
          <FontAwesomeIcon icon={faBars} />
        </div>
        <div className="top-menu-item">
          <SearchMenu />
        </div>
      </div>
    </div>
  );
}

export default TopMenu;
