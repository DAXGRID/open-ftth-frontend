import { ReactNode } from "react";

type ModalContainerProps = {
  children?: ReactNode;
  closeCallback: () => void;
  enableMaxSize?: boolean;
  title?: string;
  maxWidth?: string;
};

function ModalContainer({
  children,
  closeCallback,
  enableMaxSize,
  title,
  maxWidth,
}: ModalContainerProps) {
  return (
    <div className="modal" style={{ maxWidth: maxWidth ?? "800px" }}>
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
  );
}

export default ModalContainer;
