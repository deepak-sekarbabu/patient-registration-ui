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

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="modal-content modern-password-modal"
      overlayClassName="modal-backdrop"
      ariaHideApp={false}
      style={{
        overlay: {
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        },
        content: {
          position: 'relative',
          top: 'auto',
          left: 'auto',
          right: 'auto',
          bottom: 'auto',
          margin: '0 auto',
          maxWidth: '500px',
          width: '90%',
          padding: '20px',
          border: '1px solid #ccc',
          borderRadius: '8px',
          background: '#fff'
        }
      }}
    >
      <form onSubmit={handleSubmit} className="change-password-form">
        <div className="modal-header">
          <h2>Change Password</h2>
          <button onClick={onClose} className="close-btn" type="button"><FaTimes /></button>
        </div>
        <div className="form-group">
          <label>New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            placeholder="••••••••"
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
            placeholder="••••••••"
          />
        </div>
        {error && <div className="error-msg">{error}</div>}
        {success && <div className="success-msg">{success}</div>}
        <div className="modal-actions">
          <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Updating...' : 'Change Password'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ChangePasswordModal;
