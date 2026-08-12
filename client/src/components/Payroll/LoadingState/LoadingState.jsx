import React from 'react';
import './LoadingState.css';

export default function LoadingState({ message = 'Loading payroll data...' }) {
  return (
    <div className="payroll-loading-state">
      <div className="payroll-spinner"></div>
      <p className="payroll-loading-message">{message}</p>
    </div>
  );
}
