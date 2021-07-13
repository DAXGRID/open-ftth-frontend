import { Link, useLocation } from "react-router-dom";

type SideMenuItemProps = {
  path: string;
  linkText: string;
};

function SideMenuItem({ path, linkText }: SideMenuItemProps) {
  const location = useLocation();

  return (
    <li
      className={
        location.pathname === path
          ? "side-menu-item side-menu-item--selected"
          : "side-menu-item"
      }
    >
      <Link to={path}>{linkText}</Link>
    </li>
  );
}

export default SideMenuItem;
