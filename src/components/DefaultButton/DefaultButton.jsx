import React from 'react';
import PropTypes from 'prop-types';

function DefaultButton({ onClick, innerText, maxWidth }) {
  return (
    <button
      type="button"
      style={{ maxWidth }}
      className="default-button"
      onClick={() => onClick()}
    >
      {innerText}
    </button>
  );
}

DefaultButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  innerText: PropTypes.string.isRequired,
  maxWidth: PropTypes.string,
};

DefaultButton.defaultProps = {
  maxWidth: '',
};

export default DefaultButton;
