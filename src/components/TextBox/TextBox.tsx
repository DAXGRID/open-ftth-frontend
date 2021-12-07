type TextBoxProps = {
  placeHolder?: string;
  value: string;
  setValue: (value: string) => void;
  minWidth?: string;
};

function TextBox({ placeHolder, value, setValue, minWidth }: TextBoxProps) {
  return (
    <>
      <input
        style={{ minWidth }}
        className="text-box"
        type="text"
        value={value}
        placeholder={placeHolder}
        onChange={(x) => setValue(x.target.value)}
      />
    </>
  );
}

export default TextBox;
