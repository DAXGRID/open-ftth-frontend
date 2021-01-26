type Row = {
  id: string | number;
  value: string;
};

declare type BodyItem = {
  rows: Row[];
  id: number | string;
  selected: boolean;
};

type SelectListViewProps = {
  title?: string;
  headerItems: string[];
  bodyItems: BodyItem[];
  selectItem: (selected: BodyItem) => void;
};

function SelectListView({
  title,
  headerItems,
  bodyItems,
  selectItem,
}: SelectListViewProps) {
  if (!bodyItems) return <div />;

  return (
    <div className="select-list-view">
      {title && (
        <div className="select-list-view-title">
          <h2>{title}</h2>
        </div>
      )}
      <div className="select-list-view-content">
        <div className="select-list-view-header">
          {headerItems.map((name) => (
            <div key={name} className="select-list-view-header-item">
              <p>{name}</p>
            </div>
          ))}
        </div>
        <div className="select-list-view-body">
          {bodyItems.map((row) => (
            <div key={row.id} className="select-list-view-body-row">
              {row.rows.map((item, index) => (
                <div
                  role="button"
                  key={item.id}
                  className={
                    row.selected
                      ? "select-list-view-body-item selected"
                      : "select-list-view-body-item"
                  }
                  onClick={() => selectItem(row)}
                  onKeyPress={() => selectItem(row)}
                  tabIndex={index}
                >
                  <p>{item.value}</p>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SelectListView;
