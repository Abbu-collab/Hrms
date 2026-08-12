import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import RoleForm from "../../../components/role/RoleForm";

import {
  getRoleById,
  updateRole,
} from "../../../services/roleService";
import { useToast } from "../../../context/ToastContext";

import "../department-role.css";

export default function EditRole() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const res = await getRoleById(id);
        setRole(res.data || res);
      } catch (err) {
        showToast("error", err.message || "Failed to load role");
      } finally {
        setLoading(false);
      }
    };

    fetchRole();
  }, [id]);

  const handleUpdate = async (formData) => {
    try {
      setSaving(true);

      await updateRole(id, formData);

      showToast("success", "Role updated successfully.");

      navigate("/employee/roles");
    } catch (err) {
      showToast("error", err.message || "Failed to update role");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title">
          <h2>Edit Role</h2>
          <p>Update role information.</p>
        </div>
      </div>

      <RoleForm
        initialData={role}
        loading={saving}
        onSubmit={handleUpdate}
        onCancel={() => navigate("/employee/roles")}
      />
    </div>
  );
}