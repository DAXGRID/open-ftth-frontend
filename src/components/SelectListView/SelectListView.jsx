import React from "react";

function SelectListView({ title, headerItems, bodyItems, selectItem }) {
  return (
    <div className="select-list-view">
      {title && (
        <div className="select-list-view-title">
          <h2>{title}</h2>
        </div>
      )}
      <div className="select-list-view-content">
        <div className="select-list-view-header">
          {headerItems.map((name, index) => {
            return (
              <div key={index} className="select-list-view-header-item">
                <p>{name}</p>
              </div>
            );
          })}
        </div>
        <div className="select-list-view-body">
          {bodyItems.map((row, index) => {
            return (
              <div key={index} className="select-list-view-body-row">
                {row.rows.map((item, index) => {
                  return (
                    <div
                      key={index}
                      className={
                        row.selected
                          ? "select-list-view-body-item selected"
                          : "select-list-view-body-item"
                      }
                      onClick={() => selectItem(row)}
                    >
                      <p>{item}</p>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default SelectListView;
