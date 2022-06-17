import { useContext } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faTasks } from "@fortawesome/free-solid-svg-icons";
import { UserContext } from "../../contexts/UserContext";
import SearchMenu from "./SearchMenu";
import IconInformationMenu from "../../components/IconInformationMenu";
import { useTranslation } from "react-i18next";

type TopMenuProps = {
  toggleSideMenu: () => void;
};

function TopMenu({ toggleSideMenu }: TopMenuProps) {
  const { userWorkTask } = useContext(UserContext);
  const { t } = useTranslation();

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
          <IconInformationMenu icon={faTasks}>
            <span>
              {!userWorkTask?.name
                ? t("NO_SELECTED_WORK_TASK")
                : `${userWorkTask.number} ${userWorkTask.name}`}
            </span>
          </IconInformationMenu>
        </div>
      </div>
    </div>
  );
}

export default TopMenu;
