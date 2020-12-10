import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';

function TopMenu({ toggleSideMenu }) {
  return (
    <div className="top-menu">
      <div className="side-menu-icon" onClick={toggleSideMenu}>
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
