import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconProp } from "@fortawesome/fontawesome-svg-core";

type ToggleButtonProps = {
  icon: IconProp | string;
  toggled: boolean;
  toggle: (id: number) => void;
  id: number;
};

function ToggleButton({ toggled, icon, toggle, id }: ToggleButtonProps) {
  function renderIcon(icon: IconProp | string) {
    if (typeof icon === "string") {
      return <img src={icon as string} />;
    } else {
      return <FontAwesomeIcon icon={icon as IconProp} />;
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => toggle(id)}
      onKeyPress={() => toggle(id)}
      className={toggled ? "toggle-button toggled" : "toggle-button"}
    >
      {renderIcon(icon)}
    </div>
  );
}

export default ToggleButton;
