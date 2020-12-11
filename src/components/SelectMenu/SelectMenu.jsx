import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

function CustomOption({
  text, value, triggerSelected, selected,
}) {
  return (
    <span
      role="button"
      tabIndex={0}
      className={selected ? 'menu-option selected' : 'menu-option'}
      data-value={value}
      onClick={() => triggerSelected(value)}
      onKeyPress={(e) => (e.key === 'Enter' ? triggerSelected(value) : () => {})}
    >
      {text}
    </span>
  );
}

CustomOption.propTypes = {
  text: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]).isRequired,
  triggerSelected: PropTypes.func.isRequired,
  selected: PropTypes.bool.isRequired,
};

function SelectMenu({
  options,
  removePlaceHolderOnSelect,
  onSelected,
  maxWidth,
}) {
  if (!options || options.length === 0) return <div />;

  const [toggled, setToggled] = useState(false);
  const [selected, setSelected] = useState({});
  const [selectOptions, setSelectOptions] = useState(options);

  useEffect(() => {
    const option = selectOptions.find((o) => o.selected === true);
    setSelected(option);
    options = selectOptions;
  }, [selectOptions]);

  useEffect(() => {
    if (onSelected) {
      onSelected(selected);
    }
  }, [selected]);

  const triggerSelected = (selectedValue) => {
    let selectOptionsCopy = selectOptions.map((o) => {
      const option = { ...o, selected: o.value === selectedValue };
      return option;
    });

    if (removePlaceHolderOnSelect && selectedValue !== -1) {
      selectOptionsCopy = selectOptionsCopy.filter((option) => option.value !== -1);
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
      onKeyPress={(e) => (e.key === 'Enter' ? setToggled(!toggled) : () => {})}
    >
      <div className={toggled ? 'menu-select open' : 'menu-select'}>
        <div className="menu-select__trigger">
          <span>{selected.text}</span>
          <div className="arrow" />
        </div>
        <div className="menu-options">
          {selectOptions.map((option) => (
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

SelectMenu.propTypes = {
  options: PropTypes.arrayOf(PropTypes.shape({
    text: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]).isRequired,
    selected: PropTypes.bool.isRequired,
  })).isRequired,
  removePlaceHolderOnSelect: PropTypes.bool,
  onSelected: PropTypes.func,
  maxWidth: PropTypes.string,
};

SelectMenu.defaultProps = {
  removePlaceHolderOnSelect: false,
  onSelected: () => {},
  maxWidth: '',
};

export default SelectMenu;
