type CustomOptionProps = {
  text: string;
  value: string | number;
  triggerSelected: (selected: string | number) => void;
  isSelected: boolean;
  disabled: boolean;
};

function handleClassName(selected: boolean, disabled: boolean) {
  if (disabled) {
    return "menu-option disabled";
  }
  if (selected) {
    return "menu-option selected";
  }

  return "menu-option";
}

function CustomOption({
  text,
  value,
  triggerSelected,
  isSelected,
  disabled,
}: CustomOptionProps) {
  function keyPress(triggerValue: string | number) {
    triggerSelected(triggerValue);
  }

  return (
    <span
      role="button"
      tabIndex={0}
      className={handleClassName(isSelected, disabled)}
      data-value={value}
      onClick={() => !disabled && triggerSelected(value)}
      onKeyPress={(e) =>
        !disabled && (e.key === "Enter" ? keyPress(value) : () => {})
      }
    >
      {text}
    </span>
  );
}

export default CustomOption;
