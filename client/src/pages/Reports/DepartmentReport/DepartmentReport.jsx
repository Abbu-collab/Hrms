import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { generateDepartmentReport, exportReport } from "../../../services/reportService";
import { getDepartments } from "../../../services/departmentService";
import ReportFilters from "../../../components/Reports/ReportFilters/ReportFilters";
import ReportSummary from "../../../components/Reports/ReportSummary/ReportSummary";
import "./DepartmentReport.css";

export default function DepartmentReport() {
  const navigate = useNavigate();
  const currentDate = new Date();

  const [departments, setDepartments] = useState([]);
  const [filters, setFilters] = useState({
    department: "",
    month: currentDate.getMonth() + 1,
    year: currentDate.getFullYear(),
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [generatedReport, setGeneratedReport] = useState(null);

  useEffect(() => {
    fetchDepartmentsList();
  }, []);

  const fetchDepartmentsList = async () => {
    try {
      const res = await getDepartments();
      const list = Array.isArray(res) ? res : res.data || res.departments || [];
      setDepartments(list);
    } catch (err) {
      console.error("Failed to fetch department list", err);
    }
  };

  const handleGenerate = async (activeFilters) => {
    if (!activeFilters.department) {
      setError("Please select a Department.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await generateDepartmentReport(
        activeFilters.department,
        activeFilters.month,
        activeFilters.year
      );
      setGeneratedReport(res.data);
    } catch (err) {
      setError(err.message || "Failed to generate department report");
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
    <div className="department-report-page">
      <div className="page-card">
        <div className="page-card-header">
          <h2>Generate Department Report</h2>
          <p>Analyze payroll and headcount totals grouped by department and period.</p>
        </div>

        <ReportFilters
          filters={filters}
          onChange={setFilters}
          onApply={handleGenerate}
          visibleFields={["department", "month", "year"]}
          departments={departments}
          loading={loading}
          submitText="Generate Report"
        />

        {error && <div className="report-alert alert-error">{error}</div>}

        {generatedReport && (
          <div className="generated-report-result">
            <div className="result-header">
              <div className="result-title-group">
                <span className="badge-department">DEPARTMENT REPORT</span>
                <h3>Department: {generatedReport.department}</h3>
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
                <strong>Period:</strong>{" "}
                {[generatedReport.month ? `Month ${generatedReport.month}` : null, generatedReport.year ? `Year ${generatedReport.year}` : null].filter(Boolean).join(", ") || "All time"}
              </span>
              <br />
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
