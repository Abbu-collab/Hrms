import React, { useEffect, useState, useMemo } from "react";
import { getAllReports } from "../../../services/reportService";
import ReportTable from "../../../components/Reports/ReportTable/ReportTable";
import "./AllReports.css";

const MONTH_NAMES = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december"
];

export default function AllReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Top Controls Filter State
  const [selectedType, setSelectedType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAllReports();
      setReports(res.data || []);
    } catch (err) {
      setError(err.message || "Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // Instant Frontend Filter & Search (No extra backend calls)
  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      // 1. Report Type Filter
      if (selectedType !== "all" && report.reportType !== selectedType) {
        return false;
      }

      // 2. Search Query Filter
      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase().trim();
      const typeStr = (report.reportType || "").toLowerCase();
      const deptStr = (report.department || report.employee?.department || "").toLowerCase();
      const empCode = (report.employee?.employeeCode || report.employeeCode || "").toLowerCase();
      const empName = (report.employee?.fullName || report.employeeName || "").toLowerCase();
      const monthStr = report.month ? String(report.month) : "";
      const yearStr = report.year ? String(report.year) : "";
      const monthName = report.month && MONTH_NAMES[report.month - 1] ? MONTH_NAMES[report.month - 1] : "";

      return (
        typeStr.includes(q) ||
        deptStr.includes(q) ||
        empCode.includes(q) ||
        empName.includes(q) ||
        monthStr.includes(q) ||
        monthName.includes(q) ||
        yearStr.includes(q)
      );
    });
  }, [reports, selectedType, searchQuery]);

  return (
    <div className="all-reports-page-card">
      <div className="page-card-header">
        <div>
          <h2>All Generated Reports</h2>
          <p>Instant search and filter across all generated monthly, yearly, employee, and department reports.</p>
        </div>
      </div>

      {/* Top Controls Toolbar */}
      <div className="all-reports-toolbar">
        <div className="toolbar-left">
          {/* Report Type Filter Dropdown */}
          <div className="control-group">
            <label htmlFor="reportTypeFilter" className="control-label">
              Report Type
            </label>
            <select
              id="reportTypeFilter"
              className="control-select"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="all">All Reports</option>
              <option value="monthly">Monthly Reports</option>
              <option value="yearly">Yearly Reports</option>
              <option value="employee">Employee Reports</option>
              <option value="department">Department Reports</option>
            </select>
          </div>

          {/* Search Box */}
          <div className="control-group search-group">
            <label htmlFor="reportSearchInput" className="control-label">
              Search
            </label>
            <div className="search-input-wrapper">
              <input
                id="reportSearchInput"
                type="text"
                className="control-search-input"
                placeholder="🔍 Search Employee, Code, Dept, Year..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="clear-search-btn"
                  onClick={() => setSearchQuery("")}
                  title="Clear search"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="toolbar-right">
          {/* Refresh Button */}
          <button
            type="button"
            className="refresh-reports-btn"
            onClick={fetchReports}
            disabled={loading}
          >
            <svg
              className={`refresh-icon ${loading ? "spinning" : ""}`}
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M23 4v6h-6" />
              <path d="M1 20v-6h6" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* Results Count & Filter Status */}
      <div className="filter-status-bar">
        <span className="results-count">
          Showing <strong>{filteredReports.length}</strong> of {reports.length} reports
        </span>
        {(selectedType !== "all" || searchQuery) && (
          <button
            className="reset-filters-btn"
            onClick={() => {
              setSelectedType("all");
              setSearchQuery("");
            }}
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Report Table Container */}
      <ReportTable
        reports={filteredReports}
        loading={loading}
        error={error}
        onRefresh={fetchReports}
      />
    </div>
  );
}
