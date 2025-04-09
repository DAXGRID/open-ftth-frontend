type MultiLineTextBoxProps = {
  value: string;
  setValue: (value: string) => void;
  rows?: number;
};

function MultiLineTextBox({ value, setValue, rows }: MultiLineTextBoxProps) {
  return (
    <textarea
      className="multi-line-text-box"
      value={value}
      rows={rows}
      onChange={(x) => setValue(x.target.value)}
    />
  );
}

export default MultiLineTextBox;
