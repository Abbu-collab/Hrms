import React from "react";
import { formatCurrency } from "../../../utils/formatCurrency";
import "./DepartmentBreakdownChart.css";

const DEPT_COLORS = ["#2563eb", "#059669", "#7c3aed", "#d97706", "#dc2626", "#0891b2", "#475569"];

export default function DepartmentBreakdownChart({ data = [], loading = false, error = null }) {
  if (loading) {
    return <div className="chart-loading-state">Loading department breakdown...</div>;
  }

  if (error) {
    return <div className="chart-error-state">{error}</div>;
  }

  if (!data || data.length === 0) {
    return <div className="chart-empty-state">No department breakdown data available.</div>;
  }

  const maxNetPay = Math.max(...data.map((d) => d.totalNetPay || 0), 1000);

  return (
    <div className="dept-breakdown-container">
      <div className="dept-bars-list">
        {data.map((item, idx) => {
          // New backend shape: { department, totalNetPay, totalGrossPay, employeeCount }
          // Old shape: { _id, totalNetPay, employeeCount }
          const deptName = item.department || item._id || "Unassigned";
          const percentage = Math.round(((item.totalNetPay || 0) / maxNetPay) * 100);
          const color = DEPT_COLORS[idx % DEPT_COLORS.length];

          return (
            <div key={deptName + idx} className="dept-bar-item">
              <div className="dept-bar-header">
                <div className="dept-name-wrapper">
                  <span className="dept-color-badge" style={{ backgroundColor: color }}></span>
                  <span className="dept-name">{deptName}</span>
                  <span className="dept-emp-count">({item.employeeCount || 0} emp)</span>
                </div>
                <span className="dept-amount">{formatCurrency(item.totalNetPay || 0)}</span>
              </div>
              <div className="dept-progress-track">
                <div
                  className="dept-progress-fill"
                  style={{ width: `${percentage}%`, backgroundColor: color }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
