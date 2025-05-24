import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import patientService from '../../services/api';
import { debugLog } from '../../utils/debugUtils';
import ErrorAlert from '../shared/ErrorAlert';
import './LoginForm.css';

const LoginForm = ({ onLogin }) => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [loading, setLoading] = useState(false);
  const [unauthorizedError, setUnauthorizedError] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

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

    try {
      try {
        const startTime = Date.now();

        // Log authentication attempt
        debugLog('LOGIN_FORM', 'Starting authentication...', { phoneLength: phone.length });

        const result = await onLogin(phone, password);

        debugLog('LOGIN_FORM', `Login completed in ${Date.now() - startTime}ms`, {
          success: true,
          hasPatient: !!result?.patient,
        });

        if (!result || !result.patient) {
          debugLog('LOGIN_FORM', 'Login response missing patient data');
          throw new Error('Login response missing patient data');
        }

        debugLog('LOGIN_FORM', 'Login successful, navigating to info');

        // Clear any previous errors
        setUnauthorizedError(false);
        setError('');

        localStorage.setItem('last_login_success', Date.now().toString());
        // Directly navigate to /info after successful login
        navigate('/info', { replace: true });
      } catch (loginErr) {
        const errorMessage = loginErr.message || '';

        // Enhanced error detection
        const isAuthError =
          errorMessage.includes('401') ||
          errorMessage.toLowerCase().includes('unauthorized') ||
          errorMessage.toLowerCase().includes('invalid phone number or password') ||
          errorMessage.toLowerCase().includes('invalid credentials') ||
          (loginErr.response && loginErr.response.status === 401);

        // Enhanced logging for better debugging
        debugLog('LOGIN_FORM', 'Login error in context handler', {
          error: errorMessage,
          isUnauthorizedError: isAuthError,
          hasResponse: !!loginErr.response,
          responseStatus: loginErr.response?.status,
          responseData: loginErr.response?.data
            ? JSON.stringify(loginErr.response.data)
            : 'No data',
        });

        // Check for authentication failures (401, Unauthorized, or invalid credentials)
        if (isAuthError) {
          debugLog('LOGIN_FORM', 'Setting unauthorized error flag to true');
          setUnauthorizedError(true);
          setError('Invalid phone number or password'); // Set a readable error message
          window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to the top to make sure alert is visible
        } else {
          // For other types of errors
          setError(errorMessage || 'An error occurred during login');
          setUnauthorizedError(false);
        }
        throw loginErr;
      }
    } catch (err) {
      debugLog('LOGIN_FORM', 'Login failed', {
        error: err.message,
        unauthorizedErrorFlag: unauthorizedError,
      });

      // Handle different types of errors
      if (
        err.message &&
        (err.message.toLowerCase().includes('network') ||
          err.message.toLowerCase().includes('connection'))
      ) {
        setError('Network error. Please check your internet connection and try again.');
        setUnauthorizedError(false);
      } else if (err.message && err.message.toLowerCase().includes('server')) {
        setError('Server error. Please try again later or contact support if the issue persists.');
        setUnauthorizedError(false);
      } else if (
        err.message &&
        (err.message.toLowerCase().includes('unauthorized') ||
          err.message.toLowerCase().includes('invalid phone') ||
          err.message.toLowerCase().includes('invalid password') ||
          err.message.toLowerCase().includes('401'))
      ) {
        // Make sure unauthorized errors are properly flagged
        debugLog('LOGIN_FORM', 'Caught unauthorized error in outer catch block');
        setUnauthorizedError(true);
        setError('Invalid phone number or password');
        // Force scroll to top and ensure error is visible
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (!unauthorizedError) {
        // Only set this error if we haven't already set an unauthorized error
        setError(err.message || 'An error occurred during login');
      }
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
        <img src="/logo512.png" alt="App Logo" className="login-logo" />
        <h2>Patient Login</h2>
        <p className="text-muted">Access your health information</p>
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

      <form className="login-form" onSubmit={handleSubmit} autoComplete="on">
        <div className="mb-3">
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
          />
          {phoneError && <div className="invalid-feedback">{phoneError}</div>}
        </div>
        <div className="mb-3">
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
          />
        </div>{' '}
        {/* Display general errors within the form */}
        {error && !unauthorizedError && (
          <div className="mb-3">
            <ErrorAlert type="general" message={error} onClose={() => setError('')} />
          </div>
        )}
        <button type="submit" className="btn btn-primary w-100 login-button" disabled={loading}>
          {loading ? (
            <span>
              <i className="fas fa-spinner fa-spin mr-2"></i> Logging in...
            </span>
          ) : (
            <span>
              <i className="fas fa-sign-in-alt mr-2"></i> Login
            </span>
          )}
        </button>
      </form>

      <div className="mt-4 text-center">
        <p className="divider-text">
          <span>OR</span>
        </p>
      </div>

      <div className="register-button-container">
        <button
          type="button"
          className="btn btn-outline-primary w-100 register-button"
          onClick={handleRegister}
        >
          <i className="fas fa-user-plus mr-2"></i> Register here
        </button>
      </div>
    </div>
  );
};

export default LoginForm;
