import { ReactNode, useRef } from "react";
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
  toggleFullscreen: () => void;
}

function TabViewHeader({
  views,
  selectedId,
  select,
  showFullscreenButton,
  toggleFullscreen,
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
        {showFullscreenButton && (
          <div
            className="tab-view-header-actions-action"
            onClick={() => toggleFullscreen()}
          >
            <span role="button">
              <FontAwesomeIcon icon={faExpandArrowsAlt} />
            </span>
          </div>
        )}
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
  const tabViewElement = useRef<HTMLDivElement>(null);

  if (!viewToShow) throw Error(`Could not find view with id ${selectedId}`);

  const toggleFullscreen = () => {
    const fixedFitClassName = "fixed-fit-container";
    const hasFixedFitContainer =
      tabViewElement.current?.classList.contains(fixedFitClassName);

    if (hasFixedFitContainer) {
      tabViewElement.current?.classList.remove(fixedFitClassName);
    } else {
      tabViewElement.current?.classList.add(fixedFitClassName);
    }
  };

  return (
    <div className="tab-view" ref={tabViewElement}>
      <div className="tab-view-container">
        <TabViewHeader
          views={views}
          selectedId={selectedId}
          select={select}
          showFullscreenButton={true}
          toggleFullscreen={toggleFullscreen}
        />
        {viewToShow?.view}
      </div>
    </div>
  );
}

export default TabView;
