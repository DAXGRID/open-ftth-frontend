import React from "react";

export type NumberPickerProps = {
  value: number;
  setValue: (value: number) => void;
  minWidth?: string;
  disabled?: boolean;
  minValue?: number;
  maxValue?: number;
};

function NumberPicker({
  value,
  setValue,
  minWidth,
  disabled,
  minValue,
  maxValue,
}: NumberPickerProps) {
  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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
    <div className="number-picker" style={{ minWidth }}>
      <input
        disabled={disabled ?? false}
        value={value.toString()}
        type="number"
        onChange={onChange}
      />
    </div>
  );
}

export default NumberPicker;
