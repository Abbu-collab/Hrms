import { useState, useMemo } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  FiUsers, FiRefreshCw, FiDownload, FiSearch, FiFilter,
  FiClock, FiCheckCircle, FiAlertTriangle, FiAlertCircle,
} from "react-icons/fi";

// ── helpers ──────────────────────────────────────────────────────────────────

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const fmtTime = (d) =>
  d ? new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—";

const fmtHours = (h) => {
  if (h === undefined || h === null) return "—";
  const mins = Math.round(h * 60);
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
};

const STATUS_META = {
  Present: { cls: "att-badge att-badge-present", label: "Present", icon: <FiCheckCircle size={11} /> },
  Late: { cls: "att-badge att-badge-late", label: "Late", icon: <FiAlertTriangle size={11} /> },
  "Half Day": { cls: "att-badge att-badge-halfday", label: "Half Day", icon: <FiClock size={11} /> },
  "Early Checkout": { cls: "att-badge att-badge-early", label: "Early Checkout", icon: <FiAlertCircle size={11} /> },
};

const StatusBadge = ({ status }) => {
  const m = STATUS_META[status] || { cls: "att-badge att-badge-default", label: status, icon: null };
  return (
    <span className={m.cls}>
      {m.icon} {m.label}
    </span>
  );
};

// ── Main component ────────────────────────────────────────────────────────────

export default function AdminAttendanceMonitor({ records = [], loading, error, onRefresh }) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // ── Computed stats ──────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total = records.length;
    const present = records.filter((r) => r.status === "Present").length;
    const late = records.filter((r) => r.status === "Late").length;
    const halfDay = records.filter((r) => r.status === "Half Day").length;
    const early = records.filter((r) => r.status === "Early Checkout").length;
    return { total, present, late, halfDay, early };
  }, [records]);

  // ── Filtered records ────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = records;

    if (filterStatus) {
      list = list.filter((r) => r.status === filterStatus);
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (r) =>
          r.employee?.name?.toLowerCase().includes(q) ||
          r.employee?.email?.toLowerCase().includes(q) ||
          r.employee?.role?.toLowerCase().includes(q) ||
          r.employee?.department?.toLowerCase().includes(q)
      );
    }

    return list;
  }, [records, search, filterStatus]);

  // ── PDF Export ──────────────────────────────────────────────────────────
  const handleExportPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.setTextColor(25, 118, 210);
    doc.text("Human Resource Management System", 105, 14, { align: "center" });

    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text("Organisation Attendance Report", 105, 22, { align: "center" });
    doc.line(10, 27, 200, 27);

    doc.setFontSize(11);
    doc.text(`Generated On: ${new Date().toLocaleString()}`, 14, 35);
    doc.text(`Total Records: ${filtered.length}  |  Present: ${stats.present}  |  Late: ${stats.late}  |  Half Day: ${stats.halfDay}  |  Early Checkout: ${stats.early}`, 14, 43);

    const rows = filtered.map((r) => [
      r.employee?.name || "—",
      r.employee?.role || "—",
      r.employee?.department || "—",
      fmtDate(r.date),
      r.status || "—",
      fmtTime(r.checkIn),
      fmtTime(r.checkOut),
      fmtHours(r.workingHours),
    ]);

    autoTable(doc, {
      head: [["Employee", "Role", "Department", "Date", "Status", "Check In", "Check Out", "Working Hrs"]],
      body: rows,
      startY: 50,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [25, 118, 210] },
    });

    doc.save("Attendance_Report.pdf");
  };

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="admin-attendance-monitor">

      {/* Stats Row */}
      <div className="admin-att-stats-row">
        {[
          { label: "Total Records", value: stats.total, color: "var(--primary-600)" },
          { label: "Present", value: stats.present, color: "var(--success)" },
          { label: "Late", value: stats.late, color: "#f59e0b" },
          { label: "Half Day", value: stats.halfDay, color: "#8b5cf6" },
          { label: "Early Checkout", value: stats.early, color: "#ef4444" },
        ].map((s) => (
          <div key={s.label} className="admin-att-stat-card">
            <span className="admin-att-stat-value" style={{ color: s.color }}>{s.value}</span>
            <span className="admin-att-stat-label">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="admin-att-toolbar">
        <div className="admin-att-search-wrap">

          <input
            id="admin-att-search"
            type="text"
            className="admin-att-search"
            placeholder="🔍 Search by employee, role, department…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="admin-att-filter-wrap">
          <FiFilter size={14} />
          <select
            id="admin-att-status-filter"
            className="admin-att-filter-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="Present">Present</option>
            <option value="Late">Late</option>
            <option value="Half Day">Half Day</option>
            <option value="Early Checkout">Early Checkout</option>
          </select>
        </div>

        <button
          id="admin-att-refresh-btn"
          className="btn-secondary admin-att-action-btn"
          onClick={onRefresh}
          disabled={loading}
          title="Refresh"
        >
          <FiRefreshCw size={15} className={loading ? "spinning" : ""} />
          {loading ? "Loading…" : "Refresh"}
        </button>

        <button
          id="admin-att-export-btn"
          className="btn-primary admin-att-action-btn"
          onClick={handleExportPDF}
          disabled={filtered.length === 0 || loading}
          title="Download PDF Report"
        >
          <FiDownload size={15} />
          Export PDF
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="att-status-msg att-error">
          <FiAlertCircle size={15} /> {error}
        </div>
      )}

      {/* Table */}
      <div className="admin-att-table-container">
        {loading ? (
          <div className="att-loading-state">
            <div className="att-spinner" />
            <p>Loading attendance records…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="att-empty-state">
            <FiUsers size={40} />
            <h3>No attendance records found</h3>
            <p>
              {search || filterStatus
                ? "Try adjusting your search or filter criteria."
                : "No attendance data is available yet."}
            </p>
          </div>
        ) : (
          <div className="admin-att-table-scroll">
            <table className="admin-att-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Role</th>
                  <th>Department</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Working Hrs</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r._id}>
                    <td>
                      <div className="att-emp-cell">
                        <span className="att-emp-name">{r.employee?.name || "—"}</span>
                        <span className="att-emp-email">{r.employee?.email || "—"}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`att-role-badge att-role-${(r.employee?.role || "").toLowerCase()}`}>
                        {r.employee?.role || "—"}
                      </span>
                    </td>
                    <td>{r.employee?.department || "—"}</td>
                    <td>{fmtDate(r.date)}</td>
                    <td><StatusBadge status={r.status} /></td>
                    <td>{fmtTime(r.checkIn)}</td>
                    <td>{fmtTime(r.checkOut)}</td>
                    <td>{fmtHours(r.workingHours)}</td>
                    <td className="att-remarks">{r.remarks || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="admin-att-count">
        Showing <strong>{filtered.length}</strong> of <strong>{records.length}</strong> records
      </p>
    </div>
  );
}
