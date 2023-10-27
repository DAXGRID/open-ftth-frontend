import { useContext, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faTasks } from "@fortawesome/free-solid-svg-icons";
import { UserContext } from "../../contexts/UserContext";
import SearchMenu from "./SearchMenu";
import IconInformationMenu from "../../components/IconInformationMenu";
import { useTranslation } from "react-i18next";
import SelectMenuSvgIcon from "../../components/SelectMenuSvgIcons";
import { FlagDenmarkSvg, FlagGreatBritainSvg } from "../../assets/index";

type TopMenuProps = {
  toggleSideMenu: () => void;
};

function TopMenu({ toggleSideMenu }: TopMenuProps) {
  const { userWorkTask } = useContext(UserContext);
  const { t, i18n } = useTranslation();
  const [languageMenuOpen, setLanguageMenuOpen] = useState<boolean>(false);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem("language", lng);
  };

  const toggleSetLanguageMenuOpen = () => {
    setLanguageMenuOpen(!languageMenuOpen);
  };

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
          <SelectMenuSvgIcon
            selectedItemId={i18n.language}
            selectedIconClickAction={toggleSetLanguageMenuOpen}
            menuOpen={languageMenuOpen}
            actions={[
              {
                id: "en",
                action: () => {
                  changeLanguage("en");
                  toggleSetLanguageMenuOpen();
                },
                icon: FlagGreatBritainSvg,
              },
              {
                id: "dk",
                action: () => {
                  changeLanguage("dk");
                  toggleSetLanguageMenuOpen();
                },
                icon: FlagDenmarkSvg,
              },
            ]}
          />
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
