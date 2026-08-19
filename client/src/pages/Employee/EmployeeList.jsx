import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import EmployeeTable from "../../components/employee/EmployeeTable.jsx";

import {
  getAllEmployees,
  deleteEmployee,
} from "../../services/employeeService.js";
import { getAllDepartments } from "../../services/profileService.js";
import "../../components/employee/emp.shared.css";
import "./EmployeeList.css";
import {
  FiAlertTriangle,
  FiUserPlus,
  FiUsers,
  FiCheckCircle,
  FiCalendar,
  FiSlash,
  FiLayers,
  FiShield,
} from "react-icons/fi";

import { normalizeRole } from "../../utils/permission.js";

function ConfirmDialog({ employee, onConfirm, onCancel, loading }) {
  const name = employee?.user_id?.name || employee?.name || "this employee";
  return (
    <div className="emp-confirm-overlay" role="dialog" aria-modal="true">
      <div className="emp-confirm-box">
        <div className="emp-confirm-icon">
          <FiAlertTriangle size={28} />
        </div>
        <h3>Delete Employee?</h3>
        <p>
          Are you sure you want to delete <strong>{name}</strong>? This action
          cannot be undone.
        </p>
        <div className="emp-confirm-actions">
          <button
            className="emp-btn-secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="emp-btn-danger"
            onClick={onConfirm}
            disabled={loading}
            id="confirm-delete-btn"
          >
            {loading ? "Deleting..." : "Yes, Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, colorClass }) {
  return (
    <div className="emp-stat-card">
      <div className={`emp-stat-icon ${colorClass}`}>{icon}</div>
      <div className="emp-stat-content">
        <div className="emp-stat-label">{label}</div>
        <div className={`emp-stat-value ${colorClass}`}>
          {typeof value === "number" ? value.toLocaleString() : value}
        </div>
      </div>
    </div>
  );
}

const PAGE_SIZE = 10;

export default function EmployeeList() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const normRole = normalizeRole(user?.role);
  const isAdmin = normRole === "admin";
  const isHR = normRole === "hr_manager";
  const canEdit = isAdmin || isHR;
  const canDelete = isAdmin || isHR;

  const [employees, setEmployees] = useState([]);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [departments, setDepartments] = useState([]);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [deptFilter, setDeptFilter] = useState("All Departments");
  const [currentPage, setCurrentPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState("");

  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    onLeave: 0,
    terminated: 0,
  });

  const searchTimer = useRef(null);

  useEffect(() => {
    getAllDepartments()
      .then((data) => setDepartments(data?.departments || data?.data || (Array.isArray(data) ? data : [])))
      .catch(() => setDepartments([]));
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const [allData, activeData, inactiveData] = await Promise.all([
        getAllEmployees({ page: 1, limit: 1 }),
        getAllEmployees({ status: "Active", page: 1, limit: 1 }),
        getAllEmployees({ status: "Inactive", page: 1, limit: 1 }),
      ]);
      const total = allData?.totalEmployees || 0;
      const active = activeData?.totalEmployees || 0;
      const terminated = inactiveData?.totalEmployees || 0;
      setStats({
        total,
        active,
        onLeave: 0,
        terminated,
      });
    } catch {}
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getAllEmployees({
        search,
        status,
        page: currentPage,
        limit: PAGE_SIZE,
      });

      let emps = data?.employees || [];

      if (deptFilter !== "All Departments") {
        emps = emps.filter(
          (e) =>
            (e.department_id?.departmentName || e.department) === deptFilter,
        );
      }

      setEmployees(emps);
      setTotalEmployees(data?.totalEmployees || emps.length);
      setTotalPages(
        data?.totalPages ||
          Math.ceil((data?.totalEmployees || emps.length) / PAGE_SIZE) ||
          1,
      );
    } catch (err) {
      setError(err.message || "Failed to load employees");
    } finally {
      setLoading(false);
    }
  }, [search, status, deptFilter, currentPage]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleSearch = (val) => {
    setSearch(val);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setCurrentPage(1);
    }, 350);
  };

  const handleStatus = (val) => {
    setStatus(val);
    setCurrentPage(1);
  };

  const handleDept = (dept) => {
    setDeptFilter(dept);
    setCurrentPage(1);
  };

  const { showToast } = useToast();

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteEmployee(deleteTarget._id || deleteTarget.id);
      const msg = `${deleteTarget.user_id?.name || deleteTarget.name || "Employee"} deleted successfully.`;
      setDeleteSuccess(msg);
      showToast('success', msg);
      setDeleteTarget(null);
      await fetchEmployees();
      await fetchStats();
      setTimeout(() => setDeleteSuccess(""), 3500);
    } catch (err) {
      const errMsg = err.message || "Failed to delete employee";
      setError(errMsg);
      showToast('error', errMsg);
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };


  const handleView = (emp) => navigate(`/employee/${emp._id || emp.id}`);
  const handleEdit = (emp) => {
    if (!canEdit) {
      setError("You do not have access permission to edit employee details.");
      return;
    }
    navigate(`/employee/${emp._id || emp.id}/edit`);
  };
  const handleDelete = (emp) => {
    if (!canDelete) {
      setError("You do not have access permission to delete employee details.");
      return;
    }
    setDeleteTarget(emp);
  };
  const handleAdd = () => {
    if (!canEdit) {
      setError("You do not have access permission to add a new employee.");
      return;
    }
    navigate("/employee/add");
  };

  return (
    <div className="emp-page">
      <div className="emp-page-header">
        <div className="emp-page-header-text">
          <h1>Employee Directory</h1>

          <p>
            Manage your global workforce of {stats.total.toLocaleString()}{" "}
            employees.
          </p>
        </div>

        <div className="emp-header-actions">
          {isAdmin && (
            <>
              <button
                className="emp-btn-secondary"
                onClick={() => navigate("/employee/departments")}
                title="Manage Departments"
              >
                <FiLayers />
                Departments
              </button>

              <button
                className="emp-btn-secondary"
                onClick={() => navigate("/employee/roles")}
                title="Manage Roles"
              >
                <FiShield />
                Roles
              </button>
            </>
          )}

          {canEdit && (
            <button
              className="emp-btn-primary"
              onClick={handleAdd}
              id="add-employee-btn"
            >
              <FiUserPlus />
              Add New Employee
            </button>
          )}
        </div>
      </div>

      {error && <div className="emp-alert error">{error}</div>}
      {deleteSuccess && (
        <div className="emp-alert success">{deleteSuccess}</div>
      )}

      <div className="emp-stats-row">
        <StatCard
          icon={<FiUsers size={22} />}
          label="Total Employees"
          value={stats.total}
          colorClass="purple"
        />
        <StatCard
          icon={<FiCheckCircle size={22} />}
          label="Active"
          value={stats.active}
          colorClass="blue"
        />
        <StatCard
          icon={<FiCalendar size={22} />}
          label="On Leave"
          value={stats.onLeave}
          colorClass="yellow"
        />
        <StatCard
          icon={<FiSlash size={22} />}
          label="Terminated"
          value={stats.terminated}
          colorClass="red"
        />
      </div>

      <EmployeeTable
        employees={employees}
        totalEmployees={totalEmployees}
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={PAGE_SIZE}
        search={search}
        status={status}
        deptFilter={deptFilter}
        departments={departments}
        onSearch={handleSearch}
        onStatus={handleStatus}
        onDeptFilter={handleDept}
        onPage={setCurrentPage}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        canEdit={canEdit}
        canDelete={canDelete}
        loading={loading}
      />

      {deleteTarget && (
        <ConfirmDialog
          employee={deleteTarget}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}

      <footer className="emp-footer">
        <div>© 2026 IT Spaxios Innovation. All rights reserved.</div>
      </footer>
    </div>
  );
}
