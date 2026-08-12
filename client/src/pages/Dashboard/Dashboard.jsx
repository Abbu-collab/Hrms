import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import { normalizeRole } from '../../utils/permission.js';

// Import existing API service functions
import { getAllEmployees } from '../../services/employeeService.js';
import { getDepartments } from '../../services/departmentService.js';
import { getTodayAttendance, getAttendanceHistory } from '../../services/attendanceService.js';
import { getLeaveHistory, getAdminAllLeaves } from '../../services/leaveService.js';

// Import reusable components
import Button from '../../components/Button/Button.jsx';
import Card from '../../components/Card/Card.jsx';
import Table from '../../components/Table/Table.jsx';
import Modal from '../../components/Modal/Modal.jsx';
import Loader from '../../components/Loader/Loader.jsx';
import './Dashboard.css';

// Helper to format time string/date cleanly (e.g. 09:08 AM)
function formatTime(dateVal) {
  if (!dateVal) return '-';
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  } catch (e) {
    return '-';
  }
}

// Helper to format working hours decimal to hours & minutes
function formatWorkingHours(hours) {
  if (hours === undefined || hours === null || hours === '') return '-';
  const num = Number(hours);
  if (isNaN(num) || num <= 0) return '-';
  const totalMins = Math.round(num * 60);
  const hrs = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  return `${hrs} hrs ${mins} mins`;
}

