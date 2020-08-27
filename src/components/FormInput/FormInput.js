import React from "react";

function FormInput({ name }) {
  return (
    <div class="form-input">
      <label for={name}>{name}</label>
      <input id={name} name={name} type="text" value="" />
    </div>
  );
}

export default FormInput;
