import { AlertCircle } from 'lucide-react';
import React from 'react';

const AppointmentError = ({ error, setError }) => (
  <div className="alert alert-danger alert-dismissible fade show" role="alert">
    <div className="d-flex align-items-center">
      <AlertCircle size={24} className="me-2" />
      <div className="flex-grow-1">{error}</div>
      <button
        type="button"
        className="btn-close"
        onClick={() => setError(null)}
        aria-label="Close"
      ></button>
    </div>
    {error && error.includes('session has expired') && (
      <div className="mt-2">
        <small>Redirecting to login page...</small>
      </div>
    )}
  </div>
);

export default AppointmentError;
