import React from "react";
import { formatCurrency, formatCompactCurrency } from "../../../utils/formatCurrency";
import "./ReportSummary.css";

export default function ReportSummary({ summary = {} }) {
  const totalEmployees = summary?.totalEmployees ?? 0;
  const totalGrossPay = summary?.totalGrossPay ?? 0;
  const totalDeductions = summary?.totalDeductions ?? 0;
  const totalNetPay = summary?.totalNetPay ?? 0;

  const cards = [
    {
      title: "Total Employees",
      value: totalEmployees.toLocaleString(),
      fullValue: totalEmployees.toLocaleString(),
      subtitle: "Covered in report",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
      color: "blue",
    },
    {
      title: "Total Gross Pay",
      value: formatCompactCurrency(totalGrossPay),
      fullValue: formatCurrency(totalGrossPay),
      subtitle: "Gross earnings",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      ),
      color: "emerald",
    },
    {
      title: "Total Deductions",
      value: formatCompactCurrency(totalDeductions),
      fullValue: formatCurrency(totalDeductions),
      subtitle: "Taxes & PF deductions",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M5 12h14" />
        </svg>
      ),
      color: "amber",
    },
    {
      title: "Total Net Pay",
      value: formatCompactCurrency(totalNetPay),
      fullValue: formatCurrency(totalNetPay),
      subtitle: "Net disbursed",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      ),
      color: "indigo",
    },
  ];

  return (
    <div className="report-summary-grid">
      {cards.map((card, idx) => (
        <div key={idx} className={`summary-card summary-card-${card.color}`}>
          <div className="summary-card-header">
            <span className="summary-card-title">{card.title}</span>
            <div className="summary-card-icon">{card.icon}</div>
          </div>
          <div className="summary-card-value" title={card.fullValue}>{card.value}</div>
          <div className="summary-card-subtitle">{card.subtitle}</div>
        </div>
      ))}
    </div>
  );
}
