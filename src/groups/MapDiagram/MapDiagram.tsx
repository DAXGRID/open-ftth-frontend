import { useState, useEffect, useCallback, useContext } from "react";
import RouteNetworkMap from "../RouteNetworkMap";
import RouteNetworkDiagram from "../RouteNetworkDiagram";
import { MapContext } from "../../contexts/MapContext";
import TabMenuTop from "./TabMenuTop";
import { useTranslation } from "react-i18next";

function MapDiagram() {
  const { t } = useTranslation();
  const { identifiedFeature } = useContext(MapContext);
  const [showDiagram, setShowDiagram] = useState(true);
  const [selectedViewId, setSelectedViewId] = useState<number>(0);
  const [isDesktop, setDesktop] = useState<boolean | null>(null);

  useEffect(() => {
    // Hack to handle issue with map not being displayed fully.
    window.dispatchEvent(new Event("resize"));
  }, [showDiagram, identifiedFeature, selectedViewId]);

  useEffect(() => {
    const desktopMinSize = 1200;
    if (window.innerWidth > desktopMinSize) {
      setDesktop(true);
    } else {
      setDesktop(false);
    }

    const updateMedia = () => {
      if (window.innerWidth > desktopMinSize) {
        setDesktop(true);
      } else {
        setDesktop(false);
      }
    };
    window.addEventListener("resize", updateMedia);
    return () => window.removeEventListener("resize", updateMedia);
  }, []);

  const toggleDiagram = useCallback(
    (show: boolean) => {
      setShowDiagram(show);
    },
    [setShowDiagram]
  );

  if (isDesktop === null) {
    return <></>;
  }

  return (
    <>
      {isDesktop && (
        <div className="map-diagram map-diagram--desktop">
          <div className="container">
            <RouteNetworkMap showSchematicDiagram={toggleDiagram} />
          </div>
          <div
            className={
              showDiagram && identifiedFeature?.id && identifiedFeature.type
                ? "container"
                : "container hide"
            }
          >
            <RouteNetworkDiagram editable={false} />
          </div>
        </div>
      )}

      {!isDesktop && (
        <div className="map-diagram map-diagram--mobile">
          <TabMenuTop
            selectedViewId={selectedViewId}
            setSelectedViewId={setSelectedViewId}
            views={[
              {
                id: 0,
                text: t("MAP"),
                view: <RouteNetworkMap showSchematicDiagram={toggleDiagram} />,
              },
              {
                id: 1,
                text: t("DETAILS"),
                view: <RouteNetworkDiagram editable={false} />,
              },
            ]}
          ></TabMenuTop>
        </div>
      )}
    </>
  );
}

export default MapDiagram;
