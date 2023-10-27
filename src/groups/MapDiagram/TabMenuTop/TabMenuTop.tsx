import { ReactNode } from "react";
import {} from "react-i18next";

interface View {
  text: string;
  view: ReactNode;
  id: number;
}

interface StaticBottomTapMenuProps {
  views: View[];
  selectedViewId: number;
  setSelectedViewId: (id: number) => void;
}

function TabMenuTop({
  views,
  selectedViewId,
  setSelectedViewId,
}: StaticBottomTapMenuProps) {
  return (
    <div className="tab-menu-top">
      <div className="tab-menu-top-menu">
        {views.map((x) => {
          return (
            <div
              onClick={() => setSelectedViewId(x.id)}
              key={x.id}
              className={`tab-menu-top-menu_item ${
                selectedViewId === x.id
                  ? "tab-menu-top-menu_item--selected"
                  : ""
              }`}
            >
              {x.text}
            </div>
          );
        })}
      </div>
      {views.map((x) => {
        return (
          <div
            className={`tab-menu-top-container ${
              selectedViewId === x.id ? "tab-menu-top-container--show" : ""
            }`}
            key={x.id}
          >
            {x.view}
          </div>
        );
      })}
    </div>
  );
}

export default TabMenuTop;
