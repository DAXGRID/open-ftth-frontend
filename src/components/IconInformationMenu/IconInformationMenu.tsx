import { ReactNode } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconProp } from "@fortawesome/fontawesome-svg-core";

type IconInformationMenuProps = {
  icon: IconProp;
  children?: ReactNode;
};

function IconInformationMenu({ icon, children }: IconInformationMenuProps) {
  return (
    <div className="icon-information-menu">
      <FontAwesomeIcon icon={icon} />
      <div className="icon-information-menu-container">{children}</div>
    </div>
  );
}

export default IconInformationMenu;
