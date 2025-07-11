import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/components/LoginForm.css';
import { debugLog } from '../../utils/debugUtils';
import ErrorAlert from '../shared/ErrorAlert';
import LoadingSpinner from '../shared/LoadingSpinner';
import { useToast } from '../shared/ToastProvider';

const LoginForm = ({ onLogin }) => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [loading, setLoading] = useState(false);
  const [unauthorizedError, setUnauthorizedError] = useState(false);
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const handleLogoClick = () => {
    if (isAuthenticated) {
      navigate('/info');
    }
  };

  // Autofill phone number if passed in navigation state
  useEffect(() => {
    if (location.state && location.state.phoneNumber) {
      setPhone(location.state.phoneNumber);
    }
  }, [location.state]);

  const validatePhone = (phoneNumber) => {
    if (!/^\d*$/.test(phoneNumber)) {
      setPhoneError('Phone number must contain only digits');
      return false;
    } else if (phoneNumber.length > 10) {
      setPhoneError('Phone number must not exceed 10 digits');
      return false;
    } else {
      setPhoneError('');
      return true;
    }
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    setPhone(value);
    validatePhone(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate phone number before submission
    if (!validatePhone(phone)) {
      return;
    }

    setError('');
    setUnauthorizedError(false);
    setLoading(true);

    debugLog('LOGIN_FORM', 'Attempting login with phone number', { phone });

    const startTime = Date.now();
    try {
      debugLog('LOGIN_FORM', 'Starting authentication...', { phoneLength: phone.length });
      const result = await onLogin(phone, password);

      debugLog('LOGIN_FORM', `Login completed in ${Date.now() - startTime}ms`, {
        success: true,
        hasPatient: !!result?.patient,
      });

      if (!result || !result.patient) {
        debugLog('LOGIN_FORM', 'Login response missing patient data from onLogin result');
        // This case should ideally be handled by onLogin itself throwing an error
        // or by the AuthContext error handling. If we reach here, it's unexpected.
        throw new Error('Login successful but no patient data received.');
      }

      debugLog('LOGIN_FORM', 'Login successful, navigating to info');
      setUnauthorizedError(false); // Clear previous auth error if any
      setError(''); // Clear previous general error if any
      localStorage.setItem('last_login_success', Date.now().toString());
      showToast('success', 'Login successful! Redirecting...');
      setTimeout(() => navigate('/info', { replace: true }), 1500);
    } catch (err) {
      const endTime = Date.now();
      debugLog('LOGIN_FORM', `Login attempt failed after ${endTime - startTime}ms`, {
        error: err,
        message: err.message,
        response: err.response,
      });

      setUnauthorizedError(false); // Reset general auth error state

      if (err.response) {
        // Server responded with a status code out of 2xx range
        const status = err.response.status;
        const responseData = err.response.data;

        debugLog('LOGIN_FORM', 'Login error from server response', {
          status,
          data: responseData,
        });

        if (status === 401 || status === 403) {
          setUnauthorizedError(true);
          // Use backend message if available and concise, otherwise generic
          const backendMessage = responseData?.message;
          setError(
            backendMessage && backendMessage.length < 100
              ? backendMessage
              : 'Invalid phone number or password.'
          );
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (status >= 500) {
          setError('Server error. Please try again later.');
        } else if (status === 400) {
          const backendMessage = responseData?.message;
          setError(
            backendMessage && backendMessage.length < 100
              ? backendMessage
              : 'Invalid request. Please check your input.'
          );
        } else {
          // Other server errors
          setError(err.message || `An error occurred (Status: ${status}).`);
        }
      } else if (
        err.message &&
        (err.message.toLowerCase().includes('network') ||
          err.message.toLowerCase().includes('failed to fetch'))
      ) {
        debugLog('LOGIN_FORM', 'Network error detected', { originalMessage: err.message });
        setError('Network error. Please check your internet connection.');
      } else {
        // Other errors (e.g., client-side issues before request, unexpected errors from onLogin)
        debugLog('LOGIN_FORM', 'Non-server/network error', { originalMessage: err.message });
        setError(err.message || 'An unexpected error occurred during login.');
      }
      showToast('error', err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = () => {
    navigate('/register');
  };

  return (
    <div className="login-container">
      <div className="login-header">
        <img
          src="/logo512.png"
          alt="App Logo"
          className={`login-logo ${isAuthenticated ? 'clickable' : ''}`}
          onClick={isAuthenticated ? handleLogoClick : undefined}
          style={{ cursor: isAuthenticated ? 'pointer' : 'default' }}
        />
        <h2>Patient Login</h2>
        <p>Access your health information</p>
      </div>

      {/* Display error messages prominently at the top */}
      {unauthorizedError && (
        <div className="auth-error-container" style={{ marginBottom: '20px' }}>
          <div style={{ background: '#ff00ff', color: '#fff', padding: '4px', fontWeight: 'bold' }}>
            DEBUG: Unauthorized Error Alert Should Be Visible Below
          </div>
          <ErrorAlert
            type="auth"
            title="Authentication Failed"
            message="Invalid phone number or password. Please check your credentials and try again."
            suggestion="If you've forgotten your password, please contact support for assistance."
            onClose={() => setUnauthorizedError(false)}
          />
        </div>
      )}
      {success && <ErrorAlert type="success" message={success} onClose={() => setSuccess('')} />}

      <form className="login-form" onSubmit={handleSubmit} autoComplete="on">
        <div className="form-group">
          <label htmlFor="phone" className="form-label">
            Phone Number
          </label>
          <input
            type="text"
            className={`form-control ${phoneError ? 'is-invalid' : ''}`}
            id="phone"
            value={phone}
            onChange={handlePhoneChange}
            required
            placeholder="Enter your phone number (10 digits)"
            autoFocus
            maxLength={10}
            autoComplete="tel"
          />
          {phoneError && <div className="invalid-feedback">{phoneError}</div>}
        </div>
        <div className="form-group">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <input
            type="password"
            className="form-control"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Enter your password"
            maxLength={50}
            autoComplete="current-password"
          />
        </div>
        {/* Display general errors within the form */}
        {error && !unauthorizedError && (
          <div className="mb-3">
            <ErrorAlert type="general" message={error} onClose={() => setError('')} />
          </div>
        )}
        {/* New button container */}
        <div className="form-actions-login">
          <button type="submit" className="btn btn-primary login-button" disabled={loading}>
            {loading ? (
              <LoadingSpinner text="" size="small" />
            ) : (
              <span className="button-content">
                <i className="fas fa-sign-in-alt"></i>
                <span>Login</span>
              </span>
            )}
          </button>
          <button
            type="button"
            className="btn btn-outline-primary register-button" // Removed w-100
            onClick={handleRegister}
          >
            <i className="fas fa-user-plus mr-2"></i> Register here
          </button>
        </div>
      </form>
      {/* The OR divider and old register button container are removed */}
    </div>
  );
};

export default LoginForm;
