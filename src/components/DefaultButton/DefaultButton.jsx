import React from "react";

function DefaultButton({ onClick, innerText }) {
  return (
    <div>
      <button className="default-button" onClick={() => onClick}>
        {innerText}
      </button>
    </div>
  );
}

export default DefaultButton;
