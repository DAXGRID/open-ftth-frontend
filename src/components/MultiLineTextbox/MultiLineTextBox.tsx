type MultiLineTextBoxProps = {
  value: string;
  setValue: (value: string) => void;
  rows?: number;
  resize: "auto" | "vertical" | "horizontal";
  readOnly?: boolean;
};

function MultiLineTextBox({
  value,
  setValue,
  rows,
  resize,
  readOnly,
}: MultiLineTextBoxProps) {
  return (
    <textarea
      readOnly={readOnly ?? false}
      style={{ resize: resize }}
      className="multi-line-text-box"
      value={value}
      rows={rows}
      onChange={(x) => setValue(x.target.value)}
    />
  );
}

export default MultiLineTextBox;
