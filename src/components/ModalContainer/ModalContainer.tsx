import { ReactNode } from "react";

type ModalContainerProps = {
  children?: ReactNode;
  show: boolean;
  closeCallback: () => void;
};

function ModalContainer({
  children,
  show,
  closeCallback,
}: ModalContainerProps) {
  return (
    <div className={show ? "modal-container show" : "modal-container"}>
      <div className="modal-content">
        <div className="modal-header">
          <span role="button" onClick={() => closeCallback()} className="close">
            &times;
          </span>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

export default ModalContainer;
