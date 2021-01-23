import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconProp } from '@fortawesome/fontawesome-svg-core';

type ToggleButtonProps = {
  icon: IconProp;
  toggled: boolean;
  toggle: (id: number) => void;
  id: number;
}

function ToggleButton({ toggled, icon, toggle, id }: ToggleButtonProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => toggle(id)}
      onKeyPress={() => toggle(id)}
      className={toggled ? "toggle-button toggled" : "toggle-button"}
    >
      <FontAwesomeIcon icon={icon} />
    </div>
  );
}

export default ToggleButton;
