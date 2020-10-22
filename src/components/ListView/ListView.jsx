import React from "react";

function ListView({ title, headerItems, bodyItems }) {
  return (
    <div className="list-view">
      {title && (
        <div className="list-view-title">
          <h2>{title}</h2>
        </div>
      )}

      <div className="list-view-content">
        <div className="list-view-header">
          {headerItems.map((name, index) => {
            return (
              <div key={index} className="list-view-header-item">
                <p>{name}</p>
              </div>
            );
          })}
        </div>
        <div className="list-view-body">
          {bodyItems.map((row, index) => {
            return (
              <div key={index} className="list-view-body-row">
                {row.map((item, index) => {
                  return (
                    <div key={index} className="list-view-body-item">
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

export default ListView;
