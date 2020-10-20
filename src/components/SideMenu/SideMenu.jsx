import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faProjectDiagram } from "@fortawesome/free-solid-svg-icons";
import { Link, useLocation } from "react-router-dom";

function SideMenuItem({ path, linkText, icon }) {
  const location = useLocation();

  return (
    <li
      className={
        location.pathname === path
          ? "side-menu-item side-menu-item--selected"
          : "side-menu-item"
      }
    >
      <Link to={path}>
        <span className="side-menu-item-icon">
          <FontAwesomeIcon icon={icon} />{" "}
        </span>
        {linkText}
      </Link>
    </li>
  );
}

const SideMenu = ({ open }) => {
  return (
    <div className={open ? "side-menu show" : "side-menu"}>
      <ul>
        <SideMenuItem path="/" linkText="Home" icon={faHome} />
        <SideMenuItem
          path="/route-segment"
          linkText="Route segment"
          icon={faProjectDiagram}
        />
      </ul>
    </div>
  );
};

export default SideMenu;
