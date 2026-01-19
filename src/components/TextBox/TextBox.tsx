type TextBoxProps = {
  placeHolder?: string;
  value: string;
  setValue: (value: string) => void;
  minWidth?: string;
  disabled?: boolean;
};

function TextBox({
  placeHolder,
  value,
  setValue,
  minWidth,
  disabled,
}: TextBoxProps) {
  return (
    <input
      style={{ minWidth }}
      className="text-box"
      type="text"
      disabled={disabled ?? false}
      value={value ?? ""}
      placeholder={placeHolder}
      onChange={(x) => setValue(x.target.value)}
    />
  );
}

export default TextBox;
