import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faExclamationCircle,
  faCheckCircle,
  faQuestionCircle,
} from "@fortawesome/free-solid-svg-icons";

function Notification({ headerText, bodyText, type }) {
  const show = () => {
    return headerText && bodyText ? "show" : "";
  };

  const icon = () => {
    if (type === "success") {
      return faCheckCircle;
    } else if (type === "error") {
      return faExclamationCircle;
    } else {
      return faQuestionCircle;
    }
  };

  return (
    <div className={`notification ${type} ${show()}`}>
      <div className="notification-header">
        <p className="notification-header__title">
          <FontAwesomeIcon icon={icon()} /> {headerText}
        </p>
      </div>
      <div className="notification-body">
        <p className="notification-body__text">{bodyText}</p>
      </div>
    </div>
  );
}

export default Notification;
