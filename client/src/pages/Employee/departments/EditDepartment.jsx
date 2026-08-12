import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import DepartmentForm from "../../../components/department/DepartmentForm";

import {
  getDepartmentById,
  updateDepartment,
} from "../../../services/departmentService";
import { useToast } from "../../../context/ToastContext";

import "../department-role.css";

export default function EditDepartment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [department, setDepartment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchDepartment = async () => {
      try {
        const res = await getDepartmentById(id);
        setDepartment(res.data || res);
      } catch (err) {
        showToast("error", err.message || "Failed to load department");
      } finally {
        setLoading(false);
      }
    };

    fetchDepartment();
  }, [id]);

  const handleUpdate = async (formData) => {
    try {
      setSaving(true);

      await updateDepartment(id, formData);

      showToast("success", "Department updated successfully.");

      navigate("/employee/departments");
    } catch (err) {
      showToast("error", err.message || "Failed to update department");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <h3>Loading...</h3>
      </div>
    );
  }

  return (
    <div className="page">

      <div className="page-header">
        <div>
          <h2>Edit Department</h2>
          <p>Update department information.</p>
        </div>
      </div>

      <DepartmentForm
        title="Edit Department"
        initialData={department}
        loading={saving}
        onSubmit={handleUpdate}
        onCancel={() => navigate("/employee/departments")}
      />

    </div>
  );
}