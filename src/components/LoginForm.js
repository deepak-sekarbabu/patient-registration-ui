import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import patientService from '../services/api';
import { debugLog } from '../utils/debugUtils';
import './LoginForm.css';

const LoginForm = ({ onLogin }) => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [loading, setLoading] = useState(false);
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
    setLoading(true);

    debugLog('LOGIN_FORM', 'Attempting login with phone number', { phone });

    try {
      // First, check if a direct API call works
      try {
        // Store current timestamp for tracking request duration
        const startTime = Date.now();

        // Call the context login handler (which uses authService.login)
        const result = await onLogin(phone, password);

        debugLog('LOGIN_FORM', `Login completed in ${Date.now() - startTime}ms`, {
          success: true,
          hasPatient: !!result?.patient,
        });

        if (!result || !result.patient) {
          debugLog('LOGIN_FORM', 'Login response missing patient data');
          throw new Error('Login response missing patient data');
        }

        // Wait a moment to ensure state is updated before navigation
        debugLog('LOGIN_FORM', 'Login successful, preparing to navigate');

        // Add patient ID to URL for proper routing on reload
        localStorage.setItem('last_login_success', Date.now().toString()); // Navigate to login success page with replace to prevent back navigation to login
        debugLog('LOGIN_FORM', 'Navigating to login success page');
        navigate('/login-success', { replace: true, state: { patientData: result.patient } });
      } catch (loginErr) {
        debugLog('LOGIN_FORM', 'Login error in context handler', { error: loginErr });
        throw loginErr;
      }
    } catch (err) {
      debugLog('LOGIN_FORM', 'Login failed', { error: err.message });
      setError(err.message || 'Invalid phone number or password');
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
            maxLength={50} // Restrict password to a maximum of 50 characters
          />
        </div>{' '}
        {error && (
          <div className="login-error">
            <i className="fas fa-exclamation-circle"></i>
            {error}
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
