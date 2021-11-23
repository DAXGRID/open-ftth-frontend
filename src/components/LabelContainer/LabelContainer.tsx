import { ReactNode } from "react";

type LabelContainerProps = {
  text: string;
  children: ReactNode;
};

function LabelContainer({ text, children }: LabelContainerProps) {
  return (
    <div className="label-container">
      <label className="label-container__label">{text}</label>
      <div className="label-container-children">{children}</div>
    </div>
  );
}

export default LabelContainer;
