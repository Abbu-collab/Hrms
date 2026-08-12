import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { generateMonthlyReport, exportReport } from "../../../services/reportService";
import ReportFilters from "../../../components/Reports/ReportFilters/ReportFilters";
import ReportSummary from "../../../components/Reports/ReportSummary/ReportSummary";
import { formatCurrency } from "../../../utils/formatCurrency";
import "./MonthlyReport.css";

const MONTH_NAMES = [
  "", "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function MonthlyReport() {
  const navigate = useNavigate();
  const currentDate = new Date();

  const [filters, setFilters] = useState({
    month: currentDate.getMonth() + 1,
    year: currentDate.getFullYear(),
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [generatedReport, setGeneratedReport] = useState(null);

  const handleGenerate = async (activeFilters) => {
    if (!activeFilters.month || !activeFilters.year) {
      setError("Please select both Month and Year.");
      return;
    }

    setLoading(true);
    setError(null);
    setGeneratedReport(null);
    try {
      const res = await generateMonthlyReport(activeFilters.month, activeFilters.year);
      if (!res.data) {
        setError(res.message || "No payroll records available for the selected period.");
      } else {
        setGeneratedReport(res.data);
      }
    } catch (err) {
      setError(err.message || "Failed to generate monthly report");
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
    <div className="monthly-report-page">
      <div className="page-card">
        <div className="page-card-header">
          <h2>Generate Monthly Report</h2>
          <p>Select month and year to compute monthly payroll aggregation.</p>
        </div>

        <ReportFilters
          filters={filters}
          onChange={setFilters}
          onApply={handleGenerate}
          visibleFields={["month", "year"]}
          loading={loading}
          submitText="Generate Report"
        />

        {error && <div className="report-alert alert-error">{error}</div>}

        {generatedReport && (
          <div className="generated-report-result">
            <div className="result-header">
              <div className="result-title-group">
                <span className="badge-monthly">MONTHLY REPORT</span>
                <h3>{`${MONTH_NAMES[generatedReport.month]} ${generatedReport.year}`}</h3>
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

            {/* Real Summary */}
            <ReportSummary summary={generatedReport.summary} />
          </div>
        )}
      </div>
    </div>
  );
}
