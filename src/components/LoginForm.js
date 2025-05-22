import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./LoginForm.css";

const LoginForm = ({ onLogin }) => {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [phoneError, setPhoneError] = useState("");
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
      setPhoneError("Phone number must contain only digits");
      return false;
    } else if (phoneNumber.length > 10) {
      setPhoneError("Phone number must not exceed 10 digits");
      return false;
    } else {
      setPhoneError("");
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

    setError("");
    setLoading(true);
    try {
      // Call backend login API
      const response = await fetch(
        "http://localhost:8080/v1/api/patients/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            accept: "*/*",
          },
          body: JSON.stringify({
            phoneNumber: phone,
            password: password,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Invalid phone number or password");
      }

      // Parse the response data
      const data = await response.json();

      // Store patient data and token if available from the API response
      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      if (data) {
        // Store the entire response which contains patient information
        localStorage.setItem("patient", JSON.stringify(data));
      }

      try {
        // Call the parent onLogin handler to update app state
        await onLogin(phone, password);

        // Navigate to patient info/home page
        navigate("/info");
      } catch (loginErr) {
        console.error("Error in parent login handler:", loginErr);
        setError("Login failed. Please try again.");
      }
    } catch (err) {
      setError("Invalid phone number or password");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = () => {
    navigate("/register");
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
            className={`form-control ${phoneError ? "is-invalid" : ""}`}
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
        </div>{" "}
        {error && (
          <div className="login-error">
            <i className="fas fa-exclamation-circle"></i>
            {error}
          </div>
        )}
        <button
          type="submit"
          className="btn btn-primary w-100 login-button"
          disabled={loading}
        >
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
