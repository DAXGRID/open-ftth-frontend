import { ReactNode } from "react";

interface TabViewHeaderProps {
  views: { title: string; id: string }[];
  selectedId: string;
  select: (id: string) => void;
}

function TabViewHeader({ views, selectedId, select }: TabViewHeaderProps) {
  return (
    <div className="tab-view-header">
      {views.map((x) => {
        return (
          <div
            key={x.id}
            role="button"
            onClick={() => select(x.id)}
            className={`tab-view-header-tab ${
              x.id === selectedId ? "tab-view-header-tab--selected" : ""
            }`}
          >
            {x.title}
          </div>
        );
      })}
    </div>
  );
}

interface TabViewProps {
  views: { view: ReactNode; title: string; id: string }[];
  selectedId: string;
  select: (id: string) => void;
}

function TabView({ views, selectedId, select }: TabViewProps) {
  const viewToShow = views.find((x) => x.id === selectedId);

  if (!viewToShow) throw Error(`Could not find view with id ${selectedId}`);

  return (
    <div className="tab-view">
      <TabViewHeader views={views} selectedId={selectedId} select={select} />
      {viewToShow?.view}
    </div>
  );
}

export default TabView;
