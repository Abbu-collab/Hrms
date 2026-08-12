import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getReportById, exportReport } from "../../../services/reportService";
import ReportSummary from "../../../components/Reports/ReportSummary/ReportSummary";
import { formatCurrency } from "../../../utils/formatCurrency";
import "./ReportDetails.css";

const MONTH_NAMES = [
  "", "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function ReportDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (id) fetchDetails();
  }, [id]);

  const fetchDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getReportById(id);
      setReport(res.data);
    } catch (err) {
      setError(err.message || "Failed to load report details");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (!id) return;
    setExporting(true);
    try {
      await exportReport(id);
    } catch (err) {
      alert(err.message || "Failed to export report CSV");
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return <div className="details-loading-state">Loading report details...</div>;
  }

  if (error || !report) {
    return (
      <div className="details-error-state">
        <h3>Report Not Found</h3>
        <p>{error || "Unable to fetch the requested report."}</p>
        <button className="btn-secondary" onClick={() => navigate("/reports/dashboard")}>
          Back to Reports
        </button>
      </div>
    );
  }

  const type = report.reportType || "monthly";
  const monthText = report.month ? MONTH_NAMES[report.month] : "All Months";
  const yearText = report.year ? report.year : "All Years";
  const deptText = report.employee?.department || report.department || "All Departments";
  const empCodeText = report.employee?.employeeCode || (type === "employee" ? "EMP" : "All Employees");
  const empNameText = report.employee?.fullName || (type === "employee" ? "Employee" : "All Employees");
  const generatedAtText = report.generatedAt || report.createdAt
    ? new Date(report.generatedAt || report.createdAt).toLocaleString("en-IN")
    : "N/A";

  return (
    <div className="report-details-page">
      <div className="details-card">
        {/* Navigation & Header */}
        <div className="details-header">
          <div className="header-left">
            <button className="back-btn" onClick={() => navigate(-1)}>
              ← Back
            </button>
            <span className={`details-type-badge type-${type}`}>
              {type.toUpperCase()} REPORT
            </span>
            <h2 className="details-title">Report Details</h2>
          </div>
          <div className="header-right">
            <button className="btn-primary" onClick={handleExport} disabled={exporting}>
              {exporting ? "Exporting..." : "Export CSV"}
            </button>
          </div>
        </div>

        {/* Report Overview Meta Table */}
        <div className="details-meta-grid">
          <div className="meta-item">
            <span className="meta-label">Report Type</span>
            <span className="meta-value capitalize">{type}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Month</span>
            <span className="meta-value">{monthText}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Year</span>
            <span className="meta-value">{yearText}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Department</span>
            <span className="meta-value">{deptText}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Employee Code</span>
            <span className="meta-value code-font">{empCodeText}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Employee Name</span>
            <span className="meta-value">{empNameText}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Generated At</span>
            <span className="meta-value">{generatedAtText}</span>
          </div>
        </div>

        {/* Summary Metric Cards */}
        <div className="details-section">
          <h3 className="details-section-title">Summary Performance</h3>
          <ReportSummary summary={report.summary} />
        </div>

        {/* Detailed Breakdown Card */}
        <div className="details-section">
          <h3 className="details-section-title">Financial Summary Data</h3>
          <div className="summary-data-table-wrapper">
            <table className="summary-data-table">
              <thead>
                <tr>
                  <th>Metric Name</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Total Employees Covered</td>
                  <td className="bold">{report.summary?.totalEmployees ?? 0}</td>
                </tr>
                <tr>
                  <td>Total Gross Salary Earnings</td>
                  <td className="bold">{formatCurrency(report.summary?.totalGrossPay || 0)}</td>
                </tr>
                <tr>
                  <td>Total Payroll Deductions (TDS, PF, etc.)</td>
                  <td className="bold">{formatCurrency(report.summary?.totalDeductions || 0)}</td>
                </tr>
                <tr>
                  <td>Total Net Salary Disbursed</td>
                  <td className="bold highlight-net">{formatCurrency(report.summary?.totalNetPay || 0)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
