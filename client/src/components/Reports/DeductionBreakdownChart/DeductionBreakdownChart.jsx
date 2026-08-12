import React from "react";
import { formatCurrency } from "../../../utils/formatCurrency";
import "./DeductionBreakdownChart.css";

export default function DeductionBreakdownChart({ data = {}, loading = false, error = null }) {
  if (loading) {
    return <div className="chart-loading-state">Loading deduction breakdown...</div>;
  }

  if (error) {
    return <div className="chart-error-state">{error}</div>;
  }

  // New backend sends: { totalDeductions, totalBasicSalary, totalHRA, totalAllowances, totalBonus }
  // Old Payslip backend sent: { totalTax, totalProvidentFund, totalInsurance, totalOther }
  // Support both shapes for backward compatibility.
  const hasNewShape = data?.totalBasicSalary !== undefined || data?.totalHRA !== undefined;

  let items = [];
  let totalAmount = 0;

  if (hasNewShape) {
    // Show earnings breakdown (what makes up gross salary)
    const basic = data?.totalBasicSalary || 0;
    const hra = data?.totalHRA || 0;
    const allowances = data?.totalAllowances || 0;
    const bonus = data?.totalBonus || 0;
    const deductions = data?.totalDeductions || 0;

    totalAmount = basic + hra + allowances + bonus;

    if (totalAmount === 0 && deductions === 0) {
      return <div className="chart-empty-state">No deduction data recorded for this period.</div>;
    }

    if (totalAmount === 0) {
      // Only deductions available – show as single bar
      items = [{ label: "Total Deductions", value: deductions, color: "#dc2626" }];
      totalAmount = deductions;
    } else {
      items = [
        { label: "Basic Salary", value: basic, color: "#2563eb" },
        { label: "HRA", value: hra, color: "#059669" },
        { label: "Allowances", value: allowances, color: "#7c3aed" },
        { label: "Bonus", value: bonus, color: "#d97706" },
        { label: "Total Deductions", value: deductions, color: "#dc2626" },
      ].filter((i) => i.value > 0);
    }
  } else {
    // Legacy Payslip shape
    const tax = data?.totalTax || 0;
    const pf = data?.totalProvidentFund || 0;
    const insurance = data?.totalInsurance || 0;
    const other = data?.totalOther || 0;

    totalAmount = tax + pf + insurance + other;

    if (totalAmount === 0) {
      return <div className="chart-empty-state">No deduction data recorded for this period.</div>;
    }

    items = [
      { label: "Tax (TDS)", value: tax, color: "#dc2626" },
      { label: "Provident Fund (PF)", value: pf, color: "#2563eb" },
      { label: "Health Insurance", value: insurance, color: "#059669" },
      { label: "Other Deductions", value: other, color: "#d97706" },
    ];
  }

  // SVG Donut calculation
  const size = 160;
  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let currentAngle = 0;

  return (
    <div className="deduction-chart-wrapper">
      <div className="donut-visual">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {items.map((item, idx) => {
            if (item.value <= 0) return null;
            const strokeDasharray = `${(item.value / totalAmount) * circumference} ${circumference}`;
            const strokeDashoffset = -currentAngle;
            currentAngle += (item.value / totalAmount) * circumference;

            return (
              <circle
                key={idx}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke={item.color}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
              />
            );
          })}
        </svg>
        <div className="donut-center-text">
          <span className="donut-total-title">Total</span>
          <span className="donut-total-value">{formatCurrency(totalAmount)}</span>
        </div>
      </div>

      <div className="deduction-legend-list">
        {items.map((item, idx) => {
          const pct = Math.round((item.value / totalAmount) * 100);
          return (
            <div key={idx} className="deduction-legend-row">
              <div className="legend-label-group">
                <span className="legend-badge" style={{ backgroundColor: item.color }}></span>
                <span className="legend-text">{item.label}</span>
              </div>
              <div className="legend-val-group">
                <span className="legend-amount">{formatCurrency(item.value)}</span>
                <span className="legend-pct">({pct}%)</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
