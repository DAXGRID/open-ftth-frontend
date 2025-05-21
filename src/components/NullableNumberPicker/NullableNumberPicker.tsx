import React from "react";

export type NullableNumberPickerProps = {
  value: number | null;
  setValue: (value: number | null) => void;
  minWidth?: string;
  disabled?: boolean;
  minValue?: number;
  maxValue?: number;
};

function NullableNumberPicker({
  value,
  setValue,
  minWidth,
  disabled,
  minValue,
  maxValue,
}: NullableNumberPickerProps) {
  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // This is done so empty value is an option.
    if (event.target.value === "") {
      setValue(null);
      return;
    }

    const noFrontZeros = event.target.value.replace(/^0+/, "");
    const number = noFrontZeros.length === 0 ? 0 : parseInt(noFrontZeros);

    if (minValue !== undefined && number < minValue) {
      setValue(minValue);
    } else if (maxValue !== undefined && number > maxValue) {
      setValue(maxValue);
    } else {
      setValue(number);
    }
  };

  return (
    <div className="nullable-number-picker" style={{ minWidth }}>
      <input
        disabled={disabled ?? false}
        value={value ?? ""}
        type="number"
        onChange={onChange}
      />
    </div>
  );
}

export default NullableNumberPicker;
