import React from 'react';
import './Button.css';

/**
 * Reusable Enterprise Button Component
 * Supports variants: primary, secondary, success, warning, danger, outline
 * Supports sizes: sm, md, lg
 * Supports loading state, icons, disabled, and standard button attributes.
 */
const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  icon = null,
  loading = false,
  disabled = false,
  className = '',
  type = 'button',
  onClick,
  ...props
}) => {
  const isDisabled = disabled || loading;

  const classes = [
    'hrms-btn',
    `hrms-btn-${variant}`,
    `hrms-btn-${size}`,
    loading ? 'hrms-btn-loading' : '',
    isDisabled ? 'hrms-btn-disabled' : '',
    className
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      className={classes}
      disabled={isDisabled}
      onClick={onClick}
      aria-busy={loading}
      aria-disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <span className="hrms-btn-spinner" aria-hidden="true" />
      ) : (
        icon && <span className="hrms-btn-icon-wrapper">{icon}</span>
      )}
      {children && <span>{children}</span>}
    </button>
  );
};

export default Button;
