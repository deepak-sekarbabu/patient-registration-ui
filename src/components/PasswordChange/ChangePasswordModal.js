import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import Modal from 'react-modal';
import '../../styles/components/ChangePasswordModal.css';
import { useToast } from '../shared/ToastProvider';

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

function PasswordModalHeader({ onClose }) {
  return (
    <div className="form-header modal-header" role="heading" aria-level="1">
      <h2 id="modal-title">Change Password</h2>
      <button type="button" onClick={onClose} className="close-button" aria-label="Close dialog">
        <FaTimes aria-hidden="true" />
      </button>
    </div>
  );
}

function PasswordForm({
  formData,
  isLoading,
  error,
  success,
  onInputChange,
  onSubmit,
  onClose,
  passwordRequirements,
  firstInputRef,
}) {
  return (
    <form onSubmit={onSubmit} className="form-section password-form" noValidate>
      <div className="form-group">
        <label htmlFor="newPassword" className="form-label required-field">
          New Password
        </label>
        <input
          id="newPassword"
          name="newPassword"
          type="password"
          value={formData.newPassword}
          onChange={onInputChange}
          required
          aria-required="true"
          aria-describedby="password-requirements"
          className="form-control"
          placeholder="Enter new password"
          maxLength="13"
          ref={firstInputRef}
          disabled={isLoading}
        />
        <small id="password-requirements" className="form-text text-muted">
          {passwordRequirements}
        </small>
      </div>
      <div className="form-group">
        <label htmlFor="confirmPassword" className="form-label required-field">
          Confirm Password
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={onInputChange}
          required
          aria-required="true"
          className="form-control"
          placeholder="Confirm new password"
          maxLength="13"
          disabled={isLoading}
        />
      </div>
      <div className="form-navigation modal-actions">
        <button type="button" onClick={onClose} className="btn btn-secondary" disabled={isLoading}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={isLoading}>
          {isLoading ? 'Updating...' : 'Change Password'}
        </button>
      </div>
    </form>
  );
}

function ChangePasswordModal({ isOpen, onClose, onChangePassword }) {
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const firstInputRef = useRef(null);
  const { showToast } = useToast();

  useEffect(() => {
    if (isOpen && firstInputRef.current) {
      setTimeout(() => firstInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const resetForm = useCallback(() => {
    setFormData({ newPassword: '', confirmPassword: '' });
    setError('');
    setSuccess('');
  }, []);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [onClose, resetForm]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    },
    [handleClose]
  );

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

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const { newPassword, confirmPassword } = formData;
    if (!validatePassword(newPassword)) {
      const msg =
        'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character';
      setError(msg);
      showToast('error', msg);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      showToast('error', 'Passwords do not match');
      return;
    }
    try {
      setIsLoading(true);
      await onChangePassword(newPassword);
      setSuccess('Password updated successfully!');
      showToast('success', 'Password updated successfully!');
      setTimeout(handleClose, 1500);
    } catch (err) {
      setError(err.message || 'Failed to update password. Please try again.');
      showToast('error', err.message || 'Failed to update password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const passwordRequirements =
    `Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters long and include: ` +
    `${PASSWORD_REQUIREMENTS.requireUppercase ? 'uppercase letter, ' : ''}` +
    `${PASSWORD_REQUIREMENTS.requireLowercase ? 'lowercase letter, ' : ''}` +
    `${PASSWORD_REQUIREMENTS.requireNumber ? 'number, ' : ''}` +
    `${PASSWORD_REQUIREMENTS.requireSpecialChar ? 'special character' : ''}`.replace(/, $/, '');

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
    >
      <div className="patient-registration-container modal-container">
        <PasswordModalHeader onClose={handleClose} />
        <PasswordForm
          formData={formData}
          isLoading={isLoading}
          error={error}
          success={success}
          onInputChange={handleInputChange}
          onSubmit={handleSubmit}
          onClose={handleClose}
          passwordRequirements={passwordRequirements}
          firstInputRef={firstInputRef}
        />
      </div>
    </Modal>
  );
}

export default ChangePasswordModal;
