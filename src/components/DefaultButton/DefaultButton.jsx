import React from "react";

function DefaultButton({ onClick, innerText, maxWidth }) {
  return (
    <button
      style={{ maxWidth: maxWidth }}
      className="default-button"
      onClick={() => onClick()}
    >
      {innerText}
    </button>
  );
}

export default DefaultButton;
