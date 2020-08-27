import React from "react";
import FormInput from "../FormInput";

function NamingInfo() {
  return (
    <div>
      <h2>Identification</h2>
      <FormInput name="naming_info_name" />
      <FormInput name="naming_info_description" />
    </div>
  );
}

export default NamingInfo;
