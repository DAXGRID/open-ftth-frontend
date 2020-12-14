import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faExclamationCircle,
  faCheckCircle,
  faQuestionCircle,
} from "@fortawesome/free-solid-svg-icons";
import PropTypes from "prop-types";

function Notification({ headerText, bodyText, type }) {
  const show = () => (headerText && bodyText ? "show" : "");

  const icon = () => {
    if (type === "success") {
      return faCheckCircle;
    }
    if (type === "error") {
      return faExclamationCircle;
    }
    return faQuestionCircle;
  };

  return (
    <div className={`notification ${type} ${show()}`}>
      <div className="notification-header">
        <p className="notification-header__title">
          <FontAwesomeIcon icon={icon()} />
          {headerText}
        </p>
      </div>
      <div className="notification-body">
        <p className="notification-body__text">{bodyText}</p>
      </div>
    </div>
  );
}

Notification.propTypes = {
  headerText: PropTypes.string,
  bodyText: PropTypes.string,
  type: PropTypes.string,
};

Notification.defaultProps = {
  headerText: "",
  bodyText: "",
  type: "",
};

export default Notification;
