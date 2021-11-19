export type NumberPickerProps = {
  value: number;
  setValue: (value: number) => void;
  minWidth?: string;
  disabled?: boolean;
};

function NumberPicker({
  value,
  setValue,
  minWidth,
  disabled,
}: NumberPickerProps) {
  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const removeFrontZeros = event.target.value.replace(/^0+/, "");
    setValue(removeFrontZeros.length === 0 ? 0 : parseInt(removeFrontZeros));
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
