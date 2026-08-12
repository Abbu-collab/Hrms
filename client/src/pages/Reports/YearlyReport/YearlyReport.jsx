import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { generateYearlyReport, exportReport } from "../../../services/reportService";
import ReportFilters from "../../../components/Reports/ReportFilters/ReportFilters";
import ReportSummary from "../../../components/Reports/ReportSummary/ReportSummary";
import "./YearlyReport.css";

export default function YearlyReport() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    year: new Date().getFullYear(),
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [generatedReport, setGeneratedReport] = useState(null);

  const handleGenerate = async (activeFilters) => {
    if (!activeFilters.year) {
      setError("Please select a Year.");
      return;
    }

    setLoading(true);
    setError(null);
    setGeneratedReport(null);
    try {
      const res = await generateYearlyReport(activeFilters.year);
      if (!res.data) {
        setError(res.message || "No payroll records available for the selected year.");
      } else {
        setGeneratedReport(res.data);
      }
    } catch (err) {
      setError(err.message || "Failed to generate yearly report");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (!generatedReport?._id) return;
    try {
      await exportReport(generatedReport._id);
    } catch (err) {
      alert(err.message || "Failed to export CSV");
    }
  };

  return (
    <div className="yearly-report-page">
      <div className="page-card">
        <div className="page-card-header">
          <h2>Generate Yearly Report</h2>
          <p>Compute annual financial summary and overall tax & salary aggregates.</p>
        </div>

        <ReportFilters
          filters={filters}
          onChange={setFilters}
          onApply={handleGenerate}
          visibleFields={["year"]}
          loading={loading}
          submitText="Generate Report"
        />

        {error && <div className="report-alert alert-error">{error}</div>}

        {generatedReport && (
          <div className="generated-report-result">
            <div className="result-header">
              <div className="result-title-group">
                <span className="badge-yearly">YEARLY REPORT</span>
                <h3>Year {generatedReport.year}</h3>
                <span className="report-id-code">ID: {generatedReport._id}</span>
              </div>
              <div className="result-actions">
                <button
                  className="btn-secondary"
                  onClick={() => navigate(`/reports/${generatedReport._id}`)}
                >
                  View Details
                </button>
                <button className="btn-primary" onClick={handleExport}>
                  Export CSV
                </button>
              </div>
            </div>

            <div className="result-meta">
              <span>
                <strong>Generated Date:</strong>{" "}
                {new Date(generatedReport.generatedAt || generatedReport.createdAt).toLocaleString("en-IN")}
              </span>
            </div>

            <ReportSummary summary={generatedReport.summary} />
          </div>
        )}
      </div>
    </div>
  );
}
