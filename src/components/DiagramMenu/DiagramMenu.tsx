import { ReactNode } from "react";

type DiagramMenuProps = {
  children: ReactNode;
};

function DiagramMenu({ children }: DiagramMenuProps) {
  return (
    <div className="diagram-menu">
      <div className="diagram-menu-container">{children}</div>
    </div>
  );
}

export default DiagramMenu;
