type CustomOptionProps = {
  text: string;
  value: string | number;
  triggerSelected: (selected: string | number) => void;
  isSelected: boolean;
};

function CustomOption({
  text,
  value,
  triggerSelected,
  isSelected,
}: CustomOptionProps) {
  function keyPress(triggerValue: string | number) {
    triggerSelected(triggerValue);
  }

  return (
    <span
      role="button"
      tabIndex={0}
      className={isSelected ? "menu-option selected" : "menu-option"}
      data-value={value}
      onClick={() => triggerSelected(value)}
      onKeyPress={(e) => (e.key === "Enter" ? keyPress(value) : () => {})}
    >
      {text}
    </span>
  );
}

export default CustomOption;
