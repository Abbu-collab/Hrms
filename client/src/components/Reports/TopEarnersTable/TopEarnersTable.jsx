import React from "react";
import { formatCurrency } from "../../../utils/formatCurrency";
import "./TopEarnersTable.css";

const MONTH_NAMES = [
  "", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

export default function TopEarnersTable({ data = [], loading = false, error = null }) {
  if (loading) {
    return <div className="table-loading-state">Loading top earners...</div>;
  }

  if (error) {
    return <div className="table-error-state">{error}</div>;
  }

  if (!data || data.length === 0) {
    return <div className="table-empty-state">No top earners found for this period.</div>;
  }

  return (
    <div className="top-earners-table-wrapper">
      <table className="top-earners-table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Employee</th>
            <th>Month/Year</th>
            <th>Gross Pay</th>
            <th>Net Pay</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => {
            // Backend sends { employeeCode, employeeName, grossSalary, netSalary }
            const empCode = item.employeeCode || "";
            const empName = item.employeeName || "";
            const empDisplay =
              empCode && empName
                ? `${empCode} - ${empName}`
                : empCode || empName || "No employee assigned";

            return (
              <tr key={item._id || index}>
                <td className="rank-cell">
                  <span className={`rank-badge rank-${index + 1}`}>#{index + 1}</span>
                </td>
                <td className="emp-id-cell">{empDisplay}</td>
                <td>{`${MONTH_NAMES[item.month] || item.month} ${item.year}`}</td>
                <td>{formatCurrency(item.grossSalary || item.grossPay || 0)}</td>
                <td className="net-pay-cell">{formatCurrency(item.netSalary || item.netPay || 0)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
