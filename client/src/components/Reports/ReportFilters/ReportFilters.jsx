import React from "react";
import "./ReportFilters.css";

const MONTHS = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 7 }, (_, i) => currentYear - i);

export default function ReportFilters({
  filters = {},
  onChange,
  onApply,
  onReset,
  visibleFields = ["month", "year"],
  departments = [],
  employees = [],
  loading = false,
  submitText = "Filter",
}) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange({ ...filters, [name]: value });
  };

  const isVisible = (field) => visibleFields.includes(field);

  return (
    <form
      className="report-filters-form"
      onSubmit={(e) => {
        e.preventDefault();
        if (onApply) onApply(filters);
      }}
    >
      <div className="report-filters-grid">
        {isVisible("reportType") && (
          <div className="filter-group">
            <label htmlFor="reportType">Report Type</label>
            <select
              id="reportType"
              name="reportType"
              value={filters.reportType || ""}
              onChange={handleChange}
            >
              <option value="">All Types</option>
              <option value="monthly">Monthly Report</option>
              <option value="yearly">Yearly Report</option>
              <option value="employee">Employee Report</option>
              <option value="department">Department Report</option>
            </select>
          </div>
        )}

        {isVisible("month") && (
          <div className="filter-group">
            <label htmlFor="month">Month</label>
            <select
              id="month"
              name="month"
              value={filters.month || ""}
              onChange={handleChange}
            >
              <option value="">Select Month</option>
              {MONTHS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {isVisible("year") && (
          <div className="filter-group">
            <label htmlFor="year">Year</label>
            <select
              id="year"
              name="year"
              value={filters.year || ""}
              onChange={handleChange}
            >
              <option value="">Select Year</option>
              {YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        )}

        {isVisible("department") && (
          <div className="filter-group">
            <label htmlFor="department">Department</label>
            <select
              id="department"
              name="department"
              value={filters.department || ""}
              onChange={handleChange}
            >
              <option value="">Select Department</option>
              {departments.map((dept) => {
                const name = typeof dept === "string" ? dept : dept.departmentName || dept.name;
                return (
                  <option key={name} value={name}>
                    {name}
                  </option>
                );
              })}
            </select>
          </div>
        )}

        {isVisible("employeeId") && (
          <div className="filter-group">
            <label htmlFor="employeeId">Employee</label>
            <select
              id="employeeId"
              name="employeeId"
              value={filters.employeeId || ""}
              onChange={handleChange}
            >
              <option value="">Select Employee</option>
              {employees.map((emp) => {
                // Populated Employee model: { _id, employee_code, user_id: { name }, designation }
                const empCode = emp.employee_code || "";
                const empName =
                  (emp.user_id && (emp.user_id.name || emp.user_id.fullName)) ||
                  emp.name ||
                  emp.employeeName ||
                  `${emp.firstName || ""} ${emp.lastName || ""}`.trim() ||
                  "";
                const displayLabel =
                  empCode && empName
                    ? `${empCode} - ${empName}`
                    : empCode || empName || emp._id;
                return (
                  <option key={emp._id} value={emp._id}>
                    {displayLabel}
                  </option>
                );
              })}
            </select>
          </div>
        )}

        <div className="filter-actions">
          <button
            type="submit"
            className="filter-submit-btn"
            disabled={loading}
          >
            {loading ? "Processing..." : submitText}
          </button>

          {onReset && (
            <button
              type="button"
              className="filter-reset-btn"
              onClick={onReset}
              disabled={loading}
            >
              Reset
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
