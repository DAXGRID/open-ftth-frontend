import { useState } from "react";
import DefaultButton from "../../../components/DefaultButton";
import NumberPicker from "../../../components/NumberPicker";
import SelectMenu from "../../../components/SelectMenu";
import LabelContainer from "../../../components/LabelContainer";
import { arrangeRackEquipmentMutation } from "./ArrangeRackEquipmentGql";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { useClient } from "urql";

interface ArrangeRackEquipmentProps {
  routeElementId: string;
  terminalEquipmentId: string;
}

function ArrangeRackEquipment({
  routeElementId,
  terminalEquipmentId,
}: ArrangeRackEquipmentProps) {
  const { t } = useTranslation();
  const client = useClient();
  const [positionMoveCount, setPositionMoveCount] = useState<number>(1);
  const [moveDirection, setMoveDirection] = useState<"MOVE_UP" | "MOVE_DOWN">(
    "MOVE_UP",
  );

  const executeArrange = async () => {
    if (!routeElementId) {
      throw Error("Could not get route element id.");
    }

    if (!terminalEquipmentId) {
      throw Error("Could not get terminal equipment id.");
    }

    if (!positionMoveCount) {
      throw Error("Could not get position move count.");
    }

    if (!moveDirection) {
      throw Error("Could not get move direction.");
    }

    const response = await arrangeRackEquipmentMutation(client, {
      arrangeMethod: moveDirection,
      routeNodeId: routeElementId,
      numberOfRackPositions: positionMoveCount,
      terminalEquipmentId: terminalEquipmentId,
    });

    if (!response.data?.nodeContainer.arrangeRackEquipment.isSuccess) {
      toast.error(
        t(
          response.data?.nodeContainer.arrangeRackEquipment.errorCode ??
            "ERROR",
        ),
      );
    }
  };

  return (
    <div className="arrange-terminal-equipment">
      <div className="full-row gap-default">
        <LabelContainer text={t("DIRECTION")}>
          <SelectMenu
            onSelected={(x) => setMoveDirection(x as "MOVE_UP" | "MOVE_DOWN")}
            selected={moveDirection}
            options={[
              { text: t("MOVE_UP"), value: "MOVE_UP", key: 0 },
              { text: t("MOVE_DOWN"), value: "MOVE_DOWN", key: 1 },
            ]}
          />
        </LabelContainer>
        <LabelContainer text={t("AMOUNT_RACK_UNITS")}>
          <NumberPicker
            minValue={1}
            maxValue={200}
            value={positionMoveCount}
            setValue={(value) => setPositionMoveCount(value)}
          />
        </LabelContainer>
      </div>
      <div className="full-row center-items">
        <DefaultButton
          maxWidth="400"
          innerText={t("MOVE")}
          onClick={() => executeArrange()}
        />
      </div>
    </div>
  );
}

export default ArrangeRackEquipment;
