import React from "react";
import PropTypes from "prop-types";

function SelectListView({ title, headerItems, bodyItems, selectItem }) {
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

SelectListView.propTypes = {
  title: PropTypes.string,
  headerItems: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  bodyItems: PropTypes.arrayOf(
    PropTypes.shape({
      rows: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
            .isRequired,
          value: PropTypes.string,
        })
      ).isRequired,
      id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
      selected: PropTypes.bool.isRequired,
    })
  ).isRequired,
  selectItem: PropTypes.func.isRequired,
};

SelectListView.defaultProps = {
  title: "",
};

export default SelectListView;
