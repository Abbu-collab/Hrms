import { useState, useMemo } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { approveLeave, rejectLeave } from "../../services/leaveService";
import {
  FiCheckCircle, FiXCircle, FiAlertCircle, FiInbox,
  FiCalendar, FiBriefcase, FiUser, FiMail, FiClock,
  FiDownload, FiSearch,
} from "react-icons/fi";
import "./AdminLeaveManagement.css";

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", {
        day: "2-digit", month: "short", year: "numeric",
      })
    : "—";

const calcDays = (start, end) => {
  if (!start || !end) return "—";
  const ms = new Date(end) - new Date(start);
  const days = Math.max(1, Math.round(ms / (1000 * 60 * 60 * 24)) + 1);
  return `${days} day${days !== 1 ? "s" : ""}`;
};

const TAB_OPTIONS = [
  { key: "Pending",  label: "Pending Requests" },
  { key: "Approved", label: "Approved Leaves" },
  { key: "Rejected", label: "Rejected Applications" },
];

const STATUS_BADGE_MAP = {
  Pending:  "alm-badge alm-badge-pending",
  Approved: "alm-badge alm-badge-approved",
  Rejected: "alm-badge alm-badge-rejected",
};

export default function AdminLeaveManagement({ leaves = [], refreshLeaves }) {
  const [activeTab, setActiveTab]   = useState("Pending");
  const [search, setSearch]         = useState("");
  const [processing, setProcessing] = useState({});
  const [messages, setMessages]     = useState({});

  const setMsg = (id, type, text) =>
    setMessages((p) => ({ ...p, [id]: { type, text } }));

  // ── Approve ────────────────────────────────────────────────────────────────
  const handleApprove = async (id) => {
    setProcessing((p) => ({ ...p, [id]: "approving" }));
    setMsg(id, "", "");
    try {
      await approveLeave(id);
      setMsg(id, "success", "Leave approved successfully.");
      if (refreshLeaves) refreshLeaves();
    } catch (err) {
      setMsg(id, "error", err.response?.data?.message || err.message || "Approval failed.");
    } finally {
      setProcessing((p) => ({ ...p, [id]: null }));
    }
  };

  // ── Reject ─────────────────────────────────────────────────────────────────
  const handleReject = async (id) => {
    setProcessing((p) => ({ ...p, [id]: "rejecting" }));
    setMsg(id, "", "");
    try {
      await rejectLeave(id);
      setMsg(id, "success", "Leave rejected.");
      if (refreshLeaves) refreshLeaves();
    } catch (err) {
      setMsg(id, "error", err.response?.data?.message || err.message || "Rejection failed.");
    } finally {
      setProcessing((p) => ({ ...p, [id]: null }));
    }
  };

  // ── Stats ──────────────────────────────────────────────────────────────────
  const tabCounts = useMemo(
    () => ({
      Pending:  leaves.filter((l) => l.status === "Pending").length,
      Approved: leaves.filter((l) => l.status === "Approved").length,
      Rejected: leaves.filter((l) => l.status === "Rejected").length,
    }),
    [leaves]
  );

  // ── Filtered list ──────────────────────────────────────────────────────────
  const displayed = useMemo(() => {
    let list = leaves.filter((l) => l.status === activeTab);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (l) =>
          l.employee?.name?.toLowerCase().includes(q) ||
          l.employee?.email?.toLowerCase().includes(q) ||
          l.employee?.role?.toLowerCase().includes(q) ||
          l.leaveType?.toLowerCase().includes(q) ||
          l.reason?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [leaves, activeTab, search]);

  // ── PDF Export ─────────────────────────────────────────────────────────────
  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.setTextColor(25, 118, 210);
    doc.text("Human Resource Management System", 105, 14, { align: "center" });
    doc.setFontSize(13);
    doc.setTextColor(0, 0, 0);
    doc.text("Leave Applications Report", 105, 22, { align: "center" });
    doc.line(10, 26, 200, 26);
    doc.setFontSize(10);
    doc.text(`Generated On: ${new Date().toLocaleString()}`, 14, 33);
    doc.text(
      `Total: ${leaves.length}  |  Pending: ${tabCounts.Pending}  |  Approved: ${tabCounts.Approved}  |  Rejected: ${tabCounts.Rejected}`,
      14, 40
    );
    const rows = displayed.map((l) => [
      l.employee?.name || "—",
      l.employee?.role || "—",
      l.leaveType || "—",
      fmtDate(l.startDate),
      fmtDate(l.endDate),
      calcDays(l.startDate, l.endDate),
      l.status || "—",
      l.reason || "—",
    ]);
    autoTable(doc, {
      head: [["Applicant", "Role", "Type", "Start Date", "End Date", "Duration", "Status", "Reason"]],
      body: rows,
      startY: 46,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [25, 118, 210] },
    });
    doc.save(`Leave_Report_${activeTab}.pdf`);
  };

  return (
    <div className="alm-root">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="alm-page-header">
        <div className="alm-page-header-text">
          <h2 className="alm-page-title">Leave Management</h2>
          <p className="alm-page-subtitle">
            Review employee and HR leave requests. Action pending applications.
          </p>
        </div>
        <div className="alm-summary-pills">
          <span className="alm-pill alm-pill-pending">
            <span className="alm-pill-dot" />
            {tabCounts.Pending} Pending
          </span>
          <span className="alm-pill alm-pill-approved">
            <span className="alm-pill-dot" />
            {tabCounts.Approved} Approved
          </span>
          <span className="alm-pill alm-pill-rejected">
            <span className="alm-pill-dot" />
            {tabCounts.Rejected} Rejected
          </span>
        </div>
      </div>

      {/* ── Toolbar ────────────────────────────────────────────────────── */}
      <div className="alm-toolbar">
        <div className="alm-search-wrap">
          <input
            id="alm-search"
            type="text"
            className="alm-search-input"
            placeholder="🔍 Search by name, email, role or leave type…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search leave requests"
          />
        </div>
        <button
          type="button"
          className="alm-export-btn"
          onClick={handleExportPDF}
          disabled={displayed.length === 0}
        >
          <FiDownload size={14} />
          Export PDF
        </button>
      </div>

      {/* ── Tabs ───────────────────────────────────────────────────────── */}
      <div className="alm-tabs" role="tablist">
        {TAB_OPTIONS.map((tab) => (
          <button
            key={tab.key}
            id={`alm-tab-${tab.key.toLowerCase()}`}
            role="tab"
            aria-selected={activeTab === tab.key}
            className={`alm-tab-btn ${activeTab === tab.key ? "alm-tab-btn--active" : ""}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
            {tabCounts[tab.key] > 0 && (
              <span className="alm-tab-count">{tabCounts[tab.key]}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── Requests ───────────────────────────────────────────────────── */}
      {displayed.length === 0 ? (
        <div className="alm-empty">
          <div className="alm-empty-icon"><FiInbox size={32} /></div>
          <h3>No {activeTab.toLowerCase()} requests</h3>
          <p>
            {search
              ? "No leave requests matched your search criteria."
              : activeTab === "Pending"
              ? "All leave requests have been reviewed."
              : `No ${activeTab.toLowerCase()} leave requests to display.`}
          </p>
        </div>
      ) : (
        <div className="alm-list">
          {displayed.map((leave) => {
            const isApproving = processing[leave._id] === "approving";
            const isRejecting = processing[leave._id] === "rejecting";
            const isBusy      = isApproving || isRejecting;
            const msg         = messages[leave._id];

            return (
              <div key={leave._id} className="alm-row">
                {/* ── Applicant section ── */}
                <div className="alm-row-applicant">
                  <div className="alm-applicant-avatar">
                    {(leave.employee?.name || "?").charAt(0).toUpperCase()}
                  </div>
                  <div className="alm-applicant-info">
                    <span className="alm-applicant-name">
                      {leave.employee?.name || "—"}
                    </span>
                    <span className={`alm-role-badge alm-role-${(leave.employee?.role || "").toLowerCase()}`}>
                      {leave.employee?.role || "—"}
                    </span>
                    {leave.employee?.email && (
                      <span className="alm-applicant-email">
                        <FiMail size={11} /> {leave.employee.email}
                      </span>
                    )}
                  </div>
                </div>

                {/* ── Leave section ── */}
                <div className="alm-row-leave">
                  <div className="alm-leave-type">
                    {leave.leaveType || "—"} Leave
                  </div>
                  <div className="alm-leave-dates">
                    <FiCalendar size={12} />
                    {fmtDate(leave.startDate)} → {fmtDate(leave.endDate)}
                  </div>
                  <div className="alm-leave-duration">
                    <FiClock size={12} />
                    {calcDays(leave.startDate, leave.endDate)}
                  </div>
                </div>

                {/* ── Reason section ── */}
                <div className="alm-row-reason">
                  {leave.reason
                    ? <span className="alm-reason-text">{leave.reason}</span>
                    : <span className="alm-reason-empty">No reason provided</span>
                  }
                </div>

                {/* ── Status + Actions ── */}
                <div className="alm-row-actions">
                  <span className={STATUS_BADGE_MAP[leave.status] || "alm-badge"}>
                    {leave.status}
                  </span>

                  {/* Only show action buttons for Pending status.
                      Admin never sees Cancel for other users. */}
                  {leave.status === "Pending" && (
                    <div className="alm-action-btns">
                      <button
                        id={`alm-approve-${leave._id}`}
                        type="button"
                        className="alm-btn alm-btn-approve"
                        onClick={() => handleApprove(leave._id)}
                        disabled={isBusy}
                      >
                        <FiCheckCircle size={13} />
                        {isApproving ? "Approving…" : "Approve"}
                      </button>
                      <button
                        id={`alm-reject-${leave._id}`}
                        type="button"
                        className="alm-btn alm-btn-reject"
                        onClick={() => handleReject(leave._id)}
                        disabled={isBusy}
                      >
                        <FiXCircle size={13} />
                        {isRejecting ? "Rejecting…" : "Reject"}
                      </button>
                    </div>
                  )}

                  {msg?.text && (
                    <div className={`alm-msg ${msg.type === "success" ? "alm-msg-success" : "alm-msg-error"}`}>
                      {msg.type === "success"
                        ? <FiCheckCircle size={12} />
                        : <FiAlertCircle size={12} />}
                      {msg.text}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
