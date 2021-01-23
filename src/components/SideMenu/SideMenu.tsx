import {
  faHome,
  faProjectDiagram,
  faTasks,
} from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";
import SideMenuItem from "./SideMenuItem";

type SideMenuProps = {
  open: boolean;
};

const SideMenu = ({ open }: SideMenuProps) => {
  const { t } = useTranslation();

  return (
    <div className={open ? "side-menu show" : "side-menu"}>
      <ul>
        <SideMenuItem path="/" linkText={t("Home")} icon={faHome} />
        <SideMenuItem
          path="/place-tubes"
          linkText={t("Place conduit")}
          icon={faProjectDiagram}
        />
        <SideMenuItem
          path="/work-task"
          linkText={t("Work tasks")}
          icon={faTasks}
        />
      </ul>
    </div>
  );
};

export default SideMenu;
