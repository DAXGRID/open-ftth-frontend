import { ReactNode, useRef, useState } from "react";
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
  isFullscreen: boolean;
}

function TabViewHeader({
  views,
  selectedId,
  select,
  showFullscreenButton,
  toggleFullscreen,
  isFullscreen,
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
              <FontAwesomeIcon
                icon={isFullscreen ? faCompressArrowsAlt : faExpandArrowsAlt}
              />
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
  showFullScreenButton?: boolean | null;
}

function TabView({ views, selectedId, select, showFullScreenButton }: TabViewProps) {
  const viewToShow = views.find((x) => x.id === selectedId);
  const tabViewElement = useRef<HTMLDivElement>(null);
  const fixedFitClassName = "fixed-fit-container";
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);

  if (!viewToShow) throw Error(`Could not find view with id ${selectedId}`);

  const toggleFullscreen = () => {
    if (isFullScreen) {
      tabViewElement.current?.classList.remove(fixedFitClassName);
      setIsFullScreen(false);
    } else {
      tabViewElement.current?.classList.add(fixedFitClassName);
      setIsFullScreen(true);
    }
  };

  return (
    <div className="tab-view" ref={tabViewElement}>
      <div className="tab-view-container">
        <TabViewHeader
          views={views}
          selectedId={selectedId}
          select={select}
          showFullscreenButton={showFullScreenButton ?? false ? true : false}
          toggleFullscreen={toggleFullscreen}
          isFullscreen={isFullScreen}
        />
        {viewToShow?.view}
      </div>
    </div>
  );
}

export default TabView;
