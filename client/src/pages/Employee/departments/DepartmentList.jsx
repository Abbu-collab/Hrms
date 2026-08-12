import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../../context/ToastContext.jsx";

import DepartmentTable from "../../../components/department/DepartmentTable";

import {
  getDepartments,
  deleteDepartment,
} from "../../../services/departmentService";

import "../department-role.css";

export default function DepartmentList() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const loadDepartments = async () => {
    try {
      setLoading(true);

      const res = await getDepartments();

      setDepartments(res.data || res);
    } catch (err) {
      setMessage(err.message || "Failed to load departments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  const handleEdit = (department) => {
    navigate(`/employee/departments/edit/${department._id}`);
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this department?",
    );

    if (!confirmDelete) return;

    try {
      await deleteDepartment(id);

      const msg = "Department deleted successfully.";
      setMessage(msg);
      showToast('success', msg);

      loadDepartments();

      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch (err) {
      const errMsg = err.message || "Failed to delete department";
      setMessage(errMsg);
      showToast('error', errMsg);
    }
  };

  return (

    <div className="page">
      <div className="page-header">
        <div>
          <button
            className="btn-secondary"
            style={{ marginBottom: "15px" }}
            onClick={() => navigate("/employee")}
          >
            ← Back to Directory
          </button>

          <h2>Departments</h2>
          <p>Manage all company departments.</p>
        </div>

        <button
          className="btn-primary"
          onClick={() => navigate("/employee/departments/add")}
        >
          + Add Department
        </button>
      </div>

      {message && <div className="success-message">{message}</div>}

      <div className="table-card">
        <DepartmentTable
          departments={departments}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}
