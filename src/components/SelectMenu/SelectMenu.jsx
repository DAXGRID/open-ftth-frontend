import React, { useState, useEffect } from "react";

function CustomOption({ text, value, triggerSelected, selected }) {
  return (
    <span
      className={selected ? "menu-option selected" : "menu-option"}
      data-value={value}
      onClick={() => triggerSelected(value)}
    >
      {text}
    </span>
  );
}

function SelectMenu({
  options,
  removePlaceHolderOnSelect,
  onSelected,
  maxWidth,
}) {
  if (!options || options.length === 0) return <div></div>;

  const [toggled, setToggled] = useState(false);
  const [selected, setSelected] = useState({});
  const [selectOptions, setSelectOptions] = useState(options);

  useEffect(() => {
    const option = selectOptions.find((option) => option.selected === true);
    setSelected(option);
    options = selectOptions;
  }, [selectOptions]);

  useEffect(() => {
    if (onSelected) {
      onSelected(selected);
    }
  }, [selected]);

  const triggerSelected = (selectedValue) => {
    selectOptions.forEach((option) => (option.selected = false));
    const option = selectOptions.find(
      (option) => option.value === selectedValue
    );
    option.selected = true;
    setSelectOptions([...selectOptions]);

    if (removePlaceHolderOnSelect && selectedValue !== -1) {
      removePlaceHolder();
    }
  };

  const removePlaceHolder = () => {
    const newOptions = selectOptions.filter((option) => {
      return option.value !== -1;
    });

    setSelectOptions([...newOptions]);
  };

  return (
    <div
      style={{ maxWidth: maxWidth }}
      className="select-menu-wrapper"
      onClick={() => setToggled(!toggled)}
    >
      <div className={toggled ? "menu-select open" : "menu-select"}>
        <div className="menu-select__trigger">
          <span>{selected.text}</span>
          <div className="arrow"></div>
        </div>
        <div className="menu-options">
          {selectOptions.map((option) => {
            return (
              <CustomOption
                key={option.value}
                text={option.text}
                triggerSelected={triggerSelected}
                selected={option.selected}
                value={option.value}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default SelectMenu;
