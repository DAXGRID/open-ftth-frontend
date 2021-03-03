import {
  faCut,
  faHighlighter,
  faSearchLocation,
} from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import { useQuery, useMutation } from "urql";
import { useParams } from "react-router-dom";
import DiagramMenu from "../../components/DiagramMenu";
import SchematicDiagram from "../../components/SchematicDiagram";
import ToggleButton from "../../components/ToggleButton";
import Loading from "../../components/Loading";

import { DiagramQueryResponse, GET_DIAGRAM_QUERY } from "./IdentifyFeatureGql";

function IdentifyFeaturePage() {
  const { id }: { id: string } = useParams();
  const [toggleButtons, setToggleButtons] = useState([
    { icon: faCut, toggled: false, id: 1 },
    { icon: faSearchLocation, toggled: false, id: 2 },
    { icon: faHighlighter, toggled: false, id: 3 },
  ]);

  const [spanEquipmentResult] = useQuery<DiagramQueryResponse>({
    query: GET_DIAGRAM_QUERY,
    variables: {
      routeNetworkElementId: id,
    },
  });

  useEffect(() => {
    document.title = id;
  }, [id]);

  function toggle(buttonId: number) {
    setToggleButtons(
      toggleButtons.map((button) =>
        button.id === buttonId
          ? { ...button, toggled: !button.toggled }
          : button
      )
    );
  }

  if (spanEquipmentResult.fetching) {
    return <Loading />;
  }

  if (!spanEquipmentResult.data) {
    throw new Error("SpanEquipmentResult cannot be empty");
  }

  const {
    diagramObjects,
    envelope,
  } = spanEquipmentResult.data.schematic.buildDiagram;

  return (
    <div className="identify-feature-page">
      <DiagramMenu>
        {toggleButtons.map((x) => (
          <ToggleButton
            key={x.id}
            icon={x.icon}
            toggled={x.toggled}
            toggle={toggle}
            id={x.id}
          />
        ))}
      </DiagramMenu>
      <SchematicDiagram
        diagramObjects={diagramObjects ?? []}
        envelope={envelope ?? {}}
      />
    </div>
  );
}

export default IdentifyFeaturePage;
