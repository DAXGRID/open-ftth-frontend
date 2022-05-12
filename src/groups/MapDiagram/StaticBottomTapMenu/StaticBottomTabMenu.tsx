import { ReactNode } from "react";

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

function StaticBottomTabMenu({
  views,
  selectedViewId,
  setSelectedViewId,
}: StaticBottomTapMenuProps) {
  return (
    <div className="static-bottom-tab-menu">
      {views.map((x) => {
        return (
          <div
            className={`static-bottom-tab-menu-container ${
              selectedViewId === x.id
                ? "static-bottom-tab-menu-container--show"
                : ""
            }`}
            key={x.id}
          >
            {x.view}
          </div>
        );
      })}
      <div className="static-bottom-tab-menu-menu">
        {views.map((x) => {
          return (
            <div
              onClick={() => setSelectedViewId(x.id)}
              key={x.id}
              className={`static-bottom-tab-menu-menu_item ${
                selectedViewId === x.id
                  ? "static-bottom-tab-menu-menu_item--selected"
                  : ""
              }`}
            >
              {x.text}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default StaticBottomTabMenu;
