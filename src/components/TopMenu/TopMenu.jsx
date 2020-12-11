import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';

function TopMenu({ toggleSideMenu }) {
  return (
    <div className="top-menu">
      <div
        className="side-menu-icon"
        role="button"
        tabIndex={0}
        onClick={toggleSideMenu}
        onKeyPress={(e) => (e.key === 'Enter' ? { toggleSideMenu } : () => {})}
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

TopMenu.propTypes = {
  toggleSideMenu: PropTypes.func.isRequired,
};

export default TopMenu;
