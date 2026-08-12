import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllEmployees } from '../../services/employeeService';
import { getDepartments } from '../../services/departmentService';
import { getRoles } from '../../services/roleService';
import { normalizeRole } from '../../utils/permission';
import { FiUsers, FiUserCheck, FiShield, FiUserPlus, FiMoreVertical, FiSearch } from 'react-icons/fi';
import './Users.css';

function Users() {
  const navigate = useNavigate();
  const [usersList, setUsersList]       = useState([]);
  const [departments, setDepartments]   = useState([]);
  const [roles, setRoles]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [deptLoading, setDeptLoading]   = useState(true);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [search, setSearch]             = useState('');
  const [deptFilter, setDeptFilter]     = useState('All Departments');
  const [roleFilter, setRoleFilter]     = useState('All Roles');

  // ── Fetch users/employees ────────────────────────────────────────────────
  useEffect(() => {
    const fetchUsersData = async () => {
      setLoading(true);
      try {
        const data = await getAllEmployees({ page: 1, limit: 200 });
        const fetched = data?.employees || data?.data || [];
        if (fetched.length > 0) {
          const formatted = fetched.map((emp, index) => {
            const rawCode = emp.employee_code || emp.employeeCode || emp.employee_id;
            const displayId = rawCode
              ? (rawCode.startsWith('EMP') ? rawCode : `EMP-${rawCode}`)
              : `EMP-${String(index + 1).padStart(4, '0')}`;
            return {
              id: displayId,
              dbId: emp._id || emp.id,
              name: emp.user_id?.name || emp.name || 'User',
              email: emp.user_id?.email || emp.email || '—',
              department: emp.department_id?.departmentName || emp.department || 'General',
              role: emp.user_id?.role || emp.role || 'Employee',
              status: emp.employment_status || emp.status || 'Active',
            };
          });
          setUsersList(formatted);
        }
      } catch (err) {
        console.warn('Could not fetch users:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUsersData();
  }, []);

  // ── Fetch real departments from backend ──────────────────────────────────
  useEffect(() => {
    const fetchDepts = async () => {
      setDeptLoading(true);
      try {
        const data = await getDepartments();
        // Backend returns { departments: [...] } or an array
        const list = Array.isArray(data) ? data : data?.departments || data?.data || [];
        const names = list
          .map((d) => d.departmentName || d.name || d)
          .filter(Boolean)
          .sort((a, b) => a.localeCompare(b));
        setDepartments(names);
      } catch (err) {
        console.warn('Could not load departments:', err.message);
        // Fallback: derive unique departments from already-loaded users
        setDepartments([]);
      } finally {
        setDeptLoading(false);
      }
    };
    fetchDepts();
  }, []);

  // ── Fetch real roles from backend (Roles Management) ────────────────────
  useEffect(() => {
    const fetchRolesData = async () => {
      setRolesLoading(true);
      try {
        const res = await getRoles();
        const list = Array.isArray(res) ? res : res?.data || [];
        const roleNames = list
          .filter((r) => !r.status || r.status === 'Active')
          .map((r) => r.roleName || r.name || r)
          .filter(Boolean);
        setRoles(roleNames);
      } catch (err) {
        console.warn('Could not load roles:', err.message);
        setRoles([]);
      } finally {
        setRolesLoading(false);
      }
    };
    fetchRolesData();
  }, []);

  // ── If API departments are empty, derive from loaded user list ───────────
  const departmentOptions = useMemo(() => {
    if (departments.length > 0) return departments;
    // Derive unique dept names from users as fallback
    const fromUsers = [...new Set(usersList.map((u) => u.department).filter(Boolean))].sort(
      (a, b) => a.localeCompare(b)
    );
    return fromUsers;
  }, [departments, usersList]);

  // ── If API roles are empty, derive from loaded user list ───────────
  const roleOptions = useMemo(() => {
    let list = roles;
    if (list.length === 0) {
      list = [...new Set(usersList.map((u) => u.role).filter(Boolean))];
    }
    // Deduplicate case-insensitively while preserving original casing
    const seen = new Set();
    const result = [];
    for (const r of list) {
      const lower = r.toLowerCase();
      if (!seen.has(lower)) {
        seen.add(lower);
        result.push(r);
      }
    }
    return result.sort((a, b) => a.localeCompare(b));
  }, [roles, usersList]);

  // ── Filtered users ───────────────────────────────────────────────────────
  const filteredUsers = useMemo(() => {
    return usersList.filter((u) => {
      const q = search.toLowerCase();
      const matchesSearch =
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.id.toLowerCase().includes(q);
      const matchesDept =
        deptFilter === 'All Departments' || u.department === deptFilter;
      const matchesRole =
        roleFilter === 'All Roles' || u.role.toLowerCase() === roleFilter.toLowerCase();
      return matchesSearch && matchesDept && matchesRole;
    });
  }, [usersList, search, deptFilter, roleFilter]);

  const totalCount    = usersList.length;
  const activeCount   = usersList.filter((u) => u.status.toLowerCase() === 'active').length;
  const adminHrCount  = usersList.filter((u) => ['admin', 'hr_manager'].includes(normalizeRole(u.role))).length;

  return (
    <div className="users-page">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-title-box">
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">Manage system user accounts, roles, access permissions, and account status.</p>
        </div>
        <div className="page-actions">
          <button className="btn-primary" onClick={() => navigate('/employee/add')}>
            <FiUserPlus size={16} /> Add New User
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="users-stats-grid">
        <div className="user-stat-card">
          <div className="user-stat-icon primary"><FiUsers /></div>
          <div>
            <div className="user-stat-label">Total Accounts</div>
            <div className="user-stat-value">{totalCount}</div>
          </div>
        </div>
        <div className="user-stat-card">
          <div className="user-stat-icon success"><FiUserCheck /></div>
          <div>
            <div className="user-stat-label">Active Users</div>
            <div className="user-stat-value">{activeCount}</div>
          </div>
        </div>
        <div className="user-stat-card">
          <div className="user-stat-icon info"><FiShield /></div>
          <div>
            <div className="user-stat-label">Admin / HR Users</div>
            <div className="user-stat-value">{adminHrCount}</div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="users-toolbar">
        <div className="search-box users-search-input">
          <input
            id="users-search"
            type="text"
            placeholder="Search by name, email, or Employee ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search users"
          />
        </div>

        {/* Real department dropdown */}
        <select
          id="users-dept-filter"
          className="users-filter-select"
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          aria-label="Filter by department"
          disabled={deptLoading && departmentOptions.length === 0}
        >
          <option value="All Departments">All Departments</option>
          {departmentOptions.map((dept) => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </select>

        <select
          id="users-role-filter"
          className="users-filter-select"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          aria-label="Filter by role"
          disabled={rolesLoading && roleOptions.length === 0}
        >
          <option value="All Roles">All Roles</option>
          {roleOptions.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="users-card">
        <div className="users-table-wrapper">
          <table className="users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Employee ID</th>
                <th>Department</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="users-table-placeholder">
                    Loading user accounts…
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="users-table-placeholder">
                    No matching users found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const initials = u.name
                    .split(' ')
                    .map((w) => w[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2);

                  const norm = normalizeRole(u.role);
                  let roleBadgeClass = 'badge-info';
                  if (norm === 'admin') roleBadgeClass = 'badge-success';
                  if (norm === 'hr_manager') roleBadgeClass = 'badge-warning';

                  return (
                    <tr key={u.id}>
                      {/* NAME — avatar + text */}
                      <td>
                        <div className="users-name-cell">
                          <div className="users-avatar">{initials}</div>
                          <span className="users-name-text">{u.name}</span>
                        </div>
                      </td>

                      {/* EMAIL — own column */}
                      <td>
                        <span className="users-email-text">{u.email}</span>
                      </td>

                      {/* EMPLOYEE ID */}
                      <td>
                        <code className="users-emp-id">{u.id}</code>
                      </td>

                      {/* DEPARTMENT */}
                      <td>{u.department}</td>

                      {/* ROLE */}
                      <td>
                        <span className={`badge ${roleBadgeClass}`}>{u.role}</span>
                      </td>

                      {/* STATUS */}
                      <td>
                        <span className={`badge ${u.status.toLowerCase() === 'active' ? 'badge-success' : 'badge-danger'}`}>
                          {u.status}
                        </span>
                      </td>

                      {/* ACTIONS */}
                      <td>
                        <button
                          id={`users-action-${u.id}`}
                          className="action-btn"
                          title="Manage User"
                          onClick={() => navigate('/employee')}
                          aria-label={`Manage ${u.name}`}
                        >
                          <FiMoreVertical size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="table-footer">
          <span>Showing {filteredUsers.length} of {totalCount} users</span>
          <div className="pagination">
            <button disabled>‹</button>
            <button className="active">1</button>
            <button disabled>›</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Users;