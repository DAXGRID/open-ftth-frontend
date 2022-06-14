type Row = {
  id: string | number;
  value: string;
};

type BodyItem = {
  rows: Row[];
  id: number | string;
};

type SelectListViewProps = {
  title?: string;
  headerItems: string[];
  bodyItems: BodyItem[];
  selectItem: (selected: BodyItem) => void;
  selected?: number | string;
  maxHeightBody?: string;
};

function SelectListView({
  title,
  headerItems,
  bodyItems,
  selectItem,
  selected,
  maxHeightBody,
}: SelectListViewProps) {
  return (
    <div className="select-list-view">
      {title && (
        <div className="select-list-view-title">
          <h2>{title}</h2>
        </div>
      )}
      <div className="select-list-view-content">
        <div className="select-list-view-header select-list-view-grid">
          {headerItems.map((name) => (
            <div key={name} className="select-list-view-header-item">
              <p>{name}</p>
            </div>
          ))}
        </div>
        <div
          className="select-list-view-body "
          style={
            maxHeightBody ? { maxHeight: maxHeightBody, overflowY: "auto" } : {}
          }
        >
          {bodyItems.map((row) => (
            <div
              key={row.id}
              className="select-list-view-body-row select-list-view-grid"
            >
              {row.rows.map((item, index) => (
                <div
                  role="button"
                  key={item.id}
                  className={
                    row.id === selected
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

export type { BodyItem, Row };
export default SelectListView;
