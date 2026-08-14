import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser, googleLoginUser } from '../../services/api';
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { FiEye, FiEyeOff } from 'react-icons/fi';
import Passkey from '../Passkey/Passkey.jsx';
import logo from '../../assets/infinetra-logo.png';
import './Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [showPasskeyModal, setShowPasskeyModal] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();

  // Reference for Google's actual rendered button
  const googleButtonRef = useRef(null);

  /*
   * GOOGLE SIGN-IN
   */
  useEffect(() => {
    const scriptId = 'google-identity-script';

    const initializeGoogleSignIn = () => {
      if (
        !window.google ||
        !window.google.accounts ||
        !window.google.accounts.id
      ) {
        console.error('Google Identity Services is not available');
        return;
      }

      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

      console.log('Google Client ID:', clientId);
      console.log('Current Origin:', window.location.origin);

      if (!clientId) {
        console.error(
          'VITE_GOOGLE_CLIENT_ID is missing - check Vercel Environment Variables'
        );
        return;
      }

      /*
       * Initialize Google Identity Services
       */
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleResponse,
      });

      /*
       * Render Google's official Sign in with Google button
       */
      if (googleButtonRef.current) {
        // Clear any previously rendered button
        googleButtonRef.current.innerHTML = '';

        window.google.accounts.id.renderButton(
          googleButtonRef.current,
          {
            theme: 'outline',
            size: 'large',
            width: 300,
            text: 'signin_with',
            shape: 'rectangular',
          }
        );
      }
    };

    /*
     * If Google script is already loaded
     */
    const existingScript = document.getElementById(scriptId);

    if (existingScript) {
      if (
        window.google &&
        window.google.accounts &&
        window.google.accounts.id
      ) {
        initializeGoogleSignIn();
      } else {
        existingScript.addEventListener(
          'load',
          initializeGoogleSignIn,
          { once: true }
        );
      }

      return () => {
        existingScript.removeEventListener(
          'load',
          initializeGoogleSignIn
        );
      };
    }

    /*
     * Load Google Identity Services script
     */
    const script = document.createElement('script');

    script.id = scriptId;
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;

    script.onload = initializeGoogleSignIn;

    script.onerror = () => {
      console.error('Failed to load Google Identity Services');
      showToast(
        'error',
        'Unable to load Google Sign-In'
      );
    };

    document.body.appendChild(script);

    return () => {
      script.onload = null;
      script.onerror = null;
    };
  }, []);

  /*
   * GOOGLE RESPONSE
   */
  const handleGoogleResponse = async (response) => {
    try {
      if (!response || !response.credential) {
        showToast(
          'error',
          'Google authentication failed. Please try again.'
        );
        return;
      }

      setLoading(true);

      console.log('Google credential received successfully');

      /*
       * Send Google ID token to backend
       */
      const data = await googleLoginUser(response.credential);

      /*
       * Store authenticated user
       */
      login({
        user: data.user,
        token: data.token,
      });

      showToast(
        'success',
        'Google login successful'
      );

      /*
       * Navigate to dashboard
       */
      setTimeout(() => {
        navigate('/dashboard');
      }, 1200);

    } catch (error) {
      console.error('Google login error:', error);

      const errorMessage =
        error?.message?.toLowerCase() || '';

      if (
        errorMessage.includes('failed to fetch') ||
        errorMessage.includes('network error') ||
        errorMessage.includes('networkerror')
      ) {
        showToast(
          'error',
          'Unable to connect to server'
        );
      } else {
        showToast(
          'error',
          error?.message || 'Google login failed'
        );
      }

    } finally {
      setLoading(false);
    }
  };

  /*
   * PASSKEY
   */
  const openPasskeyModal = () => {
    setShowPasskeyModal(true);
  };

  const closePasskeyModal = () => {
    setShowPasskeyModal(false);
  };

  const handlePasskeySuccess = () => {
    sessionStorage.setItem(
      'passkeyVerified',
      'true'
    );

    setShowPasskeyModal(false);

    showToast(
      'success',
      'Passkey verified'
    );

    navigate('/register');
  };

  /*
   * NORMAL EMAIL/PASSWORD LOGIN
   */
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password) {
      showToast(
        'error',
        'Please enter email and password'
      );
      return;
    }

    try {
      setLoading(true);

      const data = await loginUser({
        email: email.trim(),
        password,
      });

      login({
        user: data.user,
        token: data.token,
      });

      showToast(
        'success',
        'Login successful'
      );

      setTimeout(() => {
        navigate('/dashboard');
      }, 1200);

    } catch (error) {
      console.error('Login error:', error);

      const errorMessage =
        error?.message?.toLowerCase() || '';

      if (
        errorMessage.includes('invalid email or password') ||
        errorMessage.includes('incorrect email or password')
      ) {
        showToast(
          'error',
          'Incorrect email or password'
        );

      } else if (
        errorMessage.includes('failed to fetch') ||
        errorMessage.includes('network error') ||
        errorMessage.includes('networkerror')
      ) {
        showToast(
          'error',
          'Unable to connect to server'
        );

      } else {
        showToast(
          'error',
          error?.message || 'Login failed'
        );
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">

      {/* LEFT SIDE */}
      <div className="login-left">

        <div className="brand-section">

          <img
            src={logo}
            alt="Infinetra Logo"
            className="logo-image"
          />

          <h1>Infinetra HRMS</h1>

          <p className="brand-description">
            Elevating productivity through intelligent employee
            management and seamless human resource workflows.
          </p>

          <div className="feature-cards">

            {/* FEATURE 1 */}
            <div className="feature-card">

              <span
                className="feature-icon"
                aria-hidden="true"
              >
                <svg
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  width="20"
                  height="20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect
                    x="2"
                    y="2"
                    width="6"
                    height="6"
                    rx="1"
                  />

                  <rect
                    x="12"
                    y="2"
                    width="6"
                    height="6"
                    rx="1"
                  />

                  <rect
                    x="2"
                    y="12"
                    width="6"
                    height="6"
                    rx="1"
                  />

                  <rect
                    x="12"
                    y="12"
                    width="6"
                    height="6"
                    rx="1"
                  />
                </svg>
              </span>

              <h4>
                Unified Dashboard
              </h4>

              <p>
                Real-time metrics at your fingertips.
              </p>

            </div>

            {/* FEATURE 2 */}
            <div className="feature-card">

              <span
                className="feature-icon"
                aria-hidden="true"
              >
                <svg
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  width="20"
                  height="20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M10 2C7.23858 2 5 4.23858 5 7V9C4.44772 9 4 9.44772 4 10V14C4 15.6569 5.34315 17 7 17H13C14.6569 17 16 15.6569 16 14V10C16 9.44772 15.5523 9 15 9V7C15 4.23858 12.7614 2 10 2Z"
                    opacity="0.25"
                  />

                  <path
                    d="M7.75 10.75L9.5 12.5L12.75 9.25"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>

              <h4>
                Secure Access
              </h4>

              <p>
                Enterprise-grade data protection.
              </p>

            </div>

          </div>

        </div>

      </div>


      {/* RIGHT SIDE */}
      <div className="login-right">

        <div className="login-form-box">

          {/* Mobile-only logo */}
          <div className="mobile-logo-header">

            <img
              src={logo}
              alt="Infinetra Logo"
              className="mobile-logo"
            />

            <span className="mobile-brand-name">
              Infinetra HRMS
            </span>

          </div>


          <h2>
            Welcome back
          </h2>

          <p className="subtitle">
            Sign in to continue to your dashboard.
          </p>


          {/* EMAIL/PASSWORD FORM */}
          <form onSubmit={handleLogin}>

            {/* EMAIL */}
            <div className="form-group">

              <label>
                Email Address
              </label>

              <input
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
              />

            </div>


            {/* PASSWORD */}
            <div className="form-group">

              <label>
                Password
              </label>

              <div className="password-wrapper">

                <input
                  type={
                    showPassword
                      ? 'text'
                      : 'password'
                  }
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                />

                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() =>
                    setShowPassword(
                      (prev) => !prev
                    )
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  title={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {
                    showPassword
                      ? <FiEyeOff size={18} />
                      : <FiEye size={18} />
                  }
                </button>

              </div>

            </div>


            {/* FORGOT PASSWORD */}
            <div className="form-row">

              <div>

                <Link
                  to="/forgot-password"
                  className="link"
                >
                  Forgot Password?
                </Link>

              </div>

            </div>


            {/* NORMAL LOGIN */}
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {
                loading
                  ? 'Signing In...'
                  : 'Sign In'
              }
            </button>


            {/* DIVIDER */}
            <div className="divider">

              <span></span>

              <p>
                OR
              </p>

              <span></span>

            </div>


            {/* GOOGLE SIGN-IN */}
            <div
              ref={googleButtonRef}
              className="google-button-container"
            ></div>

          </form>


          {/* REGISTER */}
          <p className="register-text">

            New to Infinetra?{' '}

            <button
              type="button"
              className="link link-button"
              onClick={openPasskeyModal}
            >
              Register now
            </button>

          </p>


          {/* POWERED BY */}
          <p className="powered-by">
            POWERED BY INFINETRA TECH
          </p>

        </div>

      </div>


      {/* PASSKEY MODAL */}
      {showPasskeyModal && (
        <Passkey
          onClose={closePasskeyModal}
          onSuccess={handlePasskeySuccess}
        />
      )}

    </div>
  );
}

export default Login;