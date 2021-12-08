import { ReactNode } from "react";

type ModalContainerProps = {
  children?: ReactNode;
  show: boolean;
  closeCallback: () => void;
  enableMaxSize?: boolean;
  title?: string;
  maxWidth?: string;
};

function ModalContainer({
  children,
  show,
  closeCallback,
  enableMaxSize,
  title,
  maxWidth,
}: ModalContainerProps) {
  return (
    <div className={show ? "modal-overlay show" : "modal-overlay"}>
      <div className="modal-content" style={{ maxWidth: maxWidth ?? "800px" }}>
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
