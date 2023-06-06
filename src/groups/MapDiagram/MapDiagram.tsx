import { useState, useEffect, useCallback, useContext } from "react";
import { useLocation } from "react-router-dom";
import RouteNetworkMap from "../RouteNetworkMap";
import RouteNetworkDiagram from "../RouteNetworkDiagram";
import { MapContext } from "../../contexts/MapContext";
import TabMenuTop from "./TabMenuTop";
import { useTranslation } from "react-i18next";
import { UserContext } from "../../contexts/UserContext";

interface LocationSearchResponse {
  envelope: {
    maxX: number;
    maxY: number;
    minX: number;
    minY: number;
  };
  routeElementId: string;
  coordinate: {
    x: number;
    y: number;
  };
}

interface LocationParameters {
  kind: string | null;
  value: string | null;
}

function getLocationUrlParameters(
  parametersString: string
): LocationParameters {
  const searchParams = new URLSearchParams(parametersString);
  return {
    kind: searchParams.get("locationKind"),
    value: searchParams.get("locationValue"),
  };
}

function MapDiagram() {
  const { t } = useTranslation();
  const { identifiedFeature, setIdentifiedFeature } = useContext(MapContext);
  const { hasRoles } = useContext(UserContext);
  const [showDiagram, setShowDiagram] = useState(true);
  const [selectedViewId, setSelectedViewId] = useState<number>(0);
  const [isDesktop, setDesktop] = useState<boolean | null>(null);
  const [locationSearchResponse, setLocationSearchResponse] =
    useState<LocationSearchResponse | null>(null);
  const location = useLocation();

  useEffect(() => {
    // Hack to handle issue with map not being displayed fully.
    window.dispatchEvent(new Event("resize"));
  }, [showDiagram, identifiedFeature, selectedViewId]);

  useEffect(() => {
    const desktopMinSize = 1200;

    const updateMediaSize = () => {
      if (window.innerWidth > desktopMinSize) {
        setDesktop(true);
      } else {
        setDesktop(false);
      }
    };

    updateMediaSize();

    window.addEventListener("resize", updateMediaSize);
    return () => window.removeEventListener("resize", updateMediaSize);
  }, []);

  useEffect(() => {
    // TODO call GraphQL
    const { kind, value } = getLocationUrlParameters(location.search);
    setTimeout(() => {
      if (kind && value) {
        const envelope = {
          maxX: 9.846643823320909,
          maxY: 55.84230941549938,
          minX: 9.841922420538234,
          minY: 55.83975657387827,
        };
        setLocationSearchResponse({
          envelope: envelope,
          routeElementId: "232df597-6217-4c26-bb76-95975db1812b",
          coordinate: { x: 9.84454407055106, y: 55.84098217939197 },
        });
      }
    }, 10);
  }, [location.search, setLocationSearchResponse]);

  useEffect(() => {
    if (locationSearchResponse) {
      setIdentifiedFeature({
        id: locationSearchResponse.routeElementId,
        type: "RouteNode",
      });
    }
  }, [locationSearchResponse, setIdentifiedFeature]);

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
            <RouteNetworkMap
              showSchematicDiagram={toggleDiagram}
              initialEnvelope={locationSearchResponse?.envelope}
              initialMarker={locationSearchResponse?.coordinate}
            />
          </div>
          <div
            className={
              showDiagram && identifiedFeature?.id && identifiedFeature.type
                ? "container"
                : "container hide"
            }
          >
            <RouteNetworkDiagram editable={hasRoles("writer")} />
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
                view: (
                  <RouteNetworkMap
                    showSchematicDiagram={toggleDiagram}
                    initialEnvelope={locationSearchResponse?.envelope}
                    initialMarker={locationSearchResponse?.coordinate}
                  />
                ),
              },
              {
                id: 1,
                text: t("DETAILS"),
                view: <RouteNetworkDiagram editable={hasRoles("writer")} />,
              },
            ]}
          ></TabMenuTop>
        </div>
      )}
    </>
  );
}

export default MapDiagram;
