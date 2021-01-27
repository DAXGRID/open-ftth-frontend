import { useState, useEffect } from "react";
import CustomOption from "./CustomOption";

interface SelectOption {
  text: string;
  value: string | number;
  selected: boolean;
}

type SelectMenuProps = {
  options: SelectOption[];
  removePlaceHolderOnSelect?: boolean;
  onSelected: (selected: SelectOption | undefined) => void;
  maxWidth?: string;
};

function SelectMenu({
  options,
  removePlaceHolderOnSelect,
  onSelected,
  maxWidth,
}: SelectMenuProps) {
  const [toggled, setToggled] = useState(false);
  const [selected, setSelected] = useState<SelectOption>();
  const [selectOptions, setSelectOptions] = useState(options);

  useEffect(() => {
    setSelectOptions(options);
  }, [options]);

  useEffect(() => {
    const option = selectOptions?.find((o) => o.selected === true);
    setSelected(option);
    options = selectOptions;
  }, [selectOptions]);

  useEffect(() => {
    if (onSelected) {
      onSelected(selected);
    }
  }, [selected]);

  const triggerSelected = (selectedValue: string | number) => {
    let selectOptionsCopy = selectOptions.map((o) => {
      const option = { ...o, selected: o.value === selectedValue };
      return option;
    });

    if (removePlaceHolderOnSelect && selectedValue !== -1) {
      selectOptionsCopy = selectOptionsCopy.filter(
        (option) => option.value !== -1
      );
    }

    setSelectOptions([...selectOptionsCopy]);
  };

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
          <span>{selected?.text}</span>
          <div className="arrow" />
        </div>
        <div className="menu-options">
          {selectOptions?.map((option) => (
            <CustomOption
              key={option.value}
              text={option.text}
              triggerSelected={triggerSelected}
              selected={option.selected}
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
