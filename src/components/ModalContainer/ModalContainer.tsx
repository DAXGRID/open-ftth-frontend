import { ReactNode } from "react";

type ModalContainerProps = {
  children?: ReactNode;
  show: boolean;
  closeCallback: () => void;
  enableMaxSize?: boolean;
};

function ModalContainer({
  children,
  show,
  closeCallback,
  enableMaxSize,
}: ModalContainerProps) {
  return (
    <div className={show ? "modal-container show" : "modal-container"}>
      <div className="modal-content">
        <div className="modal-header">
          <span role="button" onClick={() => closeCallback()} className="close">
            &times;
          </span>
        </div>
        <div
          className={
            enableMaxSize ? "modal-body modal-body--max-size" : "modal-body"
          }
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export default ModalContainer;
