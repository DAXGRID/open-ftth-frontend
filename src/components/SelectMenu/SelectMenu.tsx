import { useState } from "react";
import CustomOption from "./CustomOption";

interface SelectOption {
  text: string;
  value: string | number;
  key?: string | number;
}

type SelectMenuProps = {
  options: SelectOption[];
  removePlaceHolderOnSelect?: boolean;
  onSelected: (selected: number | string | undefined) => void;
  maxWidth?: string;
  selected: string | number | undefined;
};

function SelectMenu({
  options,
  onSelected,
  maxWidth,
  selected,
}: SelectMenuProps) {
  const [toggled, setToggled] = useState(false);

  return (
    <div
      tabIndex={0}
      role="button"
      style={{ maxWidth }}
      className="select-menu-wrapper"
      onClick={() => setToggled(!toggled)}
      onKeyPress={(e) => (e.key === "Enter" ? setToggled(!toggled) : () => {})}
    >
      <div className={toggled ? "menu-select open" : "menu-select"}>
        <div className="menu-select__trigger">
          <span>{options.find((x) => x.value === selected)?.text}</span>
          <div className="arrow" />
        </div>
        <div className="menu-options">
          {options?.map((option) => (
            <CustomOption
              key={option.key ?? option.value}
              text={option.text}
              triggerSelected={onSelected}
              isSelected={option.value === selected}
              value={option.value}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export type { SelectOption };
export default SelectMenu;
