import ModalContainer from "../../../components/ModalContainer";
import OutageView from "../OutageView";

export function outageViewModal(
  cb: () => void,
  title: string,
  routeElementId: string,
) {
  return (
    <ModalContainer title={title} closeCallback={cb}>
      <OutageView
        routeElementId={routeElementId}
        equipmentId={null}
        showSendButton={false}
      />
    </ModalContainer>
  );
}
