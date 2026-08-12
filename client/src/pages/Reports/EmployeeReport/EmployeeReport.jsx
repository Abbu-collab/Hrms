import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { generateEmployeeReport, exportReport } from "../../../services/reportService";
import { getAllEmployees } from "../../../services/employeeService";
import ReportFilters from "../../../components/Reports/ReportFilters/ReportFilters";
import ReportSummary from "../../../components/Reports/ReportSummary/ReportSummary";
import "./EmployeeReport.css";

export default function EmployeeReport() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [filters, setFilters] = useState({ employeeId: "" });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [generatedReport, setGeneratedReport] = useState(null);

  useEffect(() => {
    fetchEmployeesList();
  }, []);

  const fetchEmployeesList = async () => {
    try {
      const res = await getAllEmployees({ limit: 200 });
      // res.data or res employees array
      const list = Array.isArray(res) ? res : res.data || res.employees || [];
      setEmployees(list);
    } catch (err) {
      console.error("Failed to fetch employees list", err);
    }
  };

  const handleGenerate = async (activeFilters) => {
    if (!activeFilters.employeeId) {
      setError("Please select an Employee.");
      return;
    }

    setLoading(true);
    setError(null);
    setGeneratedReport(null);
    try {
      const res = await generateEmployeeReport(activeFilters.employeeId);
      if (!res.data) {
        setError(res.message || "No payroll records available for this employee.");
      } else {
        setGeneratedReport(res.data);
      }
    } catch (err) {
      setError(err.message || "Failed to generate employee report");
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
    <div className="employee-report-page">
      <div className="page-card">
        <div className="page-card-header">
          <h2>Generate Employee Report</h2>
          <p>Select an employee from the organization directory to compile their full salary & earnings report.</p>
        </div>

        <ReportFilters
          filters={filters}
          onChange={setFilters}
          onApply={handleGenerate}
          visibleFields={["employeeId"]}
          employees={employees}
          loading={loading}
          submitText="Generate Report"
        />

        {error && <div className="report-alert alert-error">{error}</div>}

        {generatedReport && (
          <div className="generated-report-result">
            <div className="result-header">
              <div className="result-title-group">
                <span className="badge-employee">EMPLOYEE REPORT</span>
                <h3>{generatedReport.employee?.employeeCode ? `${generatedReport.employee.employeeCode} - ${generatedReport.employee.fullName}` : "Employee Report"}</h3>
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
