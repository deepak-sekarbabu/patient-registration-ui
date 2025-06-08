import React from 'react';
import '../../styles/components/LoadingSpinner.css';

const LoadingSpinner = ({ text = 'Loading...', size = 'medium' }) => {
  const spinnerClass = `spinner ${size === 'small' ? 'spinner-small' : ''}`;
  const containerClass = `spinner-container ${size === 'small' ? 'spinner-container-small' : ''}`;

  return (
    <div className={containerClass}>
      <div className={spinnerClass}></div>
      {text && <p className="loading-text">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
