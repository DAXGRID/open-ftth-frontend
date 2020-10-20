import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";

const SideMenu = ({ open }) => {
  return (
    <div className={open ? "side-menu show" : "side-menu"}>
      <ul>
        <li className="side-menu-item">
          <Link to="/">Home</Link>
        </li>
        <li className="side-menu-item">
          <Link to="/route-segment">Route segment</Link>
        </li>
      </ul>
    </div>
  );
};

export default SideMenu;
