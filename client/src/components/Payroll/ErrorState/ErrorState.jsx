import React from 'react';
import './ErrorState.css';

export default function ErrorState({ message = 'Unable to load payroll data.', onRetry }) {
  return (
    <div className="payroll-error-state">
      <div className="payroll-error-icon">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
      </div>
      <h3 className="payroll-error-title">An Error Occurred</h3>
      <p className="payroll-error-desc">{message}</p>
      {onRetry && (
        <button className="pr-btn pr-btn-secondary" onClick={onRetry}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
          Try Again
        </button>
      )}
    </div>
  );
}
