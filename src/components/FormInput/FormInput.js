import React from "react";

function FormInput({ name }) {
  return (
    <div className="form-input">
      <label htmlFor={name}>{name}</label>
      <input id={name} name={name} type="text" />
    </div>
  );
}

export default FormInput;
