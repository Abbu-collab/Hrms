import React, { useState } from 'react';
import './Input.css';

/**
 * Reusable Enterprise Input Component
 * Supports text, email, password, search, number, date, textarea
 * Supports states: error, success, disabled
 * Features: Password show/hide toggle, Search icon, Label, Helper text
 */
const Input = ({
  label,
  type = 'text',
  value,
  onChange,
  placeholder = '',
  error = '',
  success = '',
  disabled = false,
  required = false,
  icon = null,
  helperText = '',
  name,
  id,
  className = '',
  rows = 4,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id || name || `hrms-input-${Math.random().toString(36).substr(2, 9)}`;

  const isPassword = type === 'password';
  const isSearch = type === 'search';
  const isTextarea = type === 'textarea';
  const actualType = isPassword ? (showPassword ? 'text' : 'password') : type;

  // Determine icons
  const leftIcon = isSearch ? (icon || '🔍') : icon;

  const wrapperClasses = [
    'hrms-input-wrapper',
    leftIcon ? 'hrms-input-has-left-icon' : '',
    isPassword ? 'hrms-input-has-right-icon' : '',
    error ? 'hrms-input-error' : '',
    success ? 'hrms-input-success' : '',
    disabled ? 'hrms-input-disabled' : ''
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={`hrms-input-group ${className}`}>
      {label && (
        <label htmlFor={inputId} className="hrms-input-label">
          {label}
          {required && <span className="hrms-input-required-star">*</span>}
        </label>
      )}

      <div className={wrapperClasses}>
        {leftIcon && <span className="hrms-input-left-icon">{leftIcon}</span>}

        {isTextarea ? (
          <textarea
            id={inputId}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            rows={rows}
            className="hrms-input-field"
            {...props}
          />
        ) : (
          <input
            id={inputId}
            name={name}
            type={actualType}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            className="hrms-input-field"
            {...props}
          />
        )}

        {isPassword && (
          <button
            type="button"
            className="hrms-input-password-toggle"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
            title={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? '🙈' : '👁️'}
          </button>
        )}
      </div>

      {error && <div className="hrms-input-error-msg">⚠️ {error}</div>}
      {!error && success && <div className="hrms-input-success-msg">✓ {success}</div>}
      {!error && !success && helperText && <div className="hrms-input-helper">{helperText}</div>}
    </div>
  );
};

export default Input;
