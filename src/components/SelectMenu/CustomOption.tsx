type CustomOptionProps = {
  text: string;
  value: string | number;
  triggerSelected: (selected: string | number) => void;
  selected: boolean;
};

function CustomOption({
  text,
  value,
  triggerSelected,
  selected,
}: CustomOptionProps) {
  function keyPress(triggerValue: string | number) {
    triggerSelected(triggerValue);
  }

  return (
    <span
      role="button"
      tabIndex={0}
      className={selected ? "menu-option selected" : "menu-option"}
      data-value={value}
      onClick={() => triggerSelected(value)}
      onKeyPress={(e) => (e.key === "Enter" ? keyPress(value) : () => {})}
    >
      {text}
    </span>
  );
}

export default CustomOption;
