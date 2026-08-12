import React from 'react';
import { MONTH_NAMES, PAYROLL_STATUS, YEARS_LIST } from '../../../utils/payrollConstants';
import './PayrollFilter.css';

export default function PayrollFilter({
  selectedMonth = '',
  selectedYear = '',
  selectedStatus = '',
  onMonthChange,
  onYearChange,
  onStatusChange,
  onReset,
}) {
  return (
    <div className="payroll-filter-bar">
      <div className="filter-group">
        <label className="filter-label">Month</label>
        <select
          className="filter-select"
          value={selectedMonth}
          onChange={(e) => onMonthChange(e.target.value)}
        >
          <option value="">All Months</option>
          {MONTH_NAMES.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label className="filter-label">Year</label>
        <select
          className="filter-select"
          value={selectedYear}
          onChange={(e) => onYearChange(e.target.value)}
        >
          <option value="">All Years</option>
          {YEARS_LIST.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label className="filter-label">Status</label>
        <select
          className="filter-select"
          value={selectedStatus}
          onChange={(e) => onStatusChange(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value={PAYROLL_STATUS.GENERATED}>{PAYROLL_STATUS.GENERATED}</option>
          <option value={PAYROLL_STATUS.PAID}>{PAYROLL_STATUS.PAID}</option>
        </select>
      </div>

    </div>
  );
}
