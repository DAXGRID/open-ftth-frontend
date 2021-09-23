import { useState } from "react";
import CustomOption from "./CustomOption";
import { useTranslation } from "react-i18next";

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
  enableSearch?: boolean;
};

function SelectMenu({
  options,
  onSelected,
  maxWidth,
  selected,
  enableSearch,
}: SelectMenuProps) {
  const [toggled, setToggled] = useState(false);
  const [search, setSearch] = useState("");
  const { t } = useTranslation();

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
          {options
            .filter((x) => x.text.toLowerCase().includes(search.toLowerCase()))
            ?.map((option) => (
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
