import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { Link, useLocation } from "react-router-dom";

type SideMenuItemProps = {
  path: string;
  linkText: string;
  icon: IconProp;
};

function SideMenuItem({ path, linkText, icon }: SideMenuItemProps) {
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
          <FontAwesomeIcon icon={icon} />
        </span>
        {linkText}
      </Link>
    </li>
  );
}

export default SideMenuItem;
