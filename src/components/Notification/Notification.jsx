import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationCircle } from "@fortawesome/free-solid-svg-icons";

function Notification({ headerText, bodyText, type }) {
  const show = () => {
    return headerText && bodyText ? "show" : "";
  };

  return (
    <div className={`notification ${type} ${show()}`}>
      <div className="notification-header">
        <p className="notification-header__title">
          <FontAwesomeIcon icon={faExclamationCircle} /> {headerText}
        </p>
      </div>
      <div className="notification-body">
        <p className="notification-body__text">{bodyText}</p>
      </div>
    </div>
  );
}

export default Notification;
