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

function SelectMenu({ options }) {
  const [toggled, setToggled] = useState(false);
  const [selected, setSelected] = useState({});

  useEffect(() => {
    const option = options.find((option) => option.selected === true);
    setSelected(option);
  }, []);

  const triggerSelected = (selectedValue) => {
    options.forEach((option) => (option.selected = false));
    const option = options.find((option) => option.value === selectedValue);
    option.selected = true;
    setSelected(option);
  };

  return (
    <div className="select-menu-wrapper" onClick={() => setToggled(!toggled)}>
      <div className={toggled ? "menu-select open" : "menu-select"}>
        <div className="menu-select__trigger">
          <span>{selected.text}</span>
          <div className="arrow"></div>
        </div>
        <div className="menu-options">
          {options.map((option) => {
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
