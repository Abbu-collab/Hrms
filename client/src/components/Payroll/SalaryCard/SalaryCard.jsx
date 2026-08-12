import React from 'react';
import StatusBadge from '../StatusBadge';
import formatCurrency from '../../../utils/formatCurrency';
import { getEmployeeDisplay } from '../../../utils/payrollConstants';
import './SalaryCard.css';

export default function SalaryCard({ salary, onView, onEdit, onDeactivate }) {
  if (!salary) return null;

  const empDisplay = getEmployeeDisplay(salary.employeeId);

  return (
    <div className="salary-card">
      <div className="salary-card-header">
        <div>
          <span className="salary-emp-label">Employee</span>
          <h4 className="salary-emp-code">{empDisplay.code || '—'}</h4>
          {empDisplay.name && <p className="salary-emp-name">{empDisplay.name}</p>}
          {empDisplay.dept && <p className="salary-emp-dept">{empDisplay.dept}</p>}
        </div>
        <StatusBadge status={salary.isActive} type="active" />
      </div>

      <div className="salary-card-body">
        <div className="salary-breakdown-row">
          <span>Basic Salary</span>
          <span className="font-strong">{formatCurrency(salary.basicSalary)}</span>
        </div>
        <div className="salary-breakdown-row">
          <span>HRA</span>
          <span>{formatCurrency(salary.hra)}</span>
        </div>
        <div className="salary-breakdown-row">
          <span>Allowances</span>
          <span>{formatCurrency(salary.allowances)}</span>
        </div>
        <div className="salary-breakdown-row">
          <span>Bonus</span>
          <span>{formatCurrency(salary.bonus)}</span>
        </div>
        <div className="salary-breakdown-row text-danger">
          <span>Deductions</span>
          <span>-{formatCurrency(salary.deductions)}</span>
        </div>

        <div className="salary-divider"></div>

        <div className="salary-total-row">
          <span>Gross Salary</span>
          <span className="font-strong">{formatCurrency(salary.grossSalary)}</span>
        </div>
        <div className="salary-total-row net-row">
          <span>Net Salary</span>
          <span className="font-strong text-success">{formatCurrency(salary.netSalary)}</span>
        </div>
      </div>

      <div className="salary-card-footer">
        <span className="salary-date">
          Effective: {salary.effectiveFrom ? new Date(salary.effectiveFrom).toLocaleDateString('en-IN') : '-'}
        </span>
        <div className="salary-actions">
          {onView && (
            <button className="pr-btn pr-btn-secondary pr-btn-sm" onClick={() => onView(salary._id)}>
              View
            </button>
          )}
          {onEdit && (
            <button className="pr-btn pr-btn-secondary pr-btn-sm" onClick={() => onEdit(salary._id)}>
              Edit
            </button>
          )}
          {onDeactivate && salary.isActive && (
            <button className="pr-btn pr-btn-danger pr-btn-sm" onClick={() => onDeactivate(salary._id)}>
              Deactivate
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