function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // ── Normalized Role flags ───────────────────────────────────────────────────
  const normRole   = normalizeRole(user?.role);
  const isAdmin    = normRole === 'admin';
  const isHR       = normRole === 'hr_manager';
  const isEmployee = normRole === 'employee';
  const isAdminOrHR = isAdmin || isHR;

  // Loading & Error States
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState('');

  // Real Data States — org-wide (Admin/HR)
  const [employees, setEmployees] = useState([]);
  const [employeeCount, setEmployeeCount] = useState(0);
  const [departments, setDepartments] = useState([]);
  const [departmentCount, setDepartmentCount] = useState(0);
  const [adminLeaves, setAdminLeaves] = useState([]);
  const [employeesOnLeaveCount, setEmployeesOnLeaveCount] = useState(0);

  // Real Data States — personal (all roles)
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [pendingLeaveCount, setPendingLeaveCount] = useState(0);

  const [isAnnounceModalOpen, setIsAnnounceModalOpen] = useState(false);

  const handleProfile = () => { navigate('/profile'); };

  // Quick Navigation handlers
  const handleNavDirectory  = () => navigate('/directory');
  const handleNavAttendance = () => navigate('/attendance-dashboard');
  const handleNavLeave      = () => navigate('/leave');
  const handleNavPayroll    = () => navigate('/payroll');
  const handleNavReports    = () => navigate('/reports');
  const handleNavSettings   = () => navigate('/settings');

  // Create department map for mapping employee.departmentId -> Department Name
  const departmentMap = useMemo(() => {
    const map = {};
    if (Array.isArray(departments)) {
      departments.forEach((d) => {
        const id   = d._id || d.id;
        const name = d.departmentName || d.name || d.department_name;
        if (id && name) map[id] = name;
      });
    }
    return map;
  }, [departments]);

  // ── Fetch real data from existing backend APIs ───────────────────────────────
  useEffect(() => {
    let isMounted = true;

    async function fetchDashboardData() {
      setLoading(true);
      setApiError('');

      try {
        // ── Org-wide data — only load for Admin / HR ──────────────────────
        if (isAdminOrHR) {
          try {
            const deptRes = await getDepartments();
            if (isMounted) {
              const deptList = Array.isArray(deptRes)
                ? deptRes
                : deptRes?.departments || deptRes?.data || [];
              setDepartments(deptList);
              setDepartmentCount(deptList.length);
            }
          } catch (err) {
            console.warn('Departments API warning:', err.message);
          }

          try {
            const empRes = await getAllEmployees({ limit: 100 });
            if (isMounted) {
              const empList = Array.isArray(empRes)
                ? empRes
                : empRes?.employees || empRes?.data || [];
              const count = empRes?.totalCount || empRes?.totalEmployees || empRes?.total || empList.length;
              setEmployees(empList);
              setEmployeeCount(count || 0);
            }
          } catch (err) {
            console.warn('Employees API warning:', err.message);
          }

          try {
            const allLeavesRes = await getAdminAllLeaves();
            if (isMounted) {
              const allLeavesList = Array.isArray(allLeavesRes)
                ? allLeavesRes
                : allLeavesRes?.leaves || allLeavesRes?.data || [];
              setAdminLeaves(allLeavesList);
              const pending = allLeavesList.filter(
                (l) => l.status?.toLowerCase() === 'pending'
              ).length;
              setPendingLeaveCount(pending);

              // Calculate employees currently on approved leave
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const onLeave = allLeavesList.filter((l) => {
                if (l.status?.toLowerCase() !== 'approved') return false;
                const start = l.startDate ? new Date(l.startDate) : null;
                const end = l.endDate ? new Date(l.endDate) : null;
                if (!start || !end) return false;
                start.setHours(0, 0, 0, 0);
                end.setHours(23, 59, 59, 999);
                return today >= start && today <= end;
              }).length;
              setEmployeesOnLeaveCount(onLeave);
            }
          } catch (err) {
            console.warn('Admin leaves API warning:', err.message);
          }
        }

        // ── Personal attendance — all roles ───────────────────────────────
        try {
          const attToday = await getTodayAttendance();
          const attHist  = await getAttendanceHistory();
          if (isMounted) {
            const todayData = attToday?.attendance || attToday?.data || attToday;
            setTodayAttendance(
              todayData && (todayData._id || todayData.checkIn || todayData.checkInTime || todayData.status)
                ? todayData
                : null
            );
            const histList = Array.isArray(attHist)
              ? attHist
              : attHist?.history || attHist?.attendance || attHist?.data || [];
            setAttendanceHistory(histList);
          }
        } catch (err) {
          console.warn('Attendance API warning:', err.message);
        }

        // ── Personal leave data — for Employee role ───────────────────────
        if (isEmployee) {
          try {
            const leaveRes = await getLeaveHistory();
            if (isMounted) {
              const leaveList = Array.isArray(leaveRes)
                ? leaveRes
                : leaveRes?.history || leaveRes?.leaves || leaveRes?.data || [];
              setLeaveHistory(leaveList);
              const pending = leaveList.filter(
                (l) => l.status?.toLowerCase() === 'pending'
              ).length;
              setPendingLeaveCount(pending);
            }
          } catch (err) {
            console.warn('Leave API warning:', err.message);
          }
        }

      } catch (err) {
        if (isMounted) setApiError(err.message || 'Error loading dashboard data');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchDashboardData();
    return () => { isMounted = false; };
  }, [isAdminOrHR, isEmployee]);

  // Columns for Workforce Directory Overview Table (Admin/HR)
  const employeeColumns = [
    {
      key: 'name',
      header: 'Employee Name',
      width: '38%',
      render: (row) => {
        const empName =
          row.user_id?.name ||
          row.name ||
          (row.firstName ? `${row.firstName} ${row.lastName || ''}`.trim() : null) ||
          '-';
        const empEmail = row.user_id?.email || row.email || '-';
        const initials = empName !== '-' ? empName.slice(0, 2).toUpperCase() : 'E';
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="activity-avatar" style={{ width: '32px', height: '32px', fontSize: '12px' }}>
              {initials}
            </div>
            <div style={{ minWidth: 0 }}>
              <strong style={{ display: 'block', fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{empName}</strong>
              <span style={{ fontSize: '11px', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>{empEmail}</span>
            </div>
          </div>
        );
      }
    },
    {
      key: 'department',
      header: 'Department',
      width: '22%',
      render: (row) => {
        const deptObj = row.department_id || row.department;
        if (typeof deptObj === 'object' && deptObj !== null) {
          return deptObj.departmentName || deptObj.name || deptObj.department_name || '-';
        }
        const deptId = row.department_id || row.departmentId || row.department;
        return departmentMap[deptId] || (typeof deptId === 'string' && !deptId.startsWith('6') ? deptId : '-');
      }
    },
    {
      key: 'role',
      header: 'Role',
      width: '22%',
      render: (row) => {
        const roleObj = row.role_id || row.role;
        if (typeof roleObj === 'object' && roleObj !== null) {
          return roleObj.roleName || roleObj.name || '-';
        }
        return row.designation || row.role || row.user_id?.role || '-';
      }
    },
    {
      key: 'status',
      header: 'Status',
      width: '18%',
      render: (row) => {
        const st = row.employment_status || row.status || 'Active';
        const isActive = st.toLowerCase() === 'active';
        return (
          <span className={`status-badge ${isActive ? 'status-badge-active' : 'status-badge-leave'}`}>
            ● {st}
          </span>
        );
      }
    }
  ];

  const checkInTimeStr  = formatTime(todayAttendance?.checkIn || todayAttendance?.checkInTime);
  const checkOutTimeStr = formatTime(todayAttendance?.checkOut || todayAttendance?.checkOutTime);
  const workingHoursStr = formatWorkingHours(todayAttendance?.workingHours);

  return (
    <div className="dashboard-page">
      {apiError && (
        <div className="notification-item notification-item-warning" style={{ marginBottom: '20px' }}>
          <div className="notification-content">
            <p>⚠️ System Notice</p>
            <span>{apiError}</span>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          1. STATISTICS SUMMARY GRID
          HR Manager: Today's Attendance, Pending Leaves, Total Employees, Employees On Leave
          Admin: Total Employees, Today's Attendance, Pending Leaves, Total Departments
          Employee: Today's Attendance, My Pending Leaves
         ══════════════════════════════════════════════════════════════════════ */}
      <div className={`stats-grid ${isEmployee ? 'stats-grid--employee' : ''}`}>

        {/* ── Admin Top Stat Card 1: Total Employees ── */}
        {isAdmin && (
          <div className="stat-card-custom">
            <div className="stat-icon-wrapper stat-icon-blue">👥</div>
            <div className="stat-details">
              <p>Total Employees</p>
              {loading ? (
                <Loader.Spinner size="sm" />
              ) : (
                <h2>{employeeCount}</h2>
              )}
              <span className="stat-trend stat-trend-up">
                ✓ {employees.length} records loaded
              </span>
            </div>
          </div>
        )}

        {/* ── HR Manager Top Stat Card 1 & Admin/Employee: Today's Attendance ── */}
        <div className="stat-card-custom">
          <div className="stat-icon-wrapper stat-icon-green">🕒</div>
          <div className="stat-details">
            <p>Today's Attendance</p>
            {loading ? (
              <Loader.Spinner size="sm" />
            ) : todayAttendance ? (
              <h2 style={{ fontSize: '20px' }}>
                {todayAttendance.status || 'Present'}
              </h2>
            ) : (
              <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>
                Not recorded
              </span>
            )}
            <span className="stat-trend stat-trend-up">
              {todayAttendance ? `Check In: ${checkInTimeStr}` : 'Real-time Log'}
            </span>
          </div>
        </div>

        {/* ── Pending Leave Requests / My Pending Leaves ── */}
        <div className="stat-card-custom">
          <div className="stat-icon-wrapper stat-icon-amber">🏖️</div>
          <div className="stat-details">
            <p>{isEmployee ? 'My Pending Leaves' : 'Pending Leave Requests'}</p>
            {loading ? (
              <Loader.Spinner size="sm" />
            ) : (
              <h2>{pendingLeaveCount}</h2>
            )}
            <span className="stat-trend stat-trend-neutral">
              {isEmployee
                ? `${leaveHistory.length} total application${leaveHistory.length !== 1 ? 's' : ''}`
                : `${adminLeaves.length} total application${adminLeaves.length !== 1 ? 's' : ''}`}
            </span>
          </div>
        </div>

        {/* ── HR Manager Card 3: Total Employees ── */}
        {isHR && (
          <div className="stat-card-custom">
            <div className="stat-icon-wrapper stat-icon-blue">👥</div>
            <div className="stat-details">
              <p>Total Employees</p>
              {loading ? (
                <Loader.Spinner size="sm" />
              ) : (
                <h2>{employeeCount}</h2>
              )}
              <span className="stat-trend stat-trend-up">
                ✓ {employees.length} records loaded
              </span>
            </div>
          </div>
        )}

        {/* ── HR Manager Card 4: Employees On Leave ── */}
        {isHR && (
          <div className="stat-card-custom">
            <div className="stat-icon-wrapper stat-icon-purple">🌴</div>
            <div className="stat-details">
              <p>Employees On Leave</p>
              {loading ? (
                <Loader.Spinner size="sm" />
              ) : (
                <h2>{employeesOnLeaveCount}</h2>
              )}
              <span className="stat-trend stat-trend-neutral">
                Approved active leave
              </span>
            </div>
          </div>
        )}

        {/* ── Admin Card 4: Total Departments ── */}
        {isAdmin && (
          <div className="stat-card-custom">
            <div className="stat-icon-wrapper stat-icon-purple">🏢</div>
            <div className="stat-details">
              <p>Total Departments</p>
              {loading ? (
                <Loader.Spinner size="sm" />
              ) : (
                <h2>{departmentCount}</h2>
              )}
              <span className="stat-trend stat-trend-up">
                ✓ {departments.length} active units
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          2. MAIN DASHBOARD CONTENT GRID
          ══════════════════════════════════════════════════════════════════════ */}
      <div className="dashboard-grid">

        {/* ── Left Column ────────────────────────────────────────────────────── */}
        <div className="dashboard-main-column">

          {/* Quick Actions — filtered per role */}
          <Card
            title={isEmployee ? '⚡ Quick Actions' : '⚡ Quick HR Actions'}
            subtitle={isEmployee ? 'Fast access to your workspace' : 'Fast access to essential workforce modules'}
          >
            <div className={`quick-actions-grid ${isEmployee ? 'quick-actions-grid--employee' : ''}`}>

              {/* Directory — Admin & HR Manager */}
              {isAdminOrHR && (
                <button type="button" className="quick-action-item" onClick={handleNavDirectory}>
                  <span className="quick-action-icon">📁</span>
                  <span className="quick-action-text">
                    <span className="quick-action-title">Directory</span>
                    <span className="quick-action-desc">View/manage employees</span>
                  </span>
                </button>
              )}

              {/* Attendance — all roles */}
              <button type="button" className="quick-action-item" onClick={handleNavAttendance}>
                <span className="quick-action-icon">⏰</span>
                <span className="quick-action-text">
                  <span className="quick-action-title">Attendance</span>
                  <span className="quick-action-desc">
                    {isEmployee ? 'My check-in & history' : 'Check attendance & history'}
                  </span>
                </span>
              </button>

              {/* Leave — all roles */}
              <button type="button" className="quick-action-item" onClick={handleNavLeave}>
                <span className="quick-action-icon">📅</span>
                <span className="quick-action-text">
                  <span className="quick-action-title">
                    {isEmployee ? 'My Leave' : 'Leave Management'}
                  </span>
                  <span className="quick-action-desc">
                    {isEmployee ? 'Apply & track leave' : 'Review/approve leave requests'}
                  </span>
                </span>
              </button>

              {/* Payroll — Admin & HR Manager ONLY — Employee must NOT see this */}
              {isAdminOrHR && (
                <button type="button" className="quick-action-item" onClick={handleNavPayroll}>
                  <span className="quick-action-icon">💰</span>
                  <span className="quick-action-text">
                    <span className="quick-action-title">Payroll</span>
                    <span className="quick-action-desc">View/manage salary info</span>
                  </span>
                </button>
              )}

              {/* Reports — Admin & HR Manager */}
              {isAdminOrHR && (
                <button type="button" className="quick-action-item" onClick={handleNavReports}>
                  <span className="quick-action-icon">📊</span>
                  <span className="quick-action-text">
                    <span className="quick-action-title">Reports</span>
                    <span className="quick-action-desc">HR analytics/reports</span>
                  </span>
                </button>
              )}

              {/* Settings / Profile — all roles */}
              <button type="button" className="quick-action-item" onClick={isEmployee ? handleProfile : handleNavSettings}>
                <span className="quick-action-icon">⚙️</span>
                <span className="quick-action-text">
                  <span className="quick-action-title">
                    {isEmployee ? 'My Profile' : 'Settings'}
                  </span>
                  <span className="quick-action-desc">{isEmployee ? 'Account details' : 'Account settings'}</span>
                </span>
              </button>

            </div>
          </Card>

          {/* Workforce Directory Table — Admin & HR Manager */}
          {isAdminOrHR && (
            <Card
              title="📁 Real Workforce Directory"
              subtitle="Live employee data from backend API"
              action={
                <Button variant="outline" size="sm" onClick={handleNavDirectory}>
                  Manage Directory
                </Button>
              }
            >
              <Table
                columns={employeeColumns}
                data={employees}
                loading={loading}
                emptyText="No employee records found in system database."
                maxHeight="380px"
              />
            </Card>
          )}

          {/* My Attendance History — Employee only */}
          {isEmployee && (
            <Card title="📆 My Attendance History" subtitle="Your recent attendance records">
              {loading ? (
                <Loader.Skeleton rows={3} />
              ) : attendanceHistory.length === 0 ? (
                <div className="hrms-table-empty" style={{ padding: '24px 16px' }}>
                  <span style={{ fontSize: '2rem' }}>🕒</span>
                  <span className="hrms-table-empty-text" style={{ fontWeight: 600, color: '#475569' }}>
                    No attendance history found.
                  </span>
                </div>
              ) : (
                <div className="activity-list">
                  {attendanceHistory.slice(0, 5).map((item, idx) => {
                    const dateStr = item.date
                      ? new Date(item.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                      : '-';
                    return (
                      <div key={item._id || idx} className="activity-item">
                        <div className="activity-avatar" style={{ background: '#ecfdf5', color: '#047857' }}>
                          📅
                        </div>
                        <div className="activity-details">
                          <strong>{dateStr}</strong>
                          <p>
                            In: {formatTime(item.checkIn || item.checkInTime)} &nbsp;|&nbsp;
                            Out: {formatTime(item.checkOut || item.checkOutTime)}
                          </p>
                        </div>
                        <span className="activity-time">
                          <span className={`status-badge ${item.status?.toLowerCase() === 'present' ? 'status-badge-active' : 'status-badge-leave'}`}>
                            {item.status || 'Present'}
                          </span>
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          )}
        </div>

        {/* ── Right Column ───────────────────────────────────────────────────── */}
        <div className="dashboard-side-column">

          {/* Today's Attendance Card — all roles */}
          <Card title="⏰ Today's Attendance" subtitle="Real-time check-in status">
            {loading ? (
              <Loader.Skeleton rows={3} />
            ) : !todayAttendance ? (
              <div className="hrms-table-empty" style={{ padding: '24px 16px' }}>
                <span style={{ fontSize: '2rem' }}>🕒</span>
                <span className="hrms-table-empty-text" style={{ fontWeight: 600, color: '#475569' }}>
                  No attendance recorded today
                </span>
              </div>
            ) : (
              <div className="activity-list">
                <div className="activity-item">
                  <div className="activity-details">
                    <strong>Check In Time</strong>
                    <p style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>
                      {checkInTimeStr}
                    </p>
                  </div>
                </div>

                <div className="activity-item">
                  <div className="activity-details">
                    <strong>Check Out Time</strong>
                    <p style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>
                      {checkOutTimeStr}
                    </p>
                  </div>
                </div>

                <div className="activity-item">
                  <div className="activity-details">
                    <strong>Status</strong>
                    <p>
                      <span className="status-badge status-badge-active">
                        ● {todayAttendance.status || 'Present'}
                      </span>
                    </p>
                  </div>
                </div>

                {workingHoursStr !== '-' && (
                  <div className="activity-item">
                    <div className="activity-details">
                      <strong>Working Hours</strong>
                      <p style={{ fontSize: '13px', fontWeight: '600', color: '#334155' }}>
                        {workingHoursStr}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Leave Applications Card */}
          <Card
            title={isEmployee ? '📅 My Leave Applications' : '📅 Leave Applications'}
            subtitle={isEmployee ? 'Your personal leave history' : 'Leave applications for HR review'}
          >
            {loading ? (
              <Loader.Skeleton rows={3} />
            ) : (isEmployee ? leaveHistory : adminLeaves).length === 0 ? (
              <div className="hrms-table-empty" style={{ padding: '20px' }}>
                <span style={{ fontSize: '1.5rem' }}>📑</span>
                <span className="hrms-table-empty-text">No leave records found.</span>
              </div>
            ) : (
              <div className="activity-list">
                {(isEmployee ? leaveHistory : adminLeaves).slice(0, 4).map((item, idx) => {
                  const empName = item.employee?.name || item.employeeName || (isEmployee ? 'My Leave' : 'Employee');
                  return (
                    <div key={item._id || item.id || idx} className="activity-item">
                      <div className="activity-avatar">
                        {(item.leaveType || item.type || 'L').charAt(0).toUpperCase()}
                      </div>
                      <div className="activity-details">
                        <strong>{item.leaveType || item.type || 'Leave Request'}</strong>
                        <p>
                          {isAdminOrHR && <span style={{ fontWeight: 600, color: '#3b82f6' }}>{empName} — </span>}
                          {item.reason || item.description || `Status: ${item.status || 'Pending'}`}
                        </p>
                      </div>
                      <span className="activity-time">
                        <span className={`status-badge ${item.status?.toLowerCase() === 'approved' ? 'status-badge-active' : 'status-badge-leave'}`}>
                          {item.status || 'Pending'}
                        </span>
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Info Modal */}
      <Modal
        isOpen={isAnnounceModalOpen}
        onClose={() => setIsAnnounceModalOpen(false)}
        title="ℹ️ System Information"
        size="md"
        footer={
          <Button variant="primary" size="sm" onClick={() => setIsAnnounceModalOpen(false)}>
            Close
          </Button>
        }
      >
        <div>
          <h4>HRMS Backend Integration</h4>
          <p>This dashboard displays real-time backend API data.</p>
        </div>
      </Modal>
    </div>
  );
}

export default Dashboard;
