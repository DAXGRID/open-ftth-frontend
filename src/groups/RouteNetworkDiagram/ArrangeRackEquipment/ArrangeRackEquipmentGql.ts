import { Client } from "urql";

export function arrangeRackEquipmentMutation(
  client: Client,
  param: ArrangeRackEquipmentParams,
) {
  return client.mutation<ArrangeRackEquipmentResponse>(
    ARRANGE_RACK_EQUIPMENT,
    param,
  ).toPromise();
}

interface ArrangeRackEquipmentResponse {
  nodeContainer: {
    arrangeRackEquipment: {
      isSuccess: boolean;
      errorCode: string;
      errorMessage: string;
    };
  };
}

interface ArrangeRackEquipmentParams {
  routeNodeId: string;
  terminalEquipmentId: string;
  arrangeMethod: "MOVE_UP" | "MOVE_DOWN";
  numberOfRackPositions: number;
}

const ARRANGE_RACK_EQUIPMENT = `
mutation(
$routeNodeId: ID!,
$terminalEquipmentId: ID!,
$arrangeMethod: RackEquipmentArrangeMethodEnum!,
$numberOfRackPositions: Int!
) {
  nodeContainer {
    arrangeRackEquipment(
      routeNodeId: $routeNodeId
      terminalEquipmentId: $terminalEquipmentId
      arrangeMethod: $arrangeMethod
      numberOfRackPositions: $numberOfRackPositions
    ) {
      isSuccess
      errorCode
      errorMessage
    }
  }
}
`;
