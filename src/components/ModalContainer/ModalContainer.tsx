import { ReactNode } from "react";

type ModalContainerProps = {
  children?: ReactNode;
  show: boolean;
};

function ModalContainer({ children, show }: ModalContainerProps) {
  return (
    <div className={show ? "modal-container show" : "modal-container"}>
      <div className="modal-content">
        <span className="close">&times;</span>
        {children}
      </div>
    </div>
  );
}

export default ModalContainer;
