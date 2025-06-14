import React, { useState, useCallback, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import Modal from 'react-modal';
import { FaTimes } from 'react-icons/fa';
import '../../styles/components/ChangePasswordModal.css';

// Accessibility: Set app element for screen readers
if (typeof window !== 'undefined') {
  Modal.setAppElement('#root');
}

const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecialChar: true,
};

const ChangePasswordModal = React.memo(({ isOpen, onClose, onChangePassword }) => {
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const modalRef = useRef(null);
  const firstInputRef = useRef(null);

  // Focus management for accessibility
  useEffect(() => {
    if (isOpen && firstInputRef.current) {
      setTimeout(() => firstInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Reset form state
  const resetForm = useCallback(() => {
    setFormData({ newPassword: '', confirmPassword: '' });
    setError('');
    setSuccess('');
  }, []);

  // Handle modal close
  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [onClose, resetForm]);

  // Handle keyboard events for better accessibility
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    },
    [handleClose]
  );

  // Validate password against requirements
  const validatePassword = useCallback((password) => {
    const { minLength, requireUppercase, requireLowercase, requireNumber, requireSpecialChar } =
      PASSWORD_REQUIREMENTS;
    const hasMinLength = password.length >= minLength;
    const hasUppercase = !requireUppercase || /[A-Z]/.test(password);
    const hasLowercase = !requireLowercase || /[a-z]/.test(password);
    const hasNumber = !requireNumber || /\d/.test(password);
    const hasSpecialChar = !requireSpecialChar || /[^A-Za-z0-9]/.test(password);

    return hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecialChar;
  }, []);

  // Handle form input changes
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const { newPassword, confirmPassword } = formData;

    if (!validatePassword(newPassword)) {
      setError(
        'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character'
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setIsLoading(true);
      await onChangePassword(newPassword);
      setSuccess('Password updated successfully!');
      setTimeout(handleClose, 1500);
    } catch (err) {
      setError(err.message || 'Failed to update password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Password requirements description for screen readers
  const passwordRequirements =
    `Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters long and include: 
    ${PASSWORD_REQUIREMENTS.requireUppercase ? 'uppercase letter, ' : ''}
    ${PASSWORD_REQUIREMENTS.requireLowercase ? 'lowercase letter, ' : ''}
    ${PASSWORD_REQUIREMENTS.requireNumber ? 'number, ' : ''}
    ${PASSWORD_REQUIREMENTS.requireSpecialChar ? 'special character' : ''}`.replace(/, $/, '');

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={handleClose}
      onKeyDown={handleKeyDown}
      className="modal-content"
      overlayClassName="modal-overlay"
      contentLabel="Change Password"
      role="dialog"
      aria-modal="true"
      ref={modalRef}
    >
      <div className="modal-container">
        <div className="modal-header" role="heading" aria-level="1">
          <h2 id="modal-title">Change Password</h2>
          <button
            type="button"
            onClick={handleClose}
            className="close-button"
            aria-label="Close dialog"
          >
            <FaTimes aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="password-form" noValidate>
          <div className="form-group">
            <label htmlFor="newPassword" className="form-label">
              New Password
            </label>
            <input
              id="newPassword"
              name="newPassword"
              type="password"
              value={formData.newPassword}
              onChange={handleInputChange}
              required
              aria-required="true"
              aria-describedby="password-requirements"
              className="form-input"
              placeholder="Enter new password"
              maxLength="13"
              ref={firstInputRef}
              disabled={isLoading}
            />
            <p id="password-requirements" className="password-requirements">
              {passwordRequirements}
            </p>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
              aria-required="true"
              className="form-input"
              placeholder="Confirm new password"
              maxLength="13"
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="error-message" role="alert" aria-live="assertive">
              {error}
            </div>
          )}

          {success && (
            <div className="success-message" role="alert" aria-live="polite">
              {success}
            </div>
          )}

          <div className="modal-actions">
            <button
              type="button"
              onClick={handleClose}
              className="button button--secondary"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button type="submit" className="button button--primary" disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
});

ChangePasswordModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onChangePassword: PropTypes.func.isRequired,
};

export default ChangePasswordModal;
