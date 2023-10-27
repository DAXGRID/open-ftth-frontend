interface SelectMenuSvgIconProps {
  selectedItemId: string;
  selectedIconClickAction: () => void;
  menuOpen: boolean;
  actions: {
    id: string;
    icon: string;
    action: () => void;
  }[];
}

function SelectMenuSvgIcon({
  actions,
  selectedIconClickAction,
  menuOpen,
  selectedItemId,
}: SelectMenuSvgIconProps) {
  const selectedItem = actions.find((x) => x.id === selectedItemId);

  if (!selectedItem)
    throw Error(`Could not find selected item id with id ${selectedItemId}`);

  return (
    <div className="select-menu-svg-icon" tabIndex={0}>
      <span
        className="selected-menu-svg-icon-button"
        role="button"
        title={selectedItem.id}
        onClick={() => selectedIconClickAction()}
      >
        <img src={selectedItem.icon} alt={selectedItem.id} />
      </span>

      {menuOpen && (
        <div className="select-menu-svg-icon-select-list-container">
          <ul className="select-menu-svg-icon-select-list">
            {actions.map((x) => {
              return (
                <li key={x.id}>
                  <span
                    className="select-menu-svg-icon-button"
                    role="button"
                    title={x.id}
                    onClick={() => x.action()}
                  >
                    <img src={x.icon} alt={x.id} />
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

export default SelectMenuSvgIcon;
