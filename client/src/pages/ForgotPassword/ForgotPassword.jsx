
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './ForgotPassword.css';
import logo from '../../assets/infinetra-logo.png';

import {
  sendOtp,
  verifyOtp,
  resetPassword
} from '../../services/api';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState('email');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(() => {
      setMessage('');
      setStatus('');
    }, 3000);

    return () => clearTimeout(timer);
  }, [message]);

  const showPopup = (text, type) => {
    setMessage(text);
    setStatus(type);
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      showPopup('Please enter your registered email address.', 'error');
      return;
    }

    try {
      setLoading(true);

      const data = await sendOtp(email.trim());

      showPopup(data.message || 'OTP sent successfully.', 'success');
      setStep('verify');

    } catch (error) {
      console.error('Send OTP error:', error);
      showPopup(error.message || 'Failed to send OTP.', 'error');

    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    if (!otp.trim()) {
      showPopup('Please enter the OTP.', 'error');
      return;
    }

    try {
      setLoading(true);

      const data = await verifyOtp(
        email.trim(),
        otp.trim()
      );

      showPopup(data.message || 'OTP verified successfully.', 'success');
      setStep('reset');

    } catch (error) {
      console.error('Verify OTP error:', error);
      showPopup(error.message || 'OTP verification failed.', 'error');

    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      showPopup('Please enter and confirm your new password.', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      showPopup('Passwords do not match.', 'error');
      return;
    }

    try {
      setLoading(true);

      const data = await resetPassword({
        email: email.trim(),
        newPassword,
        confirmPassword
      });

      showPopup(data.message || 'Password reset successful.', 'success');
      setStep('success');

    } catch (error) {
      console.error('Reset password error:', error);
      showPopup(error.message || 'Password reset failed.', 'error');

    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="login-container">

      {message && (
        <div className={`top-popup ${status}`}>
          <div className="popup-icon">
            {status === 'success' ? '✓' : '×'}
          </div>

          <div className="popup-message">
            {message}
          </div>
        </div>
      )}

      <div className="login-left">
        <div className="brand-section">
          <img
            src={logo}
            alt="Infinetra Logo"
            className="logo-image"
          />

          <h1>Infinetra HRMS</h1>

          <p className="brand-description">
            Elevating enterprise productivity through intelligent employee
            management and seamless human resource workflows.
          </p>
        </div>

        <div className="feature-cards">

          <div className="feature-card">
            <svg
              className="feature-icon"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>

            <h4>Unified Dashboard</h4>
            <p>Real-time metrics at your fingertips.</p>
          </div>

          <div className="feature-card">
            <svg
              className="feature-icon"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2L20 6V12C20 17 16.5 20 12 22C7.5 20 4 17 4 12V6L12 2Z" />
              <path d="M8.5 12L11 14.5L15.5 10" />
            </svg>

            <h4>Secure Access</h4>
            <p>Enterprise-grade data protection.</p>
          </div>

        </div>
      </div>

      <div className="login-right">
        <div className="login-form-box">

      

          {step === 'email' && (
            <>
              <h2>Forgot Password?</h2>

              <p className="subtitle">
                Enter your email, we'll send you an OTP to reset your password.
              </p>

              <form onSubmit={handleSendOTP}>
                <div className="form-group">
                  <label>Email Address</label>

                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Sending...' : 'Send OTP'}
                </button>
              </form>
            </>
          )}

          {step === 'verify' && (
            <>
              <h2>Verify OTP</h2>

              <p className="subtitle">
                Enter the OTP sent to your registered email address.
              </p>

              <form onSubmit={handleVerifyOTP}>
                <div className="form-group">
                  <label>Enter OTP</label>

                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter 6-digit OTP"
                    maxLength="6"
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </button>
              </form>
            </>
          )}

          {step === 'reset' && (
            <>
              <h2>Reset Password</h2>

              <p className="subtitle">
                Create a new password for your account.
              </p>

              <form onSubmit={handleResetPassword}>

                <div className="form-group">
                  <label>New Password</label>

                  <div className="password-wrapper">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                    />

                    <button
                      type="button"
                      className="eye-button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      aria-label={
                        showNewPassword
                          ? 'Hide password'
                          : 'Show password'
                      }
                    >
                      {showNewPassword ? '◉' : '◉'}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label>Confirm Password</label>

                  <div className="password-wrapper">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                    />

                    <button
                      type="button"
                      className="eye-button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      aria-label={
                        showConfirmPassword
                          ? 'Hide password'
                          : 'Show password'
                      }
                    >
                      {showConfirmPassword ? '◉' : '◉'}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>

              </form>
            </>
          )}

          {step === 'success' && (
            <>
              <div className="success-screen">
                <div className="success-big-icon">✓</div>

                <h2>Password Reset Successful</h2>

                <p className="subtitle">
                  Your password has been updated successfully.
                </p>

                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => navigate('/login')}
                >
                  Back to Login
                </button>
              </div>
            </>
          )}

          <div className="page-footer">
            <Link to="/login" className="link">
              Back to Login
            </Link>
          </div>

          <p className="powered-by">
            POWERED BY INFINETRA TECH
          </p>

        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
