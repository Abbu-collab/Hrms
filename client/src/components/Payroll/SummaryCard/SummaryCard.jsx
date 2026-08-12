import React from 'react';
import './SummaryCard.css';

/**
 * SummaryCard — Payroll summary metric card.
 *
 * Props:
 *   title    — Card heading (e.g. "Total Net Salary Payout")
 *   value    — Display value, possibly compact (e.g. "₹54.55 Cr")
 *   exactValue — Optional full exact value shown in tooltip (e.g. "₹5,45,50,000")
 *   subtitle — Secondary line (e.g. "Gross: ₹X | Ded: ₹Y")
 *   icon     — Emoji or element for the icon area
 *   variant  — Color variant: 'primary' | 'success' | 'warning' | 'danger' | 'info'
 */
export default function SummaryCard({ title, value, exactValue, subtitle, icon, variant = 'primary' }) {
  return (
    <div
      className={`summary-card summary-card-${variant}`}
      title={exactValue || undefined}
    >
      <div className="summary-card-content">
        <span className="summary-card-title">{title}</span>
        <div
          className="summary-card-value"
          title={exactValue || undefined}
        >
          {value}
        </div>
        {subtitle && <span className="summary-card-subtitle">{subtitle}</span>}
      </div>
      {icon && <div className="summary-card-icon">{icon}</div>}
    </div>
  );
}
