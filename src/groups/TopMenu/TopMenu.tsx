import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faTasks } from "@fortawesome/free-solid-svg-icons";
import SearchMenu from "./SearchMenu";

type TopMenuProps = {
  toggleSideMenu: () => void;
};

function TopMenu({ toggleSideMenu }: TopMenuProps) {
  return (
    <div className="top-menu">
      <div className="top-menu-body">
        <div className="top-menu-item">
          <div
            className="side-menu-icon"
            role="button"
            tabIndex={0}
            onClick={() => toggleSideMenu()}
            onKeyPress={(e) =>
              e.key === "Enter" ? { toggleSideMenu } : () => {}
            }
          >
            <FontAwesomeIcon icon={faBars} />
          </div>
        </div>
        <div className="top-menu-item top-menu-item__center">
          <SearchMenu />
        </div>
        <div className="top-menu-item top-menu-item__end">
          <FontAwesomeIcon icon={faTasks} />
        </div>
      </div>
    </div>
  );
}

export default TopMenu;
