import { ReactNode } from "react";

type ModalContainerProps = {
  children?: ReactNode;
  show: boolean;
};

function ModalContainer({ children, show }: ModalContainerProps) {
  return (
    <div className={show ? "modal-container show" : "modal-container"}>
      <div className="modal-content">
        <div className="modal-header">
          <span className="close">&times;</span>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

export default ModalContainer;
