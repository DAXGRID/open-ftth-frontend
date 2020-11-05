import React from "react";

function DefaultButton({ onClick, innerText }) {
  return (
    <button className="default-button" onClick={() => onClick()}>
      {innerText}
    </button>
  );
}

export default DefaultButton;
