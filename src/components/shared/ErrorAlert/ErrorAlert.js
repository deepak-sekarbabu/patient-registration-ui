import React from 'react';
import './ErrorAlert.css';

/**
 * Reusable error alert component to display various types of error messages
 *
 * @param {Object} props Component props
 * @param {string} props.type Error type: 'auth' (authentication), 'validation', 'server', or 'general'
 * @param {string} props.title Error title/heading
 * @param {string} props.message Error message details
 * @param {string} props.suggestion Optional suggestion for resolving the error
 * @param {Function} props.onClose Function to call when closing the alert
 * @returns {JSX.Element} Error alert component
 */
const ErrorAlert = ({ type = 'general', title, message, suggestion, onClose }) => {
  // Log the error details to help with debugging
  React.useEffect(() => {
    console.log(`ErrorAlert rendered - type: ${type}, message: ${message}`);
  }, [type, message]);

  // Default values based on error type
  const getDefaultProps = () => {
    switch (type) {
      case 'auth':
        return {
          icon: 'fa-lock',
          defaultTitle: 'Authentication Failed',
          className: 'error-alert-auth',
        };
      case 'validation':
        return {
          icon: 'fa-exclamation-triangle',
          defaultTitle: 'Invalid Input',
          className: 'error-alert-validation',
        };
      case 'server':
        return {
          icon: 'fa-server',
          defaultTitle: 'Server Error',
          className: 'error-alert-server',
        };
      default:
        return {
          icon: 'fa-exclamation-circle',
          defaultTitle: 'Error',
          className: 'error-alert-general',
        };
    }
  };

  const { icon, defaultTitle, className } = getDefaultProps();

  return (
    <div className={`error-alert ${className}`}>
      <div className="error-alert-content">
        <div className="error-alert-icon">
          <i className={`fas ${icon}`}></i>
        </div>
        <div className="error-alert-text">
          <h4>{title || defaultTitle}</h4>
          <p>{message}</p>
          {suggestion && <p className="error-alert-suggestion">{suggestion}</p>}
        </div>
      </div>
      {onClose && (
        <button type="button" className="error-alert-close" onClick={onClose} aria-label="Close">
          <i className="fas fa-times"></i>
        </button>
      )}
    </div>
  );
};

export default ErrorAlert;
