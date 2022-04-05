import { ReactNode } from "react";
import {
  faExpandArrowsAlt,
  faCompressArrowsAlt,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface TabViewHeaderProps {
  views: { title: string; id: string }[];
  selectedId: string;
  select: (id: string) => void;
  showFullscreenButton: boolean;
}

function TabViewHeader({
  views,
  selectedId,
  select,
  showFullscreenButton,
}: TabViewHeaderProps) {
  return (
    <div className="tab-view-header">
      <div className="tab-view-header-tabs">
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
      <div className="tab-view-header-actions">
        <div className="tab-view-header-actions-action ">
          <span role="button" className={""} onClick={() => console.log()}>
            <FontAwesomeIcon icon={faExpandArrowsAlt} />
          </span>
        </div>
      </div>
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
      <div className="tab-view-container">
        <TabViewHeader
          views={views}
          selectedId={selectedId}
          select={select}
          showFullscreenButton={true}
        />
        {viewToShow?.view}
      </div>
    </div>
  );
}

export default TabView;
