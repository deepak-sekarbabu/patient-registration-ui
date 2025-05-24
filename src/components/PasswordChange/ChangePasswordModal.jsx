import React, { useState } from 'react';
import Modal from 'react-modal';
import { FaTimes } from 'react-icons/fa';
import './ChangePasswordModal.css'; // Import CSS file for styling

const ChangePasswordModal = ({ isOpen, onClose, onChangePassword }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const validatePassword = (password) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/.test(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!validatePassword(newPassword)) {
      setError('Use at least 8 characters, upper, lower, number & special char.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    try {
      setLoading(true);
      await onChangePassword(newPassword);
      setSuccess('Password updated.');
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch {
      setError('Update failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setSuccess('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={handleClose}
      className="modal-content modern-password-modal"
      overlayClassName="modal-backdrop"
      ariaHideApp={false}
      style={{
        overlay: {
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        },
        content: {
          position: 'static',
          top: 'auto',
          left: 'auto',
          right: 'auto',
          bottom: 'auto',
          transform: 'none',
          maxWidth: '400px',
          width: '90%',
          padding: '0',
          border: 'none',
          borderRadius: '8px',
          background: 'transparent',
          maxHeight: 'none',
          overflow: 'visible',
          margin: '0',
        },
      }}
    >
      <div className="modal-content">
        <form onSubmit={handleSubmit} className="change-password-form">
          <div className="modal-header">
            <h2>Change Password</h2>
            <button onClick={handleClose} className="close-btn" type="button">
              <FaTimes />
            </button>
          </div>
          <div className="form-group">
            <label>New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              placeholder="Enter new password"
              autoFocus
            />
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Confirm new password"
            />
          </div>
          {error && <div className="error-msg">{error}</div>}
          {success && <div className="success-msg">{success}</div>}
          <div className="modal-actions">
            <button type="button" onClick={handleClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Updating...' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default ChangePasswordModal;
