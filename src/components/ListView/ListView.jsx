import React from "react";
import PropTypes from "prop-types";

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
          {headerItems.map((name) => (
            <div key={name} className="list-view-header-item">
              <p>{name}</p>
            </div>
          ))}
        </div>
        <div className="list-view-body">
          {bodyItems.map((row) => (
            <div key={row.id} className="list-view-body-row">
              {row.map((item) => (
                <div key={item} className="list-view-body-item">
                  <p>{item}</p>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

ListView.propTypes = {
  title: PropTypes.string.isRequired,
  headerItems: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  bodyItems: PropTypes.arrayOf(
    PropTypes.shape({
      rows: PropTypes.arrayOf(PropTypes.string).isRequired,
      id: PropTypes.number.isRequired,
    })
  ).isRequired,
};

export default ListView;
