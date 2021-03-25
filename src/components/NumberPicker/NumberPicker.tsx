export type NumberPickerProps = {
  value: number;
  setValue: (value: number) => void;
};

function NumberPicker({ value, setValue }: NumberPickerProps) {
  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const s = (event.target.value as unknown) as number;
    setValue(s);
  };

  return (
    <div className="number-picker">
      <input value={value} type="number" onChange={onChange} />
    </div>
  );
}

export default NumberPicker;
