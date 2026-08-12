import React from "react";
import { useNavigate } from "react-router-dom";
import "./ReportCard.css";

export default function ReportCard({
  title,
  description,
  icon,
  type,
  targetPath,
  actionText = "Generate Report",
}) {
  const navigate = useNavigate();

  return (
    <div className={`report-card-item report-card-${type || "default"}`}>
      <div className="report-card-header">
        <div className="report-card-icon">{icon}</div>
        <span className="report-card-badge">{type ? type.toUpperCase() : "REPORT"}</span>
      </div>
      <div className="report-card-body">
        <h3 className="report-card-title">{title}</h3>
        <p className="report-card-description">{description}</p>
      </div>
      <div className="report-card-footer">
        <button
          className="report-card-btn"
          onClick={() => navigate(targetPath)}
          type="button"
        >
          {actionText}
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
