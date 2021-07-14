import RouteNetworkMap from "../RouteNetworkMap";
import RouteNetworkDiagram from "../RouteNetworkDiagram";

function MapDiagram() {
  return (
    <div className="map-diagram">
      <div className="container">
        <RouteNetworkMap />
      </div>
      <div className="container">
        <RouteNetworkDiagram enableEditMode={false} />
      </div>
    </div>
  );
}

export default MapDiagram;
