import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiLock, FiEye, FiEyeOff, FiCheck, FiShield } from 'react-icons/fi';
import { changePassword } from '../../services/api';
import { useToast } from '../../context/ToastContext.jsx';
import './ChangePassword.css';

function ChangePassword() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [status, setStatus] = useState({ type: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  // Live Password Criteria Checks
  const hasMinLength = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });

    if (!currentPassword) {
      const msg = 'Please enter your current password.';
      setStatus({ type: 'error', message: msg });
      showToast('error', msg);
      return;
    }

    if (!newPassword || !confirmPassword) {
      const msg = 'Please fill in both new password fields.';
      setStatus({ type: 'error', message: msg });
      showToast('error', msg);
      return;
    }

    if (newPassword !== confirmPassword) {
      const msg = 'New password and confirmation do not match.';
      setStatus({ type: 'error', message: msg });
      showToast('error', msg);
      return;
    }

    if (!hasMinLength || !hasUppercase || !hasNumber || !hasSpecial) {
      const msg = 'New password does not satisfy all security requirements.';
      setStatus({ type: 'error', message: msg });
      showToast('error', msg);
      return;
    }

    setSubmitting(true);
    try {
      const res = await changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });
      const successMsg = res?.message || 'Password changed successfully.';
      setStatus({
        type: 'success',
        message: successMsg,
      });
      showToast('success', successMsg);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      const errorMsg = err.message || 'Failed to update password. Please check your current password.';
      setStatus({
        type: 'error',
        message: errorMsg,
      });
      showToast('error', errorMsg);
    } finally {
      setSubmitting(false);
    }
  };


  const handleCancel = () => {
    navigate('/settings');
  };

  return (
    <div className="change-password-page">
      <div className="page-header">
        <div className="page-title-box">
          <h1 className="page-title">Change Password</h1>
          <p className="page-subtitle">
            Update your credentials and maintain strict account security.
          </p>
        </div>
      </div>

      <div className="password-card-container">
        <div className="password-card-inner">
          <div className="security-icon-badge">
            <FiShield />
          </div>

          <h2 className="password-card-title">Update Account Password</h2>
          <p className="password-description">
            Choose a strong password that you do not use for any other service.
          </p>



          <form onSubmit={handleSubmit}>
            <div className="password-group">
              <label>Current Password</label>
              <div className="password-input-box">
                <input
                  type={showCurrent ? 'text' : 'password'}
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="password-eye-toggle"
                  onClick={() => setShowCurrent(!showCurrent)}
                  aria-label="Toggle current password view"
                >
                  {showCurrent ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            <div className="password-group">
              <label>New Password</label>
              <div className="password-input-box">
                <input
                  type={showNew ? 'text' : 'password'}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="password-eye-toggle"
                  onClick={() => setShowNew(!showNew)}
                  aria-label="Toggle new password view"
                >
                  {showNew ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            <div className="password-group">
              <label>Confirm New Password</label>
              <div className="password-input-box">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="password-eye-toggle"
                  onClick={() => setShowConfirm(!showConfirm)}
                  aria-label="Toggle confirm password view"
                >
                  {showConfirm ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            <div className="password-rules-box">
              <span className="password-rules-title">Security Requirements:</span>

              <div className={`password-rule-item ${hasMinLength ? 'valid' : ''}`}>
                <span className="rule-check-icon">{hasMinLength ? <FiCheck /> : '•'}</span>
                <span>At least 8 characters long</span>
              </div>

              <div className={`password-rule-item ${hasUppercase ? 'valid' : ''}`}>
                <span className="rule-check-icon">{hasUppercase ? <FiCheck /> : '•'}</span>
                <span>Includes at least one uppercase letter (A-Z)</span>
              </div>

              <div className={`password-rule-item ${hasNumber ? 'valid' : ''}`}>
                <span className="rule-check-icon">{hasNumber ? <FiCheck /> : '•'}</span>
                <span>Includes at least one numeric digit (0-9)</span>
              </div>

              <div className={`password-rule-item ${hasSpecial ? 'valid' : ''}`}>
                <span className="rule-check-icon">{hasSpecial ? <FiCheck /> : '•'}</span>
                <span>Includes at least one special character (!@#$%^&*)</span>
              </div>
            </div>

            <div className="password-actions">
              <button type="button" className="btn-secondary" onClick={handleCancel}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? 'Updating Password...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ChangePassword;