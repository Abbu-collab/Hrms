import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { verifyOtpForEmail } from '../../api';
import logo from '../../assets/infinetra-logo.png';
import '../ForgotPassword/ForgotPassword.css';

function VerifyOTP() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || '';
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    setMessage('');
    if (!email) {
      setMessage('Missing email address. Please request an OTP from Forgot Password.');
      return;
    }
    if (!otp.trim()) {
      setMessage('Please enter the 6-digit OTP code.');
      return;
    }

    try {
      setLoading(true);
      await verifyOtpForEmail(email, otp.trim());
      navigate('/reset-password', { state: { email, otp: otp.trim() } });
    } catch (err) {
      setMessage(err.message || 'OTP verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <div className="brand-section">
          <img
            src={logo}
            alt="Infinetra Logo"
            className="logo-image"
          />
          <h1>Infinetra HRMS</h1>
          <p className="brand-description">
            Elevating enterprise productivity through intelligent employee management and seamless human resource workflows.
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
          <div className="mobile-logo-header">
            <img src={logo} alt="Infinetra Logo" className="mobile-logo" />
          </div>

          <h2>Verify OTP Code</h2>
          <p className="subtitle">
            Enter the 6-digit OTP verification code sent to your email.
          </p>
          {email && (
            <p style={{ fontSize: '0.85rem', color: 'var(--primary-600)', fontWeight: 600, marginBottom: '20px' }}>
              Target Email: {email}
            </p>
          )}

          {message && (
            <div className="status-message error" style={{ marginBottom: '20px' }}>
              {message}
            </div>
          )}

          <form onSubmit={handleVerify}>
            <div className="form-group">
              <label>Verification OTP Code</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 6-digit code"
                maxLength="6"
                style={{ textAlign: 'center', letterSpacing: '4px', fontSize: '1.2rem', fontWeight: '700' }}
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Verifying Code...' : 'Verify OTP & Continue'}
            </button>
          </form>

          <div className="page-footer" style={{ marginTop: '24px' }}>
            <Link to="/forgot-password" className="link">
              ← Back to Forgot Password
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

export default VerifyOTP;