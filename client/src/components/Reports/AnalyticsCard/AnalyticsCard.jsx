import React from "react";
import "./AnalyticsCard.css";

export default function AnalyticsCard({
  title,
  subtitle,
  children,
  action,
  className = "",
}) {
  return (
    <div className={`analytics-card ${className}`}>
      {(title || action) && (
        <div className="analytics-card-header">
          <div>
            {title && <h3 className="analytics-card-title">{title}</h3>}
            {subtitle && <p className="analytics-card-subtitle">{subtitle}</p>}
          </div>
          {action && <div className="analytics-card-action">{action}</div>}
        </div>
      )}
      <div className="analytics-card-body">{children}</div>
    </div>
  );
}
