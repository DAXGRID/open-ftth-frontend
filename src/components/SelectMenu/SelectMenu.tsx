import { useState, useEffect } from "react";
import CustomOption from "./CustomOption";
import { useTranslation } from "react-i18next";

interface SelectOption {
  text: string;
  value: string | number;
  key?: string | number;
  disabled?: boolean;
}

type SelectMenuProps = {
  options: SelectOption[];
  removePlaceHolderOnSelect?: boolean;
  onSelected: (selected: number | string | undefined) => void;
  maxWidth?: string;
  maxHeight?: string;
  selected: string | number | undefined;
  enableSearch?: boolean;
  autoSelectFirst?: boolean;
  disabled?: boolean;
};

function SelectMenu({
  options,
  onSelected,
  maxWidth,
  maxHeight,
  selected,
  enableSearch,
  removePlaceHolderOnSelect,
  autoSelectFirst,
  disabled,
}: SelectMenuProps) {
  const [toggled, setToggled] = useState(false);
  const [search, setSearch] = useState("");
  const { t } = useTranslation();

  useEffect(() => {
    if (autoSelectFirst && !selected && options.length > 0) {
      onSelected(options[0].value);
    }
  }, [options, autoSelectFirst, selected, onSelected]);

  return (
    <div
      tabIndex={0}
      role="button"
      style={{ maxWidth }}
      className="select-menu-wrapper"
      onClick={() => setToggled(!toggled)}
      onKeyPress={(e) => (e.key === "Enter" ? setToggled(!toggled) : () => {})}
    >
      <div
        className={!disabled && toggled ? "menu-select open" : "menu-select"}
      >
        <div className={`menu-select__trigger ${disabled ? "disabled" : ""}`}>
          <span>{options.find((x) => x.value === selected)?.text}</span>
          <div className="arrow" />
        </div>
        <div className="menu-options" style={{ maxHeight }}>
          {enableSearch && (
            <input
              onClick={(e) => e.stopPropagation()}
              className="menu-option-search"
              type="text"
              value={search}
              placeholder={t("SEARCH")}
              onChange={(e) => setSearch(e.target.value)}
            />
          )}
          {removePlaceHolderOnSelect
            ? options
                .filter((x) => x.value && x.value !== -1)
                .filter((x) =>
                  x.text.toLowerCase().includes(search.toLowerCase()),
                )
                ?.map((option) => (
                  <CustomOption
                    key={option.key ?? option.value}
                    text={option.text}
                    triggerSelected={onSelected}
                    isSelected={option.value === selected}
                    value={option.value}
                    disabled={option.disabled ?? false}
                  />
                ))
            : options
                .filter((x) =>
                  x.text.toLowerCase().includes(search.toLowerCase()),
                )
                ?.map((option) => (
                  <CustomOption
                    key={option.key ?? option.value}
                    text={option.text}
                    triggerSelected={onSelected}
                    isSelected={option.value === selected}
                    value={option.value}
                    disabled={option.disabled ?? false}
                  />
                ))}
        </div>
      </div>
    </div>
  );
}

export type { SelectOption };
export default SelectMenu;
