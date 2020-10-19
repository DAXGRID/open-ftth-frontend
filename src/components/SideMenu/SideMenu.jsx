import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome } from "@fortawesome/free-solid-svg-icons";

function SideMenu() {
  return (
    <div className="side-menu show">
      <ul className="menu-list">
        <li>
          <span>
            <FontAwesomeIcon icon={faHome} />
          </span>
          <p>Home</p>
        </li>
        <li>
          <span>
            <FontAwesomeIcon icon={faHome} />
          </span>
          <p>Home</p>
        </li>
        <li>
          <span>
            <FontAwesomeIcon icon={faHome} />
          </span>
          <p>Home</p>
        </li>
      </ul>
    </div>
  );
}

export default SideMenu;
