type MultiLineTextBoxProps = {
  value: string;
  setValue: (value: string) => void;
  rows?: number;
  resize: "auto" | "vertical" | "horizontal";
};

function MultiLineTextBox({
  value,
  setValue,
  rows,
  resize,
}: MultiLineTextBoxProps) {
  return (
    <textarea
      style={{ resize: resize }}
      className="multi-line-text-box"
      value={value}
      rows={rows}
      onChange={(x) => setValue(x.target.value)}
    />
  );
}

export default MultiLineTextBox;
