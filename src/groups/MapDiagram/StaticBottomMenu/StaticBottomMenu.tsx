import { ReactNode } from "react";

interface StaticBottomMenuProps {
  children: ReactNode;
}

function StaticBottomMenu({ children }: StaticBottomMenuProps) {
  return (
    <div className="static-bottom-menu">
      <div className="static-bottom-menu-container">{children}</div>
      <div className="static-bottom-menu-menu">
        <div className="static-bottom-menu-menu_item">First tab</div>
        <div className="static-bottom-menu-menu_item">Second tab</div>
      </div>
    </div>
  );
}

export default StaticBottomMenu;
