import { ReactNode } from "react";

type ModalContainerProps = {
  children?: ReactNode;
  show: boolean;
  closeCallback: () => void;
  enableMaxSize?: boolean;
  title?: string;
};

function ModalContainer({
  children,
  show,
  closeCallback,
  enableMaxSize,
  title,
}: ModalContainerProps) {
  return (
    <div className={show ? "modal-container show" : "modal-container"}>
      <div className="modal-content">
        <div className="modal-header">
          <p className="modal-header__title">{title}</p>
          <p role="button" onClick={() => closeCallback()} className="close">
            &times;
          </p>
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
