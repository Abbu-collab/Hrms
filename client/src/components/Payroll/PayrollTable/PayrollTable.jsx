import React from 'react';
import StatusBadge from '../StatusBadge';
import formatCurrency from '../../../utils/formatCurrency';
import { getMonthName, getEmployeeDisplay } from '../../../utils/payrollConstants';
import './PayrollTable.css';

export default function PayrollTable({ payrolls = [], onView, onMarkPaid, isActionLoading = false }) {
  return (
    <div className="payroll-table-wrapper">
      <table className="payroll-table">
        <thead>
          <tr>
            <th>Employee</th>
            <th>Period</th>
            <th>Attendance</th>
            <th>Basic</th>
            <th>HRA</th>
            <th>Allowances</th>
            <th>Bonus</th>
            <th>Deductions</th>
            <th>Gross Salary</th>
            <th>Net Salary</th>
            <th>Status</th>
            <th>Payment Date</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {payrolls.map((item) => {
            const empDisplay = getEmployeeDisplay(item.employeeId, item.employeeSnapshot);
            const monthStr = getMonthName(item.month);
            const isPaid = item.status === 'Paid';

            return (
              <tr key={item._id}>
                <td>
                  <div className="employee-cell">
                    <span className="emp-code">{empDisplay.code || '—'}</span>
                    {empDisplay.name && (
                      <span className="emp-name">{empDisplay.name}</span>
                    )}
                  </div>
                </td>
                <td>{monthStr} {item.year}</td>
                <td>
                  <span className="attendance-chip">
                    {item.daysPresent} / {item.totalWorkingDays} days
                  </span>
                </td>
                <td>{formatCurrency(item.basicSalary)}</td>
                <td>{formatCurrency(item.hra)}</td>
                <td>{formatCurrency(item.allowances)}</td>
                <td>{formatCurrency(item.bonus)}</td>
                <td className="text-danger">{formatCurrency(item.deductions)}</td>
                <td className="font-strong">{formatCurrency(item.grossSalary)}</td>
                <td className="font-strong text-success">{formatCurrency(item.netSalary)}</td>
                <td>
                  <StatusBadge status={item.status} />
                </td>
                <td>
                  {item.paymentDate ? new Date(item.paymentDate).toLocaleDateString('en-IN') : '-'}
                </td>
                <td className="text-right">
                  <div className="table-actions">
                    {onView && (
                      <button
                        className="pr-btn pr-btn-secondary pr-btn-sm"
                        onClick={() => onView(item._id)}
                      >
                        View
                      </button>
                    )}
                    {onMarkPaid && !isPaid && (
                      <button
                        className="pr-btn pr-btn-success pr-btn-sm"
                        disabled={isActionLoading}
                        onClick={() => onMarkPaid(item._id)}
                      >
                        Mark Paid
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
