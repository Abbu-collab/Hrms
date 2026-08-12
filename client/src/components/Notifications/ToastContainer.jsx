import React from 'react';
import { FiCheckCircle, FiXCircle, FiAlertTriangle, FiInfo, FiX } from 'react-icons/fi';
import './ToastContainer.css';

const TOAST_ICONS = {
  success: <FiCheckCircle size={18} className="toast-type-icon toast-success-icon" />,
  error:   <FiXCircle size={18} className="toast-type-icon toast-error-icon" />,
  warning: <FiAlertTriangle size={18} className="toast-type-icon toast-warning-icon" />,
  info:    <FiInfo size={18} className="toast-type-icon toast-info-icon" />
};

const TOAST_TITLES = {
  success: 'Success',
  error:   'Error',
  warning: 'Warning',
  info:    'Notice'
};

export default function ToastContainer({ toasts = [], onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="global-toast-container" role="region" aria-label="Notifications">
      {toasts.map((toast) => (
        <div key={toast.id} className={`global-toast-card toast-${toast.type}`}>
          <div className="toast-badge-icon">
            {TOAST_ICONS[toast.type] || TOAST_ICONS.info}
          </div>
          <div className="toast-body-text">
            <strong>{TOAST_TITLES[toast.type] || 'Notification'}</strong>
            <span>{toast.message}</span>
          </div>
          <button
            type="button"
            className="toast-close-btn"
            onClick={() => onDismiss(toast.id)}
            aria-label="Close notification"
          >
            <FiX size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
