import { useState, useEffect, useCallback, useContext } from "react";
import { useLocation } from "react-router-dom";
import RouteNetworkMap from "../RouteNetworkMap";
import RouteNetworkDiagram from "../RouteNetworkDiagram";
import { MapContext } from "../../contexts/MapContext";
import TabMenuTop from "./TabMenuTop";
import { useTranslation } from "react-i18next";
import { UserContext } from "../../contexts/UserContext";
import { lookupLocation } from "./LocationGql";
import { useClient } from "urql";

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
  const client = useClient();

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
    const { kind, value } = getLocationUrlParameters(location.search);

    if (kind !== null && value !== null) {
      lookupLocation(client, kind, value)
        .then(response => {
          const location = response.data?.location.lookupLocation;
          if (location) {
            setLocationSearchResponse({
              envelope: {
                maxX: location.envelope.maxX,
                maxY: location.envelope.maxY,
                minX: location.envelope.minX,
                minY: location.envelope.minY
              },
              routeElementId: location.routeElementId,
              coordinate: { x: location.coordinate.x, y: location.coordinate.y },
            });
          } else {
            throw Error("Could not redirect to location, retrieved null value.");
          }
        });
    }
  }, [location.search, setLocationSearchResponse, client]);

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
