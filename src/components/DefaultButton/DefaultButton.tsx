import React from "react";

type DefaultButtonProps = {
  onClick: () => void;
  innerText: string | undefined;
  maxWidth: string | undefined;
};

function DefaultButton({ onClick, innerText, maxWidth }: DefaultButtonProps) {
  return (
    <button
      type="button"
      style={{ maxWidth }}
      className="default-button"
      onClick={() => onClick()}
    >
      {innerText}
    </button>
  );
}

export default DefaultButton;
