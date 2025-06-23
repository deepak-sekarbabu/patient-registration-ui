import React, { useEffect } from 'react';
import '../../styles/components/PatientRegistrationForm.css';

const Toast = ({ type = 'success', message, onClose, duration = 4000 }) => {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose && onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  return (
    <div
      className={`toast-message ${type === 'success' ? 'success-toast' : 'error-toast'}`}
      role="alert"
      aria-live="polite"
    >
      {message}
      {onClose && (
        <button
          onClick={onClose}
          aria-label="Close notification"
          style={{
            marginLeft: 16,
            background: 'none',
            border: 'none',
            color: 'inherit',
            fontWeight: 'bold',
            cursor: 'pointer',
            fontSize: 18,
          }}
        >
          ×
        </button>
      )}
    </div>
  );
};

export default Toast;
