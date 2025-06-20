import PropTypes from 'prop-types';
import React from 'react';

const FormMessages = ({ submitSuccess, submitError, children }) => (
  <>
    {children}
    {submitSuccess && (
      <div className="success-message">
        <p>Patient registration successful!</p>
      </div>
    )}
    {submitError && (
      <div className="error-message">
        <p>{submitError}</p>
      </div>
    )}
  </>
);

FormMessages.propTypes = {
  submitSuccess: PropTypes.bool,
  submitError: PropTypes.string,
  children: PropTypes.node,
};

export default FormMessages;
