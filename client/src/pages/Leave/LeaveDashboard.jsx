import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";

import AdminLeaveManagement from "./AdminLeaveManagement";
import ApplyLeave           from "./ApplyLeave";
import LeaveHistory         from "./LeaveHistory";
import LeaveApproval        from "./LeaveApproval";
import LeaveCalendar        from "./LeaveCalendar";
import LeaveBalance         from "./LeaveBalance";

import { getLeaveHistory, getAdminAllLeaves } from "../../services/leaveService";
import "./LeaveDashboard.css";

export default function LeaveDashboard() {
  const { user } = useAuth();
  const role     = user?.role || "";
  const userId   = user?.id || user?._id || "";

  const isAdmin    = role === "Admin";
  const isHR       = role === "HR";
  const isEmployee = role === "Employee";

  // For Admin: all leaves for management
  const [adminLeaves, setAdminLeaves] = useState([]);
  const [adminLoading, setAdminLoading] = useState(false);

  // For Employee/HR: only own leaves
  const [ownLeaves, setOwnLeaves] = useState([]);
  const [ownLoading, setOwnLoading] = useState(false);

  // ── Admin: fetch all leaves for management ──────────────────────────────
  const fetchAdminLeaves = useCallback(async () => {
    setAdminLoading(true);
    try {
      const response = await getAdminAllLeaves();
      setAdminLeaves(response.leaves || []);
    } catch (error) {
      console.error("Failed to fetch admin leaves:", error);
      setAdminLeaves([]);
    } finally {
      setAdminLoading(false);
    }
  }, []);

  // ── Employee/HR: fetch only own leaves ──────────────────────────────────
  const fetchOwnLeaves = useCallback(async () => {
    setOwnLoading(true);
    try {
      const response = await getLeaveHistory();
      setOwnLeaves(response.leaves || []);
    } catch (error) {
      console.error("Failed to fetch own leave history:", error);
      setOwnLeaves([]);
    } finally {
      setOwnLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchAdminLeaves();
    } else {
      fetchOwnLeaves();
    }
  }, [isAdmin, fetchAdminLeaves, fetchOwnLeaves]);

  // For HR: filter out own leaves to show only others' for approval section
  const othersLeaves = ownLeaves; // ownLeaves is already HR's own — for approval, HR needs all leaves minus own
  // HR approval section needs all leaves (not just own), so we also fetch admin view for HR
  const [hrAllLeaves, setHrAllLeaves] = useState([]);

  const fetchHRAllLeaves = useCallback(async () => {
    if (!isHR) return;
    try {
      const response = await getAdminAllLeaves();
      setHrAllLeaves(response.leaves || []);
    } catch (error) {
      console.error("Failed to fetch HR all leaves:", error);
    }
  }, [isHR]);

  useEffect(() => {
    if (isHR) fetchHRAllLeaves();
  }, [isHR, fetchHRAllLeaves]);

  // HR's approval section: other people's leaves (not HR's own)
  const hrOthersLeaves = hrAllLeaves.filter((l) => {
    const empId = l.employee?._id || l.employee;
    return String(empId) !== String(userId);
  });

  // ─────────────────────────────────────────────────────────────────────────
  // ADMIN VIEW — management only, no personal history
  // ─────────────────────────────────────────────────────────────────────────
  if (isAdmin) {
    return (
      <div className="leave-page">
        <div className="page-header">
          <div className="page-title-box">
            <h1 className="page-title">Leave Management</h1>
            <p className="page-subtitle">
              Review employee and HR leave requests. Approve or reject pending applications.
            </p>
          </div>
        </div>

        <div className="leave-section-card">
          {adminLoading ? (
            <div className="leave-loading-state">
              <div className="leave-spinner" />
              <p>Loading leave requests…</p>
            </div>
          ) : (
            <AdminLeaveManagement
              leaves={adminLeaves}
              refreshLeaves={fetchAdminLeaves}
            />
          )}
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // HR VIEW — own leaves + approval section for others
  // ─────────────────────────────────────────────────────────────────────────
  if (isHR) {
    return (
      <div className="leave-page">
        <div className="page-header">
          <div className="page-title-box">
            <h1 className="page-title">Leave Management</h1>
            <p className="page-subtitle">
              Apply for time off, manage your leave balance, and review team leave requests.
            </p>
          </div>
        </div>

        {/* HR personal leave balance */}
        <LeaveBalance />

        {/* Apply for leave */}
        <div className="leave-section-card">
          <ApplyLeave refreshLeaves={fetchOwnLeaves} />
        </div>

        {/* HR's own leave history */}
        <div className="leave-section-card">
          <LeaveHistory
            leaves={ownLeaves}
            refreshLeaves={fetchOwnLeaves}
            currentUserId={userId}
          />
        </div>

        {/* HR approval section — shows other employees' Pending requests */}
        {hrOthersLeaves.some((l) => l.status === "Pending") && (
          <div className="leave-section-card">
            <LeaveApproval
              leaves={hrOthersLeaves}
              refreshLeaves={() => { fetchOwnLeaves(); fetchHRAllLeaves(); }}
              currentUserId={userId}
            />
          </div>
        )}

        {/* HR's own calendar — approved leaves only */}
        <div className="leave-section-card">
          <LeaveCalendar leaves={ownLeaves} />
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // EMPLOYEE VIEW (default)
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="leave-page">
      <div className="page-header">
        <div className="page-title-box">
          <h1 className="page-title">Leave Management</h1>
          <p className="page-subtitle">
            Apply for time off, track your leave balance, and view your leave history.
          </p>
        </div>
      </div>

      {/* Leave balance */}
      <LeaveBalance />

      {/* Apply for leave */}
      <div className="leave-section-card">
        <ApplyLeave refreshLeaves={fetchOwnLeaves} />
      </div>

      {/* Own leave history with Cancel on own Pending */}
      <div className="leave-section-card">
        <LeaveHistory
          leaves={ownLeaves}
          refreshLeaves={fetchOwnLeaves}
          currentUserId={userId}
        />
      </div>

      {/* Own leave calendar — approved leaves only */}
      <div className="leave-section-card">
        <LeaveCalendar leaves={ownLeaves} />
      </div>
    </div>
  );
}