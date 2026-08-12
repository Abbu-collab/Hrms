import React from 'react';
import './EmptyState.css';

export default function EmptyState({ message = 'No payroll records found.', title = 'No Records Available', actionText, onAction }) {
  return (
    <div className="payroll-empty-state">
      <div className="payroll-empty-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      </div>
      <h3 className="payroll-empty-title">{title}</h3>
      <p className="payroll-empty-desc">{message}</p>
      {actionText && onAction && (
        <button className="pr-btn pr-btn-primary" onClick={onAction}>
          {actionText}
        </button>
      )}
    </div>
  );
}
