import { ReactNode } from "react";

type SideMenuProps = {
  open: boolean;
  children: ReactNode;
};

const SideMenu = ({ open, children }: SideMenuProps) => {
  return (
    <div className={open ? "side-menu show" : "side-menu"}>
      <ul>{children}</ul>
    </div>
  );
};

export default SideMenu;
