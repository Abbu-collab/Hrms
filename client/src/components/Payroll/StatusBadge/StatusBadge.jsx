import React from 'react';
import './StatusBadge.css';

export default function StatusBadge({ status, type = 'status' }) {
  if (type === 'active') {
    const isActive = Boolean(status);
    return (
      <span className={`status-badge ${isActive ? 'status-active' : 'status-inactive'}`}>
        <span className="badge-dot"></span>
        {isActive ? 'Active' : 'Inactive'}
      </span>
    );
  }

  const normalizedStatus = String(status || '').trim();

  let badgeClass = 'status-generated';
  if (normalizedStatus.toLowerCase() === 'paid') {
    badgeClass = 'status-paid';
  }

  return (
    <span className={`status-badge ${badgeClass}`}>
      <span className="badge-dot"></span>
      {normalizedStatus || 'Generated'}
    </span>
  );
}
