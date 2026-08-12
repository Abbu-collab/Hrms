import React from 'react';
import './SearchBar.css';

export default function SearchBar({ value, onChange, placeholder = 'Search by Employee Code or Name...' }) {
  return (
    <div className="payroll-search-bar">
      <input
        type="text"
        className="search-input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <button className="search-clear-btn" onClick={() => onChange('')} title="Clear search">
          ✕
        </button>
      )}
    </div>
  );
}
