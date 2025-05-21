import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginForm.css";

const LoginForm = ({ onLogin }) => {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await onLogin(phone, password);
      // Navigate to patient info page after successful login
      navigate("/info");
    } catch (err) {
      setError("Invalid phone number or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-header">
        <img src="/logo192.png" alt="Logo" className="login-logo" />
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
            className="form-control"
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            placeholder="Enter your phone number"
            autoFocus
          />
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
          />
        </div>
        {error && <div className="alert alert-danger login-error">{error}</div>}
        <button
          type="submit"
          className="btn btn-primary w-100 login-button"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
      <div className="login-demo-credentials">
        <small>Demo: 1234567890/ password</small>
      </div>
    </div>
  );
};

export default LoginForm;
