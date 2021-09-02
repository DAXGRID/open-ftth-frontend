type TextBoxProps = {
  placeHolder?: string;
  value: string;
  setValue: (value: string) => void;
};

function TextBox({ placeHolder, value, setValue }: TextBoxProps) {
  return (
    <>
      <input
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
